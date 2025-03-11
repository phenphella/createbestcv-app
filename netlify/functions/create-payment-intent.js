const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    const { amount, currency = 'gbp', email } = data;

    // Log request data for debugging
    console.log('Function invoked with data:', { amount, currency, email });

    // Validate the amount
    if (!amount || amount < 0.5) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: 'Invalid amount' }),
      };
    }

    // Log Stripe key presence (not the actual key)
    console.log('Stripe key present:', !!process.env.VITE_STRIPE_SECRET_KEY);

    if (!process.env.VITE_STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/pennies
      currency,
      receipt_email: email,
      payment_method_types: ['card'],
      metadata: {
        product: 'CV Optimizer - Tailored CV and Cover Letter',
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Return the client secret
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ 
        error: error.message,
        type: error.type,
        code: error.code 
      }),
    };
  }
};