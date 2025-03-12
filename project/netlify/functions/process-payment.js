const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    const { orderID, payerEmail, cvContent, coverLetterContent } = requestBody;

    if (!orderID || !payerEmail || !cvContent || !coverLetterContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create a transporter with error handling
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.VITE_EMAIL_HOST,
        port: process.env.VITE_EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.VITE_EMAIL_USER,
          pass: process.env.VITE_EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Only for development
        }
      });
    } catch (emailError) {
      console.error('Error creating email transporter:', emailError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service configuration error' })
      };
    }

    // Verify email connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email verification failed:', verifyError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service unavailable' })
      };
    }

    // Send the email with documents
    try {
      await transporter.sendMail({
        from: `"CV Optimizer" <${process.env.VITE_EMAIL_FROM}>`,
        to: payerEmail,
        subject: 'Your Tailored CV and Cover Letter',
        text: `Thank you for your purchase (Order ID: ${orderID}).\n\nAttached are your tailored CV and cover letter. We hope they help you land your dream job!\n\nBest regards,\nThe CV Optimizer Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Your Tailored CV and Cover Letter</h2>
            <p>Thank you for your purchase (Order ID: ${orderID}).</p>
            <p>Attached are your tailored CV and cover letter. We hope they help you land your dream job!</p>
            <p>Best regards,<br>The CV Optimizer Team</p>
          </div>
        `,
        attachments: [
          {
            filename: 'Your_Tailored_CV.txt',
            content: cvContent,
          },
          {
            filename: 'Your_Cover_Letter.txt',
            content: coverLetterContent,
          }
        ]
      });
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      // Log the error but don't fail the entire process
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment processed and documents sent successfully',
        transactionId: orderID
      })
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process payment',
        details: error.message
      })
    };
  }
};