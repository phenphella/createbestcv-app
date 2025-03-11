# CV Optimizer

A professional web application that helps job seekers create tailored CVs and cover letters optimized for specific job descriptions using AI.

## Features

- Upload existing CV or create a new one from scratch
- Analyze job descriptions to identify key requirements
- Generate tailored CVs and cover letters in multiple styles
- Download documents in PDF or RTF format
- Secure payment processing with Stripe
- Email delivery of generated documents

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- OpenAI API for CV and cover letter generation
- Stripe for payment processing
- Netlify for hosting and serverless functions

## Custom Domain Setup

The application is configured to use a custom domain. To set up your custom domain:

1. Purchase your domain (e.g., cvoptimizer.com) from a domain registrar
2. Add the domain in your Netlify site settings:
   - Go to Site settings > Domain management > Add custom domain
   - Enter your domain name and follow the verification steps
3. Configure DNS settings at your domain registrar:
   - Add CNAME record pointing to your Netlify site
   - Or use Netlify DNS for complete management

## Monitoring and Analytics

The application includes comprehensive monitoring and analytics:

- Google Analytics for user behavior tracking
- Custom event tracking for conversions and user interactions
- Health monitoring endpoint for application status
- Error tracking and reporting

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@cvoptimizer.com

# OpenAI API key
OPENAI_API_KEY=sk_your_openai_api_key

# Google Analytics ID
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Custom domain
CUSTOM_DOMAIN=cvoptimizer.com
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is configured for deployment on Netlify. Connect your GitHub repository to Netlify for automatic deployments.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.