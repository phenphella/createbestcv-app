import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Mail, Phone, MapPin, Linkedin, Calendar, Award, BookOpen, Briefcase, User, Code, Star, Globe, CheckCircle, Lock } from 'lucide-react';

interface StyledCVPreviewProps {
  content: string;
  type: 'cv' | 'coverLetter';
}

const StyledCVPreview: React.FC<StyledCVPreviewProps> = ({ content, type }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Prevent copying from the preview
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Optional: Show a message when user tries to copy
      const message = document.createElement('div');
      message.className = 'copy-message';
      message.textContent = 'Purchase to copy content';
      message.style.position = 'fixed';
      message.style.top = '50%';
      message.style.left = '50%';
      message.style.transform = 'translate(-50%, -50%)';
      message.style.padding = '10px 20px';
      message.style.backgroundColor = 'rgba(79, 70, 229, 0.9)';
      message.style.color = 'white';
      message.style.borderRadius = '4px';
      message.style.zIndex = '9999';
      
      document.body.appendChild(message);
      
      setTimeout(() => {
        document.body.removeChild(message);
      }, 1500);
    };
    
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    
    const preventSelection = () => {
      if (document.getSelection) {
        if (document.getSelection()?.empty) {
          document.getSelection()?.empty();
        } else if (document.getSelection()?.removeAllRanges) {
          document.getSelection()?.removeAllRanges();
        }
      }
    };
    
    const element = previewRef.current;
    if (element) {
      element.addEventListener('copy', preventCopy);
      element.addEventListener('cut', preventCopy);
      element.addEventListener('contextmenu', preventContextMenu);
      element.addEventListener('dragstart', preventDragStart);
      element.addEventListener('selectstart', preventSelection);
      
      // Add CSS to prevent selection
      element.style.userSelect = 'none';
      element.style.webkitUserSelect = 'none';
      element.style.msUserSelect = 'none';
      element.style.MozUserSelect = 'none';
    }
    
    return () => {
      if (element) {
        element.removeEventListener('copy', preventCopy);
        element.removeEventListener('cut', preventCopy);
        element.removeEventListener('contextmenu', preventContextMenu);
        element.removeEventListener('dragstart', preventDragStart);
        element.removeEventListener('selectstart', preventSelection);
      }
    };
  }, []);

  // Clean up any special characters in the content
  const cleanContent = (text: string): string => {
    // First, handle all the special characters
    let cleaned = text
      // Fix apostrophes and quotes
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      // Fix dashes
      .replace(/–/g, "-")
      .replace(/—/g, "-")
      .replace(/\u2013/g, "-") // en dash
      .replace(/\u2014/g, "-") // em dash
      // Fix ellipsis
      .replace(/…/g, "...")
      .replace(/\u2026/g, "...")
      // Fix bullet points
      .replace(/•/g, "•")
      .replace(/◦/g, "•")
      .replace(/·/g, "•")
      .replace(/\u2022/g, "•") // bullet
      .replace(/\u25E6/g, "•") // white bullet
      .replace(/\u2023/g, "•") // triangular bullet
      // Fix common UTF-8 encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€"/g, "-")
      .replace(/â€"/g, "-")
      .replace(/â€¦/g, "...")
      .replace(/â€¢/g, "•")
      .replace(/Â/g, "")
      // Fix non-breaking spaces
      .replace(/\u00A0/g, " ")
      // Fix other invisible characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Then, ensure proper hyphenation in date ranges
    // Format month year to month year ranges
    cleaned = cleaned.replace(/(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*(?:to|–|—|-|through|until)\s*(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)/gi, "$1 - $2");
    
    // Format year to year ranges
    cleaned = cleaned.replace(/(\b\d{4})\s*(?:to|–|—|-|through|until)\s*(\b\d{4}|Present)/gi, "$1 - $2");
    
    // Ensure proper spacing around hyphens in date ranges
    cleaned = cleaned.replace(/(\b\d{4})-(\b\d{4}|Present)/gi, "$1 - $2");
    cleaned = cleaned.replace(/(\b\d{4})\s+-\s+(\b\d{4}|Present)/gi, "$1 - $2");
    
    // Ensure proper hyphenation for compound adjectives
    cleaned = cleaned.replace(/(\w+)\s+(based|oriented|driven|focused|facing|ready|minded|specific|related|centered|friendly|aware)/gi, "$1-$2");
    cleaned = cleaned.replace(/\b(well|self|high|low|long|short|full|part|cross|inter|multi|over|under|pre|post|re|co|sub|super|non|anti|pro|semi|mid|micro|macro|meta)\s+(\w+)\b/gi, "$1-$2");
    
    return cleaned;
  };

  // Truncate content to show only a preview
  const truncateContent = (text: string, type: 'cv' | 'coverLetter'): string => {
    if (type === 'cv') {
      // For CV, show only the first section (personal info) and part of the second section
      const sections = text.split(/\n([A-Z][A-Z\s]+)\n/);
      if (sections.length >= 3) {
        // Get the first section (name and contact info)
        const firstSection = sections[0];
        // Get the second section header
        const secondSectionHeader = sections[1];
        // Get part of the second section content (e.g., summary or profile)
        const secondSectionContent = sections[2].split('\n').slice(0, 4).join('\n');
        
        return `${firstSection}\n${secondSectionHeader}\n${secondSectionContent}\n\n[... Content hidden until purchase ...]`;
      }
    } else {
      // For cover letter, show only the first paragraph
      const paragraphs = text.split('\n\n');
      if (paragraphs.length > 1) {
        return `${paragraphs[0]}\n\n[... Content hidden until purchase ...]`;
      }
    }
    
    // Fallback if we can't properly truncate
    const lines = text.split('\n');
    return lines.slice(0, 8).join('\n') + '\n\n[... Content hidden until purchase ...]';
  };

  // Process the markdown content to add styling classes
  const processContent = () => {
    if (!content || content.trim() === '') {
      return (
        <div className="text-center py-10 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>No content available to preview</p>
        </div>
      );
    }

    const cleanedContent = cleanContent(content);
    // Truncate content for preview
    const truncatedContent = truncateContent(cleanedContent, type);
    
    // For cover letter, use a simpler format
    if (type === 'coverLetter') {
      // Process the cover letter content to ensure "Dear Hiring Manager" is in normal text
      let processedContent = truncatedContent;
      
      // Replace any heading format for "Dear Hiring Manager" with normal text
      processedContent = processedContent.replace(/^(#+\s*)?Dear\s+Hiring\s+Manager\s*$/mi, 'Dear Hiring Manager,');
      
      return (
        <div className="cover-letter bg-white p-8 rounded-md shadow-md mb-6 relative">
          <div className="cover-letter-content">
            <ReactMarkdown components={{
              // Remove h1 and h2 styling for cover letter to ensure proper letter format
              h1: ({ children }) => <p className="mb-4">{children}</p>,
              h2: ({ children }) => <p className="mb-3">{children}</p>,
              p: ({ children }) => {
                // Check if this paragraph is the salutation
                const text = String(children);
                if (text.startsWith('Dear ')) {
                  return <p className="mb-4">{children}</p>;
                }
                return <p className="mb-4">{children}</p>;
              },
              strong: ({ children }) => <strong>{children}</strong>,
              ul: ({ children }) => <ul className="space-y-2 ml-6 mb-4">{children}</ul>,
              li: ({ children }) => (
                <li>
                  <span className="mr-2">•</span>
                  {children}
                </li>
              ),
            }}>
              {processedContent}
            </ReactMarkdown>
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

    // For CV, extract the name from the first line
    const nameMatch = cleanedContent.match(/^([A-Za-z\s]+)(?:\n|$)/);
    const name = nameMatch ? nameMatch[1] : '';
    
    // Remove the name from the content to avoid duplication
    const contentWithoutName = nameMatch 
      ? truncatedContent.replace(nameMatch[0], '') 
      : truncatedContent;
    
    // Split the content by sections (looking for all-caps headers which are main sections)
    const sectionRegex = /\n([A-Z][A-Z\s]+)(?:\n|$)/g;
    const sections = contentWithoutName.split(sectionRegex);
    
    return (
      <div className="cv-document max-w-4xl mx-auto relative">
        {/* Header with name */}
        <div className="cv-header bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-8 mb-6 rounded-t-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-3 font-serif tracking-wide">{name || 'Sample Name'}</h1>
          
          {/* Extract contact info for the header */}
          <div className="flex flex-wrap gap-3 text-indigo-100">
            {cleanedContent.match(/Email: ([^\n]+)/i) ? (
              <div className="flex items-center">
                <Mail size={14} className="mr-1" />
                <span>{cleanedContent.match(/Email: ([^\n]+)/i)?.[1] || 'email@example.com'}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Mail size={14} className="mr-1" />
                <span>email@example.com</span>
              </div>
            )}
            {cleanedContent.match(/Phone: ([^\n]+)/i) ? (
              <div className="flex items-center ml-4">
                <Phone size={14} className="mr-1" />
                <span>{cleanedContent.match(/Phone: ([^\n]+)/i)?.[1] || '123-456-7890'}</span>
              </div>
            ) : (
              <div className="flex items-center ml-4">
                <Phone size={14} className="mr-1" />
                <span>123-456-7890</span>
              </div>
            )}
            {cleanedContent.match(/Address: ([^\n]+)/i) ? (
              <div className="flex items-center ml-4">
                <MapPin size={14} className="mr-1" />
                <span>{cleanedContent.match(/Address: ([^\n]+)/i)?.[1] || 'City, Country'}</span>
              </div>
            ) : (
              <div className="flex items-center ml-4">
                <MapPin size={14} className="mr-1" />
                <span>City, Country</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Process each section */}
        {sections.length > 1 ? (
          sections.map((section, index) => {
            // Skip empty sections and the first element (which is before the first header)
            if (!section.trim() || (index === 0 && sections.length > 1)) return null;
            
            // If this is a section header (all caps)
            if (section.toUpperCase() === section && section.trim().length > 0 && index % 2 === 1) {
              return (
                <div key={`header-${index}`} className="section-header bg-indigo-50 p-3 mb-2 border-l-4 border-indigo-500">
                  <h2 className="text-xl font-bold text-indigo-800">{section.trim()}</h2>
                </div>
              );
            }
            
            // This is section content
            if (index % 2 === 0 && index > 0) {
              const sectionHeader = sections[index - 1];
              
              // Different styling based on section type
              if (sectionHeader.includes('PROFILE') || sectionHeader.includes('SUMMARY') || sectionHeader.includes('OBJECTIVE')) {
                return (
                  <div key={`section-${index}`} className="cv-summary bg-white p-6 mb-6 rounded-md shadow-md">
                    <ReactMarkdown components={{
                      p: ({ children }) => <p className="text-gray-700 leading-relaxed font-serif text-justify">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    }}>
                      {section.trim()}
                    </ReactMarkdown>
                  </div>
                );
              }
              
              if (sectionHeader.includes('EXPERIENCE') || sectionHeader.includes('EMPLOYMENT')) {
                // Split by company/role entries (which are typically in Title Case)
                const entries = section.split(/\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+at\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?)/);
                
                return (
                  <div key={`section-${index}`} className="cv-experience bg-white p-6 mb-6 rounded-md shadow-md">
                    {entries.map((entry, entryIndex) => {
                      // Skip empty entries
                      if (!entry.trim()) return null;
                      
                      // If this is a job title/company (Title Case)
                      if (entryIndex % 2 === 1) {
                        return (
                          <div key={`job-title-${entryIndex}`} className="mt-4 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{entry.trim()}</h3>
                          </div>
                        );
                      }
                      
                      // This is job content
                      return (
                        <div key={`job-content-${entryIndex}`} className="mb-6">
                          <ReactMarkdown components={{
                            p: ({ children }) => <p className="text-gray-700 mb-2 text-justify">{children}</p>,
                            ul: ({ children }) => <ul className="space-y-1 mt-2">{children}</ul>,
                            li: ({ children }) => (
                              <li className="flex items-start">
                                <span className="text-indigo-500 mr-2 mt-1">•</span>
                                <span className="text-gray-700 flex-1 text-justify">{children}</span>
                              </li>
                            ),
                          }}>
                            {entry.trim()}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              
              if (sectionHeader.includes('EDUCATION')) {
                return (
                  <div key={`section-${index}`} className="cv-education bg-white p-6 mb-6 rounded-md shadow-md">
                    <ReactMarkdown components={{
                      p: ({ children }) => <p className="text-gray-700 mb-2 text-justify">{children}</p>,
                      h3: ({ children }) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="space-y-1 mt-2">{children}</ul>,
                      li: ({ children }) => (
                        <li className="flex items-start">
                          <span className="text-indigo-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700 text-justify">{children}</span>
                        </li>
                      ),
                    }}>
                      {section.trim()}
                    </ReactMarkdown>
                  </div>
                );
              }
              
              if (sectionHeader.includes('SKILLS')) {
                return (
                  <div key={`section-${index}`} className="cv-skills bg-white p-6 mb-6 rounded-md shadow-md">
                    <ReactMarkdown components={{
                      p: ({ children }) => <p className="text-gray-700 mb-2 text-justify">{children}</p>,
                      h3: ({ children }) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">{children}</ul>,
                      li: ({ children }) => (
                        <li className="flex items-start bg-indigo-50 p-2 rounded">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span className="text-gray-700 text-justify">{children}</span>
                        </li>
                      ),
                    }}>
                      {section.trim()}
                    </ReactMarkdown>
                  </div>
                );
              }
              
              // Default section styling
              return (
                <div key={`section-${index}`} className="cv-section bg-white p-6 mb-6 rounded-md shadow-md">
                  <ReactMarkdown components={{
                    p: ({ children }) => <p className="text-gray-700 mb-2 text-justify">{children}</p>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-1">{children}</h3>,
                    ul: ({ children }) => <ul className="space-y-1 mt-2">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start">
                        <span className="text-indigo-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700 text-justify">{children}</span>
                      </li>
                    ),
                  }}>
                    {section.trim()}
                  </ReactMarkdown>
                </div>
              );
            }
            
            return null;
          })
        ) : (
          // Fallback content if no sections are found
          <div className="cv-section bg-white p-6 mb-6 rounded-md shadow-md">
            <div className="section-header bg-indigo-50 p-3 mb-4 border-l-4 border-indigo-500">
              <h2 className="text-xl font-bold text-indigo-800">PROFESSIONAL SUMMARY</h2>
            </div>
            <p className="text-gray-700 mb-4 text-justify">
              Experienced professional with a track record of success in [industry/field]. Skilled in [key skill], [key skill], and [key skill] with a focus on delivering results. Seeking to leverage my expertise in a challenging role.
            </p>
            <div className="section-header bg-indigo-50 p-3 mb-4 border-l-4 border-indigo-500 mt-6">
              <h2 className="text-xl font-bold text-indigo-800">EXPERIENCE</h2>
            </div>
            <p className="text-gray-700 mb-2 text-justify">
              Sample work experience will appear here.
            </p>
          </div>
        )}
        
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

  return (
    <div 
      ref={previewRef}
      className="styled-cv-preview bg-gray-100 p-6 rounded-lg overflow-y-auto max-h-[600px] relative"
      style={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {processContent()}
      
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="transform rotate-45 text-indigo-500 text-6xl font-bold">PREVIEW</div>
      </div>
      
      {/* Lock overlay for raw view */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none">
        <div className="mt-auto mb-8 text-center">
          <Lock size={32} className="mx-auto mb-2 text-indigo-500" />
          <p className="text-indigo-700 font-medium">Purchase to view full content</p>
        </div>
      </div>
    </div>
  );
};

export default StyledCVPreview;