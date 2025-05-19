import jwt from 'jsonwebtoken';

const secret = '3a2c4b5e6d7e8f6g0h1i2j3k4l3m6n7o8p9q0r1s2t3u4dgfr6433t63v5w6x7y8z9a0b1c2d7';
const data = {
  merchantId: '508029',
  accountId: '512321',
  description: 'Compra de prueba',
  referenceCode: 'TestPayU_123456789',
  amount: '1000',
  tax: '100',
  taxReturnBase: '900',
  currency: 'COP',
  buyerEmail: 'test@test.com',
  responseUrl: 'http://localhost:3000/thx',
  confirmationUrl: 'http://localhost:3000/api/payu',
  shippingAddress: '123 Test St',
  shippingCity: 'Test City',
  shippingCountry: 'CO',
  additionalValues: JSON.stringify({
    ITEMS_JSON: JSON.stringify([]),
    SHIPPING_ADDRESS: JSON.stringify({
      address: '123 Test St',
      city: 'Test City',
      province: 'Test Province',
    }),
  }),
};

try {
  const token = jwt.sign(data, secret, {
    expiresIn: '1h',
  });
  console.log('Generated token:', token);
} catch (error) {
  console.error('Error generating token:', error);
}
