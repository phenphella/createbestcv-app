import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle, Globe } from 'lucide-react';
import { useCV } from '../context/CVContext';

const JobDescription: React.FC = () => {
  const { 
    jobDescription, 
    setJobDescription, 
    companyName, 
    setCompanyName, 
    applicantName, 
    setApplicantName,
    languagePreference,
    setLanguagePreference
  } = useCV();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (jobDescription.trim().length < 50) {
      setError('Please provide a more detailed job description (at least 50 characters)');
      return;
    }
    
    navigate('/generated-results');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Add Job Description</h1>
        <p className="text-gray-600">
          Paste the job description to tailor your CV and cover letter
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Briefcase size={24} className="text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Job Description</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paste the full job description here
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (error) setError(null);
              }}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Copy and paste the job description from the job posting..."
              required
            ></textarea>
          </div>

          {/* Company Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name (optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter the company name you're applying to..."
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used in your cover letter if provided
            </p>
          </div>

          {/* Applicant Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (for cover letter signature)
            </label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your full name..."
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used to sign your cover letter
            </p>
          </div>

          {/* Language Preference Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Globe size={16} className="mr-1" />
              Language Preference
            </label>
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="languagePreference"
                  value="uk"
                  checked={languagePreference === 'uk'}
                  onChange={() => setLanguagePreference('uk')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700">UK English</span>
                <span className="ml-1 text-xs text-gray-500">(e.g., organise, colour)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="languagePreference"
                  value="us"
                  checked={languagePreference === 'us'}
                  onChange={() => setLanguagePreference('us')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700">US English</span>
                <span className="ml-1 text-xs text-gray-500">(e.g., organize, color)</span>
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Choose the spelling style for your CV and cover letter
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-indigo-50 p-4 rounded-md mt-6">
            <h3 className="font-medium text-indigo-800 mb-2">Why this matters</h3>
            <p className="text-indigo-700 text-sm">
              Our AI analyzes the job description to identify key skills, qualifications, and requirements. 
              This helps us tailor your CV and cover letter to highlight the most relevant experiences and 
              skills that match what the employer is looking for.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Generate CVs & Cover Letters
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobDescription;