// Monitoring function to track application health
exports.handler = async (event) => {
  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Check API key for security
    const apiKey = event.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.VITE_MONITORING_API_KEY) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Get application status
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        stripe: checkStripeStatus(),
        email: checkEmailStatus(),
        openai: checkOpenAIStatus(),
      },
    };

    // Return status
    return {
      statusCode: 200,
      body: JSON.stringify(status),
    };
  } catch (error) {
    console.error('Error in monitoring function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

// Check Stripe status
function checkStripeStatus() {
  // In a real implementation, you would make a test API call to Stripe
  return {
    status: process.env.VITE_STRIPE_SECRET_KEY ? 'connected' : 'not_configured',
    lastChecked: new Date().toISOString(),
  };
}

// Check email status
function checkEmailStatus() {
  // In a real implementation, you would test the email connection
  return {
    status: process.env.VITE_EMAIL_HOST && process.env.VITE_EMAIL_USER ? 'connected' : 'not_configured',
    lastChecked: new Date().toISOString(),
  };
}

// Check OpenAI status
function checkOpenAIStatus() {
  // In a real implementation, you would make a test API call to OpenAI
  return {
    status: process.env.VITE_OPENAI_API_KEY ? 'connected' : 'not_configured',
    lastChecked: new Date().toISOString(),
  };
}