import React from 'react';
import { FileText, Mail, Phone, MapPin, Linkedin, Briefcase, BookOpen, Star, Award, CheckCircle, User, Code, Globe, Lock } from 'lucide-react';

interface ExamplePreviewProps {
  type: 'cv' | 'coverLetter';
  style: 'professional' | 'skills-based' | 'concise';
}

const ExamplePreview: React.FC<ExamplePreviewProps> = ({ type, style }) => {
  if (type === 'coverLetter') {
    return (
      <div className="cover-letter-example bg-white p-8 rounded-md shadow-md mb-6 relative">
        <div className="cover-letter-content">
          {/* Plain text salutation - not a heading, no special styling */}
          <p className="mb-4">Dear Hiring Manager,</p>
          
          {style === 'professional' && (
            <>
              <p className="mb-4">
                I am writing to express my interest in the [Position] role at [Company Name]. With [X] years of experience in [industry/field], I am confident in my ability to contribute effectively to your team.
              </p>
              <p className="mb-4">
                My professional background includes extensive experience in [key area], where I have consistently [key achievement]. At [Previous Company], I successfully [notable accomplishment] which resulted in [positive outcome].
              </p>
            </>
          )}
          
          {style === 'skills-based' && (
            <>
              <p className="mb-4">
                I am excited to apply for the [Position] role at [Company Name], where I can leverage my expertise in [key skill], [key skill], and [key skill] to drive results for your organization.
              </p>
              <p className="mb-4">
                Throughout my career, I have demonstrated measurable success in [key area], including:
              </p>
              <p className="mb-2">• Achieving improvement in [area] through implementation of [strategy]</p>
              <p className="mb-4">• Leading a team that delivered results ahead of schedule and under budget</p>
            </>
          )}
          
          {style === 'concise' && (
            <>
              <p className="mb-4">
                Your job posting for [Position] immediately caught my attention as it aligns perfectly with my career goals and expertise. I offer [X] years of experience in [industry/field] with a proven track record of [key achievement].
              </p>
              <p className="mb-4">
                My key qualifications include [Qualification 1], [Qualification 2], and [Qualification 3]. I'm particularly skilled at [key skill] which has enabled me to [positive outcome].
              </p>
            </>
          )}
          
          <p className="mb-4">
            I look forward to discussing how my background and skills would benefit your team. Thank you for considering my application.
          </p>
          
          <p className="mb-2">Sincerely,</p>
          <p>John Smith</p>
        </div>
        
        {/* Watermark and lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none">
          <div className="mt-auto mb-8 text-center">
            <Lock size={32} className="mx-auto mb-2 text-indigo-500" />
            <p className="text-indigo-700 font-medium">Purchase to view full content</p>
          </div>
        </div>
      </div>
    );
  }
  
  // CV Preview
  return (
    <div className="cv-example max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="cv-header bg-gradient-to-r from-indigo-800 to-indigo-900 text-white p-8 mb-6 rounded-t-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-3 font-serif tracking-wide">John Smith</h1>
        
        <div className="flex flex-wrap gap-3 text-indigo-100">
          <div className="flex items-center">
            <Mail size={14} className="mr-1" />
            <span>john.smith@example.com</span>
          </div>
          <div className="flex items-center ml-4">
            <Phone size={14} className="mr-1" />
            <span>+44 7123 456789</span>
          </div>
          <div className="flex items-center ml-4">
            <MapPin size={14} className="mr-1" />
            <span>London, UK</span>
          </div>
          <div className="flex items-center ml-4">
            <Linkedin size={14} className="mr-1" />
            <span>linkedin.com/in/johnsmith</span>
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="section-header bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 mb-2 border-l-4 border-indigo-600 flex items-center">
        <User size={18} className="text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-indigo-800">PROFESSIONAL SUMMARY</h2>
      </div>
      <div className="cv-summary bg-white p-6 mb-6 rounded-md shadow-md border border-gray-100">
        {style === 'professional' && (
          <p className="text-gray-700 leading-relaxed font-serif text-justify">
            Experienced professional with over 10 years of expertise in the industry. Proven track record of delivering results and leading successful teams. Skilled in project management, strategic planning, and stakeholder management with a focus on achieving business objectives and driving growth.
          </p>
        )}
        
        {style === 'skills-based' && (
          <p className="text-gray-700 leading-relaxed font-serif text-justify">
            Results-driven professional with expertise in: <strong className="text-indigo-800">Project Management</strong> | <strong className="text-indigo-800">Team Leadership</strong> | <strong className="text-indigo-800">Strategic Planning</strong> | <strong className="text-indigo-800">Stakeholder Management</strong>. Delivered significant improvement in department efficiency through implementation of new workflow processes. Generated additional revenue through customer retention strategies.
          </p>
        )}
        
        {style === 'concise' && (
          <p className="text-gray-700 leading-relaxed font-serif text-justify">
            Senior professional with 10+ years' experience. Expertise: project management, team leadership. Achieved efficiency improvement and revenue growth. Seeking to leverage skills in strategic planning and stakeholder management for continued business success.
          </p>
        )}
      </div>
      
      {/* Experience Section */}
      <div className="section-header bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 mb-2 border-l-4 border-indigo-600 flex items-center">
        <Briefcase size={18} className="text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-indigo-800">WORK EXPERIENCE</h2>
      </div>
      <div className="cv-experience bg-white p-6 mb-6 rounded-md shadow-md border border-gray-100">
        <div className="mt-0 mb-2">
          <h3 className="text-lg font-bold text-gray-800">Senior Position at Company Name</h3>
          <p className="text-sm text-gray-600">January 2020 - Present</p>
        </div>
        <ul className="space-y-1 mt-2">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 flex-1 text-justify">
              {style === 'professional' && "Led cross-functional team of members to deliver project on time and under budget, resulting in high client satisfaction scores."}
              {style === 'skills-based' && "Increased department efficiency through implementation of new workflow processes and automation tools."}
              {style === 'concise' && "Led team. Delivered project under budget. Improved efficiency."}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 flex-1 text-justify">
              {style === 'professional' && "Managed relationships with key stakeholders, ensuring clear communication and alignment on project goals and timelines."}
              {style === 'skills-based' && "Generated additional revenue through implementation of new customer retention strategy and upselling techniques."}
              {style === 'concise' && "Managed stakeholder relations. Generated revenue. Implemented retention strategy."}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 flex-1 text-justify">
              {style === 'professional' && "Implemented new processes that increased efficiency and reduced operational costs annually."}
              {style === 'skills-based' && "Reduced customer churn through data analysis and implementation of targeted retention programs."}
              {style === 'concise' && "Reduced costs annually. Cut customer churn. Analyzed data for targeted programs."}
            </span>
          </li>
        </ul>
        
        <div className="mt-4 mb-2">
          <h3 className="text-lg font-bold text-gray-800">Previous Role at Former Company</h3>
          <p className="text-sm text-gray-600">January 2015 - December 2019</p>
        </div>
        <ul className="space-y-1 mt-2">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 flex-1 text-justify">
              {style === 'professional' && "Managed team of professionals to achieve company objectives and exceed quarterly targets."}
              {style === 'skills-based' && "Achieved sales targets for consecutive years through strategic account planning and relationship building."}
              {style === 'concise' && "Managed team. Exceeded targets. Achieved sales goals."}
            </span>
          </li>
        </ul>
      </div>
      
      {/* Education Section */}
      <div className="section-header bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 mb-2 border-l-4 border-indigo-600 flex items-center">
        <BookOpen size={18} className="text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-indigo-800">EDUCATION</h2>
      </div>
      <div className="cv-education bg-white p-6 mb-6 rounded-md shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">University of Example</h3>
        <p className="text-gray-700">BSc in Relevant Field, 2012 - 2016</p>
        <ul className="space-y-1 mt-2">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 text-justify">Graduated with First Class Honours</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 text-justify">Relevant coursework: Subject 1, Subject 2, Subject 3</span>
          </li>
        </ul>
      </div>
      
      {/* Skills Section */}
      <div className="section-header bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 mb-2 border-l-4 border-indigo-600 flex items-center">
        <Star size={18} className="text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-indigo-800">SKILLS</h2>
      </div>
      <div className="cv-skills bg-white p-6 mb-6 rounded-md shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Project Management</span>
          </div>
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Team Leadership</span>
          </div>
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Strategic Planning</span>
          </div>
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Stakeholder Management</span>
          </div>
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Problem Solving</span>
          </div>
          <div className="flex items-start bg-indigo-50 p-2 rounded">
            <span className="text-indigo-500 mr-2">•</span>
            <span className="text-gray-700 text-justify">Communication</span>
          </div>
        </div>
      </div>
      
      {/* Hobbies Section */}
      <div className="section-header bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 mb-2 border-l-4 border-indigo-600 flex items-center">
        <CheckCircle size={18} className="text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-indigo-800">HOBBIES & INTERESTS</h2>
      </div>
      <div className="cv-section bg-white p-6 mb-6 rounded-md shadow-md border border-gray-100">
        <p className="text-gray-700 mb-2 text-justify">
          Reading, traveling, continuous learning, and outdoor activities.
        </p>
      </div>
      
      {/* Watermark and lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none">
        <div className="mt-auto mb-8 text-center">
          <Lock size={32} className="mx-auto mb-2 text-indigo-500" />
          <p className="text-indigo-700 font-medium">Purchase to view full content</p>
        </div>
      </div>
    </div>
  );
};

export default ExamplePreview;