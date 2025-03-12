import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, FileText, Mail, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useCV } from '../context/CVContext';
import StyledCVPreview from '../components/StyledCVPreview';
import ExamplePreview from '../components/ExamplePreview';
import { generateDocument } from '../services/documentGenerator';
import { trackEvent, trackConversion, trackError } from '../services/analytics';
import { getFormattedPrice } from '../services/paymentConfig';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedOption, generatedOptions } = useCV();
  const [previewType, setPreviewType] = useState<'cv' | 'coverLetter'>('cv');
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState<{
    type: 'cv' | 'coverLetter';
    format: 'pdf' | 'docx';
  } | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    type: 'cv' | 'coverLetter';
    format: 'pdf' | 'docx';
  } | null>(null);
  const [useExamplePreviews, setUseExamplePreviews] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setVerifyingPayment(true);
        
        // Get PayPal parameters from URL
        const token = searchParams.get('token');
        const payerId = searchParams.get('PayerID');
        // Confirm PayPal order
const confirmRes = await fetch('/.netlify/functions/confirm-paypal-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderID: token }),
});
 
const confirmData = await confirmRes.json();
if (!confirmData.success) {
  throw new Error(confirmData.error || 'Order confirmation failed');
}
 
// Save confirmed data
sessionStorage.setItem('transactionId', confirmData.transactionId);
sessionStorage.setItem('userEmail', confirmData.payerEmail);
 
