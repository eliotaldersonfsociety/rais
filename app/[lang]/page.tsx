'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getExchangeRates } from '@/lib/currency';
import Link from 'next/link';

const CurrencyCard = ({ lang, currency }: { lang: string; currency: string }) => (
  <Link
    href={`/${lang}`}
    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
  >
    <h3 className="font-bold">{currency}</h3>
    <p className="text-sm text-gray-600">{lang}</p>
  </Link>
);

export default function Page() {
  const params = useParams();
  const [currencyData, setCurrencyData] = useState<{
    language: string;
    region: string;
    currency: string;
    locale: string;
    rates: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const basePrice = 29.99;

  useEffect(() => {
    const loadData = async () => {
      try {
        const langParam = Array.isArray(params.lang) ? params.lang[0] : params.lang || 'en-US';
        
        if (!langParam.includes('-')) {
          throw new Error('Formato de idioma inválido');
        }

        const [language, region] = langParam.split('-');
        const currency = region?.toUpperCase() || 'USD';
        const locale = langParam.replace('_', '-');
        
        const ratesResponse = await getExchangeRates();
        
        // Validación extensa de tasas
        if (!ratesResponse?.rates || typeof ratesResponse.rates !== 'object') {
          throw new Error('Formato de respuesta inválido');
        }
        
        const rate = Number(ratesResponse.rates[currency]);
        if (isNaN(rate)) {
          throw new Error(`Tasa no numérica para ${currency}`);
        }

        setCurrencyData({
          language,
          region,
          currency,
          locale,
          rates: ratesResponse.rates
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Depuración - Error:', err);
      }
    };

    loadData();
  }, [params.lang]);

  const formatCurrency = (value: number) => {
    if (!currencyData) return '...';
    
    try {
      const numericValue = Number(value);
      if (isNaN(numericValue)) return 'Valor inválido';

      return new Intl.NumberFormat(currencyData.locale, {
        style: 'currency',
        currency: currencyData.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numericValue);
    } catch {
      return `${value} ${currencyData.currency}`;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!currencyData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calcular precio de forma segura
  const rate = currencyData.rates[currencyData.currency] || 1;
  const calculatedPrice = basePrice * rate;
  const finalPrice = isNaN(calculatedPrice) ? 0 : calculatedPrice;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Prueba de Monedas</h1>
      
      <div className="mb-8">
        <p className="text-xl">
          Precio base (USD): ${basePrice.toFixed(2)}
        </p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(finalPrice)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Tasa actual: 1 USD = {rate.toFixed(2)} {currencyData.currency}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CurrencyCard lang="es-CO" currency="COP" />
        <CurrencyCard lang="es-MX" currency="MXN" />
        <CurrencyCard lang="en-US" currency="USD" />
        <CurrencyCard lang="pt-BR" currency="BRL" />
      </div>
    </div>
  );
}