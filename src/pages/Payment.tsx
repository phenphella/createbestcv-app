import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Info, Mail } from 'lucide-react';
import { useCV } from '../context/CVContext';
import { processPayment } from '../services/payment';
import { paymentConfig, getFormattedPrice } from '../services/paymentConfig';
import { trackEvent, trackError } from '../services/analytics';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { selectedOption } = useCV();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBankInfo, setShowBankInfo] = useState(false);

  // Redirect if no CV selected
  if (!selectedOption) {
    navigate('/generated-results');
    return null;
  }

  const handlePayPalApproval = async (data: any, actions: any) => {
    if (!email) {
      setError('Please enter your email address to receive your documents.');
      return actions.reject();
    }

    try {
      setLoading(true);
      setError(null);

      // Capture the PayPal order
      const orderData = await actions.order.capture();

      // Process the payment and send documents
      const result = await processPayment({
        email,
        orderId: orderData.id,
        payerId: orderData.payer.payer_id
      });

      if (result.success) {
        // Track successful payment
        trackEvent('Payment', 'Payment Success', 'PayPal', 1.99);

        // Store transaction details
        sessionStorage.setItem('transactionId', orderData.id);
        sessionStorage.setItem('paymentMethod', 'paypal');
        sessionStorage.setItem('userEmail', email);

        // Navigate to success page
        navigate('/success');
        return true;
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An unexpected error occurred. Please try again.');
      trackError('Payment processing error', 'PayPal Payment');
      return actions.reject();
    } finally {
      setLoading(false);
    }
  };

  const toggleBankInfo = () => {
    setShowBankInfo(!showBankInfo);
    trackEvent('UI Interaction', 'Toggle Bank Info', showBankInfo ? 'Hide' : 'Show');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Payment</h1>
        <p className="text-gray-600">
          Complete your payment to download your tailored CV and cover letter
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <span className="text-xl font-bold text-indigo-700">{getFormattedPrice()}</span>
        </div>

        <div className="border-t border-b py-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{paymentConfig.product.name}</p>
              <p className="text-sm text-gray-600">Professionally optimized for your target job</p>
            </div>
            <span className="font-medium">{getFormattedPrice()}</span>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-md mb-6">
          <h3 className="font-medium text-green-800">What's included:</h3>
          <ul className="text-sm text-green-700 mt-1 space-y-1">
            <li>• Professionally tailored CV</li>
            <li>• Matching cover letter</li>
            <li>• Download in PDF and Word formats</li>
            <li>• Use for unlimited job applications</li>
            <li>• Optimized with AI to match job requirements</li>
          </ul>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={toggleBankInfo}
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
          >
            <Info size={16} className="mr-1" />
            {showBankInfo ? 'Hide merchant details' : 'View merchant details'}
          </button>
          <p className="text-sm text-gray-500">Secure payment processing</p>
        </div>

        {showBankInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Merchant Information</h3>
            <p className="text-sm text-gray-600 mb-1">Business Name: {paymentConfig.business.name}</p>
            <p className="text-sm text-gray-600 mb-1">Business Email: {paymentConfig.business.email}</p>
            <p className="text-sm text-gray-600">Website: {paymentConfig.business.website}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                All payments are processed securely through PayPal. Your payment information is never stored on our servers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Address Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Mail size={20} className="text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold">Delivery Email</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            We'll send your CV and cover letter to this email address. We don't store your email after sending the documents.
          </p>
        </div>
      </div>

      {/* PayPal Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Payment</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 size={24} className="animate-spin text-indigo-600 mr-2" />
            <span>Processing payment...</span>
          </div>
        ) : (
          <PayPalScriptProvider options={{
            "client-id": paymentConfig.paypal.clientId,
            currency: paymentConfig.paypal.currency
          }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              disabled={!email}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: "1.99"
                    }
                  }]
                });
              }}
              onApprove={handlePayPalApproval}
              onError={(err) => {
                console.error('PayPal error:', err);
                setError('Payment failed. Please try again.');
                trackError('PayPal payment error', 'Payment');
              }}
              onCancel={() => {
                setError('Payment cancelled. Please try again when you\'re ready.');
                trackEvent('Payment', 'Payment Cancelled', 'PayPal');
              }}
            />
          </PayPalScriptProvider>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <Info size={16} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              Your payment of {getFormattedPrice()} will be securely processed through PayPal.
              You can pay using your PayPal account or any major credit/debit card.
              All payment information is encrypted and protected.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => {
            navigate('/generated-results');
            trackEvent('Navigation', 'Back Button', 'From Payment to Generated Results');
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Payment;