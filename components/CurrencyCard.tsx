import Link from 'next/link';

interface CurrencyCardProps {
  lang: string;
  currency: string;
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({ lang, currency }) => {
  return (
    <Link
      href={`/${lang}`}
      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-bold">{currency}</h3>
      <p className="text-sm text-gray-600">{lang}</p>
    </Link>
  );
};

export default CurrencyCard;
