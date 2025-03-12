import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useCV } from '../context/CVContext';

const UploadCV: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { processUploadedCV, isLoading } = useCV();

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    // Check if file is a Word document
    if (selectedFile && (
      selectedFile.type === 'application/msword' || 
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid Word document (.doc or .docx)');
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleContinue = async () => {
    if (file) {
      try {
        setError(null);
        await processUploadedCV(file);
        navigate('/job-description');
      } catch (err) {
        console.error('Error processing CV:', err);
        setError('Error processing your CV. Please try again with a different file or create a CV manually.');
      }
    } else {
      setError('Please upload your CV before continuing');
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Upload Your CV</h1>
        <p className="text-gray-600">
          Upload your existing CV as a Word document (.doc or .docx)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
              <p className="text-indigo-600 font-medium">Processing your CV...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment as we extract and analyze your information</p>
            </div>
          ) : (
            <>
              <FileText size={48} className="mx-auto mb-4 text-indigo-500" />
              {isDragActive ? (
                <p className="text-indigo-600 font-medium">Drop your CV here...</p>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    Drag and drop your CV here, or click to select a file
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supported formats: .doc, .docx
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {file && !isLoading && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
            <FileText size={20} className="mr-2" />
            <p className="flex-grow">{file.name}</p>
            <button 
              onClick={() => setFile(null)} 
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Having trouble with file upload?</h3>
          <p className="text-blue-700 text-sm">
            If you're experiencing issues with the file upload, you can also create your CV from scratch using our form-based editor.
          </p>
          <button
            onClick={() => navigate('/create-cv')}
            className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
            disabled={isLoading}
          >
            <FileText size={16} className="mr-1" />
            Create CV manually instead
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className={`px-6 py-2 rounded-lg text-white transition-colors ${
            file && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-indigo-400 cursor-not-allowed'
          }`}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 size={20} className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadCV;