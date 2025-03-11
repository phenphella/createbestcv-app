const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    const { email, cvContent, coverLetterContent, transactionId } = data;

    if (!email || !cvContent || !coverLetterContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.VITE_EMAIL_HOST,
      port: process.env.VITE_EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.VITE_EMAIL_USER,
        pass: process.env.VITE_EMAIL_PASSWORD,
      },
    });

    // Create PDF attachments (in a real implementation)
    // For this example, we'll just send the content as text

    // Send the email
    const info = await transporter.sendMail({
      from: `"CV Optimizer" <${process.env.VITE_EMAIL_FROM}>`,
      to: email,
      subject: 'Your Tailored CV and Cover Letter',
      text: `Thank you for your purchase (Transaction ID: ${transactionId}).\n\nAttached are your tailored CV and cover letter. We hope they help you land your dream job!\n\nBest regards,\nThe CV Optimizer Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Your Tailored CV and Cover Letter</h2>
          <p>Thank you for your purchase (Transaction ID: ${transactionId}).</p>
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
        },
      ],
    });

    // Return success
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
      }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};