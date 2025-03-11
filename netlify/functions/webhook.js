const axios = require('axios');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const body = event.body;

  const headers = event.headers;

  // Step 1: Get OAuth token from PayPal
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  let accessToken;
  try {
    const tokenRes = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    accessToken = tokenRes.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'PayPal token request failed' }),
    };
  }

  // Step 2: Verify webhook signature
  const verificationPayload = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  };

  try {
    const verifyRes = await axios.post(
      'https://api-m.paypal.com/v1/notifications/verify-webhook-signature',
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (verifyRes.data.verification_status !== 'SUCCESS') {
      console.warn('Webhook verification failed:', verifyRes.data);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Webhook verification failed' }),
      };
    }

    const eventBody = verificationPayload.webhook_event;

    // Step 3: Handle the actual event
    switch (eventBody.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        const payment = eventBody.resource;
        const customerEmail = payment.payer.email_address;
        console.log('✅ Payment confirmed:', payment.id);

        // Send confirmation email
        if (customerEmail) {
          try {
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST,
              port: process.env.EMAIL_PORT,
              secure: true,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
              },
            });

            await transporter.sendMail({
              from: `"CV Optimizer" <${process.env.EMAIL_FROM}>`,
              to: customerEmail,
              subject: 'Payment Confirmation - CV Optimizer',
              html: `
                <h2>Thank you for your payment</h2>
                <p>Transaction ID: ${payment.id}</p>
                <p>Your CV and cover letter are now ready to download from your account.</p>
              `,
            });

            console.log(`Email sent to: ${customerEmail}`);
          } catch (emailError) {
            console.error('Error sending email:', emailError);
          }
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        console.warn('❌ Payment denied');
        break;

      default:
        console.log(`Unhandled event type: ${eventBody.event_type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'Webhook handled successfully' }),
    };

  } catch (error) {
    console.error('Error verifying webhook or sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};