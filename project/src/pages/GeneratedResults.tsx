import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Check, Loader2, AlertCircle, Eye, Lock, ArrowLeft, ArrowRight, Sparkles, Award, Briefcase } from 'lucide-react';
import { useCV } from '../context/CVContext';
import ExamplePreview from '../components/ExamplePreview';
import { getFormattedPrice } from '../services/paymentConfig';

const GeneratedResults: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cvData,
    jobDescription,
    generatedOptions, 
    isLoading, 
    setIsLoading, 
    selectedOption, 
    setSelectedOption,
    generateResults
  } = useCV();
  const [activeTab, setActiveTab] = useState<'cv' | 'coverLetter'>('cv');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Generate results when the component mounts
  useEffect(() => {
    const fetchResults = async () => {
      if (generatedOptions.length === 0 && !isLoading) {
        try {
          setError(null);
          setIsLoading(true);
          
          // Validate that we have the necessary data
          if (!cvData.personalInfo.fullName) {
            navigate('/create-cv');
            return;
          }
          
          if (!jobDescription) {
            navigate('/job-description');
            return;
          }
          
          const results = await generateResults();
          console.log("Generated results:", results);
          
          if (!results || results.length === 0) {
            throw new Error("No results were generated. Please try again.");
          }
          
        } catch (error) {
          console.error('Error generating results:', error);
          setError('There was an error generating your CV. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchResults();
  }, [retryCount, cvData, jobDescription, generatedOptions.length, isLoading, navigate, generateResults]);

  const handleSelectOption = (id: number) => {
    setSelectedOption(id);
  };

  const handleContinue = () => {
    if (selectedOption !== null) {
      navigate('/payment');
    }
  };

  const handleRetry = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating results:', error);
      setError('There was an error generating your CV. Please try again.');
      setIsLoading(false);
    }
  };

  // Get style name for example preview based on option ID
  const getStyleForExamplePreview = (optionId: number): 'professional' | 'skills-based' | 'concise' => {
    switch (optionId) {
      case 1: return 'professional';
      case 2: return 'skills-based';
      case 3: return 'concise';
      default: return 'professional';
    }
  };

  // CV style options
  const styleOptions = [
    {
      id: 1,
      title: "Professional & Formal",
      description: "Standard structure with a professional tone. Features clear section headers, comprehensive details, and a chronological format. Ideal for traditional industries and experienced professionals.",
      icon: <Briefcase size={24} className="text-indigo-600" />
    },
    {
      id: 2,
      title: "Skills & Achievement-Based",
      description: "Emphasizes skills and accomplishments with key achievements highlighted. Uses a skills-first approach with metrics and focuses on results. Perfect for competitive roles where achievements matter.",
      icon: <Award size={24} className="text-indigo-600" />
    },
    {
      id: 3,
      title: "Concise & Impactful",
      description: "A streamlined, to-the-point format with strategic bolding of important elements. Uses concise language with high-impact statements. Great for busy hiring managers and modern industries.",
      icon: <Sparkles size={24} className="text-indigo-600" />
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Generating Your CVs & Cover Letters</h1>
          <p className="text-gray-600 mb-8">
            Our AI is analyzing your information and tailoring it to the job description...
          </p>
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
            <p className="text-indigo-700">This usually takes about 60-90 seconds to create comprehensive, detailed CVs</p>
            <p className="text-sm text-gray-500 mt-2">We're creating detailed tailored CVs with comprehensive work experience sections</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Oops! Something Went Wrong</h1>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/job-description')}
            className="px-6 py-3 ml-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            Back to Job Description
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Choose Your CV & Cover Letter Style</h1>
        <p className="text-gray-600 mb-4">
          We've created three different styles for your CV and cover letter. Select the option you prefer to continue to payment.
        </p>
        <p className="text-sm text-indigo-600">
          Each CV is detailed and comprehensive, tailored specifically to the job description
        </p>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 inline-block">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> These are example previews. Your purchased CV and cover letter will be fully tailored to your information and the specific job description you provided.
          </p>
        </div>
      </div>

      {/* Instructions for users */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-8 border-2 border-indigo-200 shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-800 mb-2">How to choose your style:</h2>
        <ol className="list-decimal pl-5 text-indigo-700 space-y-2">
          <li><span className="font-medium">Review each style option</span> below to see which format best suits your needs</li>
          <li><span className="font-medium">Click on a style card</span> to select it</li>
          <li><span className="font-medium">Toggle between CV and cover letter</span> to preview both formats</li>
          <li><span className="font-medium">Continue to payment</span> when you're ready to download your files</li>
        </ol>
      </div>

      {/* Style Selection Cards */}
      <div className="space-y-6 mb-8">
        {styleOptions.map((option) => (
          <div 
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-colors cursor-pointer ${
              selectedOption === option.id 
                ? 'border-indigo-500' 
                : 'border-transparent hover:border-indigo-300'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Style Info */}
              <div className="p-6 md:col-span-1 bg-indigo-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    {option.icon}
                    <h3 className="font-semibold text-indigo-800 ml-2">Style {option.id}: {option.title}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{option.description}</p>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption(option.id);
                    }}
                    className={`w-full py-2 px-4 rounded text-sm font-medium ${
                      selectedOption === option.id
                        ? 'bg-indigo-600 text-white'
                        : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {selectedOption === option.id ? 'Selected' : 'Select This Style'}
                  </button>
                </div>
              </div>
              
              {/* Preview Section */}
              <div className="md:col-span-2 border-l border-gray-200">
                {/* Preview Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      className={`px-6 py-3 font-medium ${
                        activeTab === 'cv' 
                          ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' 
                          : 'text-gray-600 hover:text-indigo-600'
                      }`}
                      onClick={() => setActiveTab('cv')}
                    >
                      CV Preview
                    </button>
                    <button
                      className={`px-6 py-3 font-medium ${
                        activeTab === 'coverLetter' 
                          ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' 
                          : 'text-gray-600 hover:text-indigo-600'
                      }`}
                      onClick={() => setActiveTab('coverLetter')}
                    >
                      Cover Letter Preview
                    </button>
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="p-6">
                  <ExamplePreview 
                    type={activeTab} 
                    style={getStyleForExamplePreview(option.id)} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Style Summary */}
      {selectedOption !== null && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Selected Style</h2>
          <div className="flex items-start">
            {styleOptions.find(opt => opt.id === selectedOption)?.icon}
            <div className="ml-3">
              <h3 className="font-medium text-lg">
                Style {selectedOption}: {styleOptions.find(opt => opt.id === selectedOption)?.title}
              </h3>
              <p className="text-gray-600 mt-1">
                {styleOptions.find(opt => opt.id === selectedOption)?.description}
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-md">
            <h3 className="font-medium text-indigo-800 mb-2">What's included in your purchase:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>A detailed tailored CV in your chosen style</span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>A matching cover letter customized for the job description</span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Both documents optimized with keywords from the job description</span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Download in both PDF and Word formats for easy editing</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-lg font-medium text-indigo-700">
              All this for just {getFormattedPrice()}
            </p>
            <p className="text-sm text-gray-500">
              A small investment that could make the difference in landing your dream job
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/job-description')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className={`px-6 py-2 rounded-lg text-white transition-colors flex items-center ${
            selectedOption !== null 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-indigo-400 cursor-not-allowed'
          }`}
          disabled={selectedOption === null}
        >
          <Download size={20} className="mr-2" />
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default GeneratedResults;