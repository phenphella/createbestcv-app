// Google Analytics implementation
export const initializeAnalytics = () => {
  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX'}`;
  document.head.appendChild(script);

  // Initialize Google Analytics
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX');

  // Add to window for TypeScript
  window.gtag = gtag;
};

// Track page views
export const trackPageView = (path: string, title: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track conversions
export const trackConversion = (transactionId: string, value: number) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'GBP',
      items: [
        {
          id: 'cv-cover-letter',
          name: 'Tailored CV and Cover Letter',
          price: value,
          quantity: 1,
        },
      ],
    });
  }
};

// Track errors
export const trackError = (errorMessage: string, errorSource: string) => {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `${errorSource}: ${errorMessage}`,
      fatal: false,
    });
  }
};