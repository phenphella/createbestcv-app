import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CVData, GeneratedCV, generateCVAndCoverLetter, extractTextFromWordDocument, parseExtractedText } from '../services/openai';

interface CVContextType {
  cvData: CVData;
  setCVData: (data: CVData) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  applicantName: string;
  setApplicantName: (name: string) => void;
  generatedOptions: GeneratedCV[];
  setGeneratedOptions: (options: GeneratedCV[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedOption: number | null;
  setSelectedOption: (id: number | null) => void;
  languagePreference: 'uk' | 'us';
  setLanguagePreference: (preference: 'uk' | 'us') => void;
  processUploadedCV: (file: File) => Promise<void>;
  generateResults: () => Promise<GeneratedCV[]>;
}

const defaultCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
  },
  education: [],
  workExperience: [],
  skills: '',
  hobbies: '',
};

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [languagePreference, setLanguagePreference] = useState<'uk' | 'us'>('uk');

  const processUploadedCV = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Extract text from the Word document
      console.log("Starting to extract text from Word document");
      const extractedText = await extractTextFromWordDocument(file);
      console.log("Extracted text:", extractedText.substring(0, 100) + "...");
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("Could not extract text from the document. The file might be corrupted or empty.");
      }
      
      // Parse the extracted text into CV data
      console.log("Starting to parse extracted text");
      const parsedCVData = await parseExtractedText(extractedText);
      console.log("Parsed CV data:", parsedCVData.personalInfo.fullName);
      
      if (!parsedCVData.personalInfo.fullName) {
        throw new Error("Could not parse CV data properly. Please try a different file or create a CV manually.");
      }
      
      // Update the CV data
      setCVData(parsedCVData);
      
      // Set applicant name from CV data if available
      if (parsedCVData.personalInfo.fullName && !applicantName) {
        setApplicantName(parsedCVData.personalInfo.fullName);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing CV:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const generateResults = async () => {
    try {
      if (!cvData.personalInfo.fullName) {
        throw new Error('CV data is incomplete. Please fill in your personal information.');
      }
      
      if (!jobDescription) {
        throw new Error('Job description is required.');
      }
      
      // Generate CV and cover letter using OpenAI
      const results = await generateCVAndCoverLetter(cvData, jobDescription, companyName, applicantName, languagePreference);
      
      if (!results || results.length === 0) {
        throw new Error('Failed to generate CV options.');
      }
      
      // Update the generated options
      setGeneratedOptions(results);
      
      // Set the first option as selected by default
      if (results.length > 0 && selectedOption === null) {
        setSelectedOption(results[0].id);
      }
      
      return results;
    } catch (error) {
      console.error('Error generating results:', error);
      throw error;
    }
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCVData,
        jobDescription,
        setJobDescription,
        companyName,
        setCompanyName,
        applicantName,
        setApplicantName,
        generatedOptions,
        setGeneratedOptions,
        isLoading,
        setIsLoading,
        selectedOption,
        setSelectedOption,
        languagePreference,
        setLanguagePreference,
        processUploadedCV,
        generateResults,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};