const axios = require('axios');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }
 
  try {
    const { orderID } = JSON.parse(event.body);
 
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
 
    // Step 1: Get access token
const tokenRes = await axios.post(
'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
 
    const accessToken = tokenRes.data.access_token;
 
    // Step 2: Capture the order
const captureRes = await axios.post(
`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
 
    const paymentInfo = captureRes.data;
    console.log('✅ Order Captured:', paymentInfo);
 
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        transactionId: paymentInfo.purchase_units[0].payments.captures[0].id,
        payerEmail: paymentInfo.payer.email_address,
      }),
    };
  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to confirm PayPal order',
        details: error.response?.data || error.message,
      }),
    };
  }
};