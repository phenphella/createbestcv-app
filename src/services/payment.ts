import axios from 'axios';

// Types for payment processing
export interface PaymentDetails {
  email: string;
  orderId?: string;
  payerId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Basic email validator
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Process payment function
export const processPayment = async (
  paymentDetails: PaymentDetails
): Promise<PaymentResult> => {
  try {
    if (!validateEmail(paymentDetails.email)) {
      return {
        success: false,
        error: 'Invalid email address',
      };
    }

    // Get selected CV and cover letter from session storage
    const selectedCV = sessionStorage.getItem('selectedCV');
    const selectedCoverLetter = sessionStorage.getItem('selectedCoverLetter');

    if (!selectedCV || !selectedCoverLetter) {
      console.warn('CV or cover letter not found in session storage, using demo content');
      // Use demo content for testing
      const demoCV = "This is a demo CV content";
      const demoCoverLetter = "This is a demo cover letter content";
      
      // Store demo content in session storage
      sessionStorage.setItem('selectedCV', demoCV);
      sessionStorage.setItem('selectedCoverLetter', demoCoverLetter);
    }

    // Send data to serverless function
    const response = await axios.post('/.netlify/functions/process-payment', {
      orderID: paymentDetails.orderId,
      payerEmail: paymentDetails.email,
      cvContent: selectedCV || "Demo CV content",
      coverLetterContent: selectedCoverLetter || "Demo cover letter content"
    });

    // Store transaction details in session storage
    if (response.data.success) {
      sessionStorage.setItem('transactionId', response.data.transactionId);
      sessionStorage.setItem('paymentMethod', 'paypal');
      sessionStorage.setItem('userEmail', paymentDetails.email);
    }

    return {
      success: response.data.success,
      transactionId: response.data.transactionId,
      error: response.data.error
    };
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Unexpected error occurred',
    };
  }
};