setTransactionId(confirmData.transactionId);
setUserEmail(confirmData.payerEmail);
        
        if (!token || !payerId) {
          // Check session storage for transaction details
          const storedTransactionId = sessionStorage.getItem('transactionId');
          const storedPaymentMethod = sessionStorage.getItem('paymentMethod');
          const storedEmail = sessionStorage.getItem('userEmail');
          
          if (!storedTransactionId || !storedEmail) {
            // No payment verification data found
            navigate('/payment');
            return;
          }
          
          setTransactionId(storedTransactionId);
          setPaymentMethod(storedPaymentMethod || 'paypal');
          setUserEmail(storedEmail);
          
          // Track conversion
          trackConversion(storedTransactionId, 1.99);
          
          // Simulate email sending in demo mode
          setTimeout(() => {
            console.log('Demo: Email sent to', storedEmail);
            setEmailSent(true);
          }, 2000);
        } else {
          // Store PayPal details
          sessionStorage.setItem('paypalToken', token);
          sessionStorage.setItem('paypalPayerId', payerId);
          
          // Track PayPal conversion
          trackConversion(token, 1.99);
        }
        
        // Check if we have real generated content
        if (generatedOptions.length > 0 && selectedOption !== null) {
          setUseExamplePreviews(false);
          
          // Store the selected CV and cover letter for email
          const selectedCV = generatedOptions.find(opt => opt.id === selectedOption);
          if (selectedCV) {
            sessionStorage.setItem('selectedCV', selectedCV.cv);
            sessionStorage.setItem('selectedCoverLetter', selectedCV.coverLetter);
          }
        }
        
        // Track page view with custom dimensions
        trackEvent('Purchase', 'Purchase Complete', paymentMethod, 1.99);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setDownloadError('Error verifying payment. Please contact support.');
      } finally {
        setVerifyingPayment(false);
      }
    };
    
    verifyPayment();
  }, [navigate, searchParams, generatedOptions, selectedOption, paymentMethod]);

  const handleDownload = async (type: 'cv' | 'coverLetter', format: 'pdf' | 'docx') => {
    try {
      setDownloading({ type, format });
      setDownloadError(null);
      setDownloadSuccess(null);
      
      // Track download attempt
      trackEvent('Document', 'Download Attempt', `${type}-${format}`);
      
      // For example previews, use the example content
      let content = '';
      
      if (useExamplePreviews) {
        // Generate example content based on the type
        content = type === 'cv' ? fallbackCV.cv : fallbackCV.coverLetter;
      } else if (selectedOption !== null && generatedOptions.length > 0) {
        // Use the selected CV from generated options
        const selectedCV = generatedOptions.find(opt => opt.id === selectedOption);
        if (selectedCV) {
          content = type === 'cv' ? selectedCV.cv : selectedCV.coverLetter;
        } else {
          throw new Error(`No ${type === 'cv' ? 'CV' : 'Cover Letter'} content found for the selected option`);
        }
      } else {
        // Fallback to example content
        content = type === 'cv' ? fallbackCV.cv : fallbackCV.coverLetter;
      }
      
      if (!content || content.trim() === '') {
        throw new Error(`No content available for ${type === 'cv' ? 'CV' : 'Cover Letter'}`);
      }
      
      // Generate the file name
      const fileName = `${type === 'cv' ? 'CV' : 'Cover_Letter'}_${new Date().toISOString().split('T')[0]}`;
      
      // Generate and download the document
      const success = await generateDocument(content, { type, format }, fileName);
      
      if (!success) {
        throw new Error(`Failed to generate ${format.toUpperCase()} file`);
      }
      
      // Track successful download
      trackEvent('Document', 'Download Success', `${type}-${format}`);
      
      // Set download success state
      setDownloadSuccess({ type, format });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(null);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
      setDownloadError(`Error downloading ${format.toUpperCase()}. Please try again.`);
      trackError(`Error downloading ${format.toUpperCase()}`, 'Document Generation');
      return false;
    } finally {
      setDownloading(null);
    }
  };

  const togglePreview = (type: 'cv' | 'coverLetter') => {
    setPreviewType(type);
    setShowPreview(!showPreview || previewType !== type);
    trackEvent('UI Interaction', 'Toggle Preview', type);
  };

  // Get style based on the selected option
  const getStyleForExamplePreview = () => {
    if (!selectedOption) return 'professional';
    
    switch (selectedOption) {
      case 1: return 'professional';
      case 2: return 'skills-based';
      case 3: return 'concise';
      default: return 'professional';
    }
  };

  if (verifyingPayment) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-indigo-600" />
          <h1 className="text-3xl font-bold mb-4">Verifying Payment</h1>
          <p className="text-gray-600">
            Please wait while we verify your payment and prepare your documents...
          </p>
        </div>
      </div>
    );
  }

  // Fallback content if no selected CV is found
  const fallbackCV = {
    id: 1,
    title: "Professional CV",
    description: "Standard professional format",
    cv: `[Example CV content would go here]`,
    coverLetter: `[Example cover letter content would go here]`
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600">
          Your tailored CV and cover letter are ready to download
        </p>
        {transactionId && (
          <p className="text-sm text-gray-500 mt-2">
            Transaction ID: {transactionId} • Payment Method: {paymentMethod === 'card' ? 'Credit Card' : 'PayPal'}
          </p>
        )}
        {useExamplePreviews && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 inline-block">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> These are example documents for demonstration purposes. Your actual documents are tailored to your information and the job description you provided.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Your Downloads</h2>
        
        {downloadError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p>{downloadError}</p>
              <p className="text-sm mt-1">Try downloading in PDF format instead, or contact support if the issue persists.</p>
            </div>
          </div>
        )}
        
        {downloadSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
            <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <p>
              {downloadSuccess.type === 'cv' ? 'CV' : 'Cover Letter'} successfully downloaded as {downloadSuccess.format === 'docx' ? 'RTF' : 'PDF'}!
              {downloadSuccess.format === 'docx' && (
                <span className="block text-sm mt-1">
                  RTF files can be opened with Microsoft Word, Google Docs, or any word processor.
                </span>
              )}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={24} className="text-indigo-600 mr-3" />
              <div>
                <h3 className="font-medium">Tailored CV</h3>
                <p className="text-sm text-gray-500">Professional Format</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => togglePreview('cv')}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center"
              >
                <Eye size={16} className="mr-1" />
                Preview
              </button>
              <button 
                onClick={() => handleDownload('cv', 'pdf')}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center"
                disabled={downloading !== null}
              >
                {downloading?.type === 'cv' && downloading?.format === 'pdf' ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                PDF
              </button>
              <button 
                onClick={() => handleDownload('cv', 'docx')}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center"
                disabled={downloading !== null}
              >
                {downloading?.type === 'cv' && downloading?.format === 'docx' ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                RTF
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={24} className="text-indigo-600 mr-3" />
              <div>
                <h3 className="font-medium">Cover Letter</h3>
                <p className="text-sm text-gray-500">Professional Format</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => togglePreview('coverLetter')}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center"
              >
                <Eye size={16} className="mr-1" />
                Preview
              </button>
              <button 
                onClick={() => handleDownload('coverLetter', 'pdf')}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center"
                disabled={downloading !== null}
              >
                {downloading?.type === 'coverLetter' && downloading?.format === 'pdf' ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                PDF
              </button>
              <button 
                onClick={() => handleDownload('coverLetter', 'docx')}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center"
                disabled={downloading !== null}
              >
                {downloading?.type === 'coverLetter' && downloading?.format === 'docx' ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                RTF
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-sm flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Your documents are professionally formatted with beautiful styling and layout. 
              RTF files can be opened with Microsoft Word, Google Docs, or other word processors for easy editing.
              PDF files provide consistent formatting across all devices.
            </span>
          </p>
        </div>
        
        {showPreview && (
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-indigo-700">
                {previewType === 'cv' ? 'CV Preview' : 'Cover Letter Preview'}
              </h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              {useExamplePreviews ? (
                <ExamplePreview 
                  type={previewType} 
                  style={getStyleForExamplePreview()} 
                />
              ) : (
                <StyledCVPreview 
                  content={previewType === 'cv' ? 
                    (selectedOption !== null && generatedOptions.length > 0 ? 
                      generatedOptions.find(opt => opt.id === selectedOption)?.cv || fallbackCV.cv : 
                      fallbackCV.cv) : 
                    (selectedOption !== null && generatedOptions.length > 0 ? 
                      generatedOptions.find(opt => opt.id === selectedOption)?.coverLetter || fallbackCV.coverLetter : 
                      fallbackCV.coverLetter)
                  }
                  type={previewType}
                />
              )}
            </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-green-50 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li className="flex items-start">
              <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Submit your tailored CV and cover letter to your target job</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Prepare for interviews using the key skills highlighted in your CV</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Come back anytime to generate new CVs for different job applications</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <Mail size={24} className="text-indigo-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-indigo-800 mb-1">Email Status</h3>
            {emailSent ? (
              <p className="text-sm text-indigo-700">
                We've sent a copy of your downloads to {userEmail || "your email address"}. If you don't see it, please check your spam folder.
              </p>
            ) : (
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin mr-2 text-indigo-600" />
                <p className="text-sm text-indigo-700">
                  Sending documents to {userEmail || "your email address"}...
                </p>
              </div>
            )}
            <p className="text-xs text-indigo-600 mt-2">
              <strong>Demo Mode:</strong> In this demo, no actual email is sent. In production, you would receive an email with your documents.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors inline-block"
          onClick={() => trackEvent('Navigation', 'Home Button', 'From Success Page')}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Success;