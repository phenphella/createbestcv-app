import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Interface for document generation options
export interface DocumentOptions {
  type: 'cv' | 'coverLetter';
  format: 'pdf' | 'docx';
}

// Function to generate and download a document
export const generateDocument = async (
  content: string,
  options: DocumentOptions,
  fileName?: string
): Promise<boolean> => {
  try {
    if (options.format === 'pdf') {
      return generatePDF(content, options.type, fileName);
    } else {
      return generateRTF(content, options.type, fileName);
    }
  } catch (error) {
    console.error('Error generating document:', error);
    return false;
  }
};

// Function to generate and download a PDF
const generatePDF = (content: string, type: 'cv' | 'coverLetter', fileName?: string): boolean => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    doc.setProperties({
      title: type === 'cv' ? 'CV' : 'Cover Letter',
      subject: type === 'cv' ? 'Professional CV' : 'Professional Cover Letter',
      creator: 'CV Optimizer',
      author: 'CV Optimizer'
    });
    
    // Set font and size
    doc.setFont('helvetica');
    doc.setFontSize(11);
    
    // Process the markdown content
    const processedContent = processMarkdownForPDF(content);
    
    // Add content to the PDF with enhanced styling
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - (margin * 2);
    
    // Split the content into sections
    const sections = processedContent.split('\n\n');
    let y = margin;
    const lineHeight = 6; // Reduced line height for smaller text
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Different handling for CV and cover letter
      if (type === 'cv') {
        // Check if this is a header (first section)
        if (i === 0) {
          // Add a colored header background for CV only
          doc.setFillColor(63, 81, 181); // Indigo color
          doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
          
          // Add white text for the header
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16); // Reduced from 18
          doc.text(section, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
          
          // Reset text color and font size
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          
          y = 50; // Start content below the header
          continue;
        }
        
        // Check if this is a section title
        if (section.toUpperCase() === section && section.length < 50) {
          // Add some space before section titles
          y += 5;
          
          // Add the section title with larger font
          doc.setFontSize(13); // Reduced from 14
          doc.setTextColor(63, 81, 181); // Indigo color
          doc.text(section, margin, y);
          
          // Add a colored line AFTER the section title (not before)
          y += 2; // Small space after the title
          doc.setDrawColor(63, 81, 181); // Indigo color
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth + margin, y);
          
          // Reset font size and color
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          
          y += lineHeight + 3;
          continue;
        }
      } else {
        // Cover Letter - special handling for the first section (Dear Hiring Manager)
        if (i === 0 && section.startsWith('Dear ')) {
          // For cover letter, no special styling for the salutation
          doc.setTextColor(0, 0, 0); // Black text
          doc.setFontSize(11); // Normal font size
          
          // Check if we need a new page
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          
          // Add the salutation
          doc.text(section, margin, y);
          y += lineHeight + 4; // Add a bit more space after salutation
          continue;
        }
        
        // For cover letter signature (usually the last section)
        if (i === sections.length - 1 && (section.startsWith('Sincerely,') || section.startsWith('Regards,') || section.startsWith('Best regards,'))) {
          // Add some extra space before the signature
          y += 4;
          
          // Split the signature into lines
          const signatureLines = section.split('\n');
          
          // Add each line of the signature
          for (let j = 0; j < signatureLines.length; j++) {
            // Check if we need a new page
            if (y > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
            
            doc.text(signatureLines[j], margin, y);
            y += lineHeight;
          }
          
          continue;
        }
      }
      
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      
      // Split the section into lines to fit the page width
      const lines = doc.splitTextToSize(section, pageWidth);
      
      // Add the lines to the PDF
      for (let j = 0; j < lines.length; j++) {
        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        
        doc.text(lines[j], margin, y);
        y += lineHeight;
      }
      
      // Add some space after each section
      y += 3;
    }
    
    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - margin, 
        doc.internal.pageSize.getHeight() - 10);
    }
    
    // Generate the file name
    const defaultFileName = type === 'cv' ? 'CV' : 'Cover_Letter';
    const finalFileName = `${fileName || defaultFileName}.pdf`;
    
    // Save the PDF
    doc.save(finalFileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Function to generate and download an RTF file
const generateRTF = (content: string, type: 'cv' | 'coverLetter', fileName?: string): boolean => {
  try {
    // Clean up the markdown content to remove hashtags and format properly
    const cleanedContent = cleanMarkdownForRTF(content);
    
    // Convert markdown to RTF
    const rtfContent = convertMarkdownToRTF(cleanedContent, type);
    
    // Create a Blob with the RTF content
    const blob = new Blob([rtfContent], { 
      type: 'application/rtf' 
    });
    
    // Generate the file name
    const defaultFileName = type === 'cv' ? 'CV' : 'Cover_Letter';
    const finalFileName = `${fileName || defaultFileName}.rtf`;
    
    // Use FileSaver to save the file
    saveAs(blob, finalFileName);
    
    return true;
  } catch (error) {
    console.error('Error generating RTF document:', error);
    return false;
  }
};

// Clean up markdown content for RTF conversion
function cleanMarkdownForRTF(markdown: string): string {
  let cleaned = markdown;
  
  // Extract the name from the first line (usually # Name)
  const nameMatch = cleaned.match(/^# (.*?)(?:\n|$)/);
  const name = nameMatch ? nameMatch[1] : 'CV';
  
  // Remove all # headers and replace with proper section titles
  cleaned = cleaned.replace(/^# .*?\n/m, `${name}\n\n`); // Replace first header with just the name
  cleaned = cleaned.replace(/^# (.*?)(?:\n|$)/gm, '$1\n'); // Replace other main headers
  cleaned = cleaned.replace(/^## (.*?)(?:\n|$)/gm, '$1\n'); // Replace subheaders
  cleaned = cleaned.replace(/^### (.*?)(?:\n|$)/gm, '$1\n'); // Replace sub-subheaders
  
  // Remove LinkedIn URL if present (but keep the text "LinkedIn: [name]")
  cleaned = cleaned.replace(/LinkedIn: \[(.*?)\]\(.*?\)/g, 'LinkedIn: $1');
  cleaned = cleaned.replace(/LinkedIn: https?:\/\/.*?(?:\n|$)/gm, '');
  
  // Convert bullet points to proper format
  cleaned = cleaned.replace(/^\* (.*?)$/gm, '• $1');
  cleaned = cleaned.replace(/^- (.*?)$/gm, '• $1');
  
  // Add extra line breaks for better section separation
  cleaned = cleaned.replace(/([A-Z][A-Za-z\s]+)(?:\n|$)/g, '$1\n\n');
  
  // Fix common special character issues
  cleaned = cleaned.replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2014/g, "-") // em dash
    .replace(/…/g, "...")
    .replace(/\u2026/g, "...")
    .replace(/•/g, "•")
    .replace(/◦/g, "•")
    .replace(/·/g, "•")
    .replace(/\u2022/g, "•") // bullet
    .replace(/\u25E6/g, "•") // white bullet
    .replace(/\u2023/g, "•") // triangular bullet
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "-")
    .replace(/â€"/g, "-")
    .replace(/â€¦/g, "...")
    .replace(/â€¢/g, "•")
    .replace(/Â/g, "")
    .replace(/\u00A0/g, " "); // non-breaking space
  
  // Ensure proper hyphenation for compound adjectives
  cleaned = cleaned.replace(/(\w+)\s+(based|oriented|driven|focused|facing|ready|minded|specific|related|centered|friendly|aware)/gi, "$1-$2");
  cleaned = cleaned.replace(/\b(well|self|high|low|long|short|full|part|cross|inter|multi|over|under|pre|post|re|co|sub|super|non|anti|pro|semi|mid|micro|macro|meta)\s+(\w+)\b/gi, "$1-$2");
  
  // Ensure dates are properly formatted with hyphens
  cleaned = cleaned.replace(/(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*(?:to|–|—|-|through|until)\s*(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)/gi, "$1 - $2");
  
  // Format year ranges with hyphens
  cleaned = cleaned.replace(/(\b\d{4})\s*(?:to|–|—|-|through|until)\s*(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Ensure proper spacing around hyphens in date ranges
  cleaned = cleaned.replace(/(\b\d{4})-(\b\d{4}|Present)/gi, "$1 - $2")
    .replace(/(\b\d{4})\s+-\s+(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Remove fabricated statistics and percentages
  cleaned = cleaned.replace(/increased (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "increased $1")
    .replace(/improved (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "improved $1")
    .replace(/reduced (?:by |)(costs?|expenses?|time|errors?|defects?|complaints?|turnover|waste|downtime|delays?)(?:\s+by\s+)(\d+)%/gi, "reduced $1")
    .replace(/achieved (?:a |)(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "achieved significant $2")
    .replace(/(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "significant $2")
    .replace(/(\d+)% of (customers?|clients?|users?|employees?|team members?|projects?|goals?|targets?|objectives?|requirements?)/gi, "many $2")
    .replace(/saved (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "saved costs")
    .replace(/generated (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "generated revenue")
    .replace(/managed (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "managed a team of professionals")
    .replace(/led (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "led a team")
    .replace(/oversaw (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "oversaw a team")
    .replace(/supervised (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "supervised a team")
    .replace(/completed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?)/gi, "completed multiple $2")
    .replace(/handled (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "handled multiple $2")
    .replace(/managed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "managed multiple $2")
    .replace(/delivered (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|presentations?|trainings?|workshops?)/gi, "delivered multiple $2")
    .replace(/within (\d+)% of (budget|schedule|timeline|deadline)/gi, "within $2")
    .replace(/exceeded (?:targets?|goals?|objectives?|expectations?|quotas?)(?:\s+by\s+)(\d+)%/gi, "exceeded $1")
    .replace(/under budget by (?:approximately |about |)(\d+)%/gi, "under budget")
    .replace(/ahead of schedule by (?:approximately |about |)(\d+)%/gi, "ahead of schedule");
  
  return cleaned;
}

// Convert markdown to RTF format
function convertMarkdownToRTF(markdown: string, type: 'cv' | 'coverLetter'): string {
  // RTF header with better font definitions
  let rtf = '{\\rtf1\\ansi\\ansicpg1252\\cocoartf2580\\cocoasubrtf220\n';
  rtf += '{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica-Bold;\\f1\\fswiss\\fcharset0 Helvetica;\\f2\\froman\\fcharset0 Times-Roman;}\n';
  
  if (type === 'cv') {
    // For CV, use color table with indigo
    rtf += '{\\colortbl;\\red63\\green81\\blue181;\\red0\\green0\\blue0;}\n';
  } else {
    // For cover letter, use only black color
    rtf += '{\\colortbl;\\red0\\green0\\blue0;}\n';
  }
  
  rtf += '\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0\n';
  rtf += '\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n\n';
  
  // Split the content into lines
  const lines = markdown.split('\n');
  let inList = false;
  let inSection = false;
  let inSubsection = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        rtf += '\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n';
        inList = false;
      }
      rtf += '\\par\n';
      continue;
    }
    
    // Check if this is the first line (name)
    if (i === 0) {
      if (type === 'cv') {
        // For CV, use indigo color for name
        rtf += `{\\f0\\fs32\\b\\cf1 ${escapeRTF(line)}}\\par\\par\n`; // Reduced from fs36
      } else {
        // For cover letter, check if it's "Dear Hiring Manager"
        if (line.startsWith('Dear ')) {
          // Use normal black text for salutation
          rtf += `{\\f1\\fs22 ${escapeRTF(line)}}\\par\\par\n`;
        } else {
          // Use normal black text for name
          rtf += `{\\f0\\fs28\\b ${escapeRTF(line)}}\\par\\par\n`;
        }
      }
      continue;
    }
    
    // Check if this is a main section (all caps)
    if (line === line.toUpperCase() && line.length > 2 && line.length < 30) {
      if (inList) {
        rtf += '\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n';
        inList = false;
      }
      
      rtf += '\\par\n'; // Add extra space before section
      
      if (type === 'cv') {
        // For CV, use indigo color for section headers
        rtf += `{\\f0\\fs24\\b\\cf1 ${escapeRTF(line)}}\\par\n`; // Reduced from fs28
        
        // Add a horizontal line for CV
        rtf += '{\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}\n';
      } else {
        // For cover letter, use black text
        rtf += `{\\f0\\fs24\\b ${escapeRTF(line)}}\\par\n`;
      }
      
      rtf += '\\par\n';
      
      inSection = true;
      inSubsection = false;
      continue;
    }
    
    // Check if this is a subsection (Title Case, typically company or institution name)
    if (inSection && !inSubsection && 
        line.split(' ').every(word => word.length > 0 && (word[0] === word[0].toUpperCase() || word.match(/^(at|of|in|the|and|or)$/i)))) {
      if (inList) {
        rtf += '\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n';
        inList = false;
      }
      
      rtf += `{\\f0\\fs22\\b ${escapeRTF(line)}}\\par\n`; // Reduced from fs24
      inSubsection = true;
      continue;
    }
    
    // Check if this is a bullet point
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        rtf += '\\pard\\tx720\\fi-360\\li720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n';
        inList = true;
      }
      
      const itemContent = line.substring(2).trim();
      rtf += `{\\f1\\fs22 \\bullet\\tab ${escapeRTF(itemContent)}}\\par\n`; // Reduced from fs24
      continue;
    }
    
    // Regular paragraph
    if (inList) {
      rtf += '\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n';
      inList = false;
    }
    
    // Process bold and italic formatting
    let formattedLine = line;
    
    // Replace bold
    formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      return `{\\b ${escapeRTF(p1)}}`;
    });
    
    // Replace italic
    formattedLine = formattedLine.replace(/\*(.*?)\*/g, (match, p1) => {
      return `{\\i ${escapeRTF(p1)}}`;
    });
    
    // Replace links
    formattedLine = formattedLine.replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
      return `${escapeRTF(p1)}`;
    });
    
    rtf += `{\\f1\\fs22 ${formattedLine}}\\par\n`; // Reduced from fs24
  }
  
  // Close the RTF document
  rtf += '}';
  
  return rtf;
}

// Escape special RTF characters
function escapeRTF(text: string): string {
  // First fix common Unicode character issues
  let cleanedText = text
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2014/g, "-") // em dash
    .replace(/…/g, "...")
    .replace(/\u2026/g, "...")
    .replace(/•/g, "•")
    .replace(/◦/g, "•")
    .replace(/·/g, "•")
    .replace(/\u2022/g, "•") // bullet
    .replace(/\u25E6/g, "•") // white bullet
    .replace(/\u2023/g, "•") // triangular bullet
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "-")
    .replace(/â€"/g, "-")
    .replace(/â€¦/g, "...")
    .replace(/â€¢/g, "•")
    .replace(/Â/g, "")
    .replace(/\u00A0/g, " "); // non-breaking space
  
  // Ensure proper hyphenation for compound adjectives
  cleanedText = cleanedText
    .replace(/(\w+)\s+(based|oriented|driven|focused|facing|ready|minded|specific|related|centered|friendly|aware)/gi, "$1-$2")
    .replace(/\b(well|self|high|low|long|short|full|part|cross|inter|multi|over|under|pre|post|re|co|sub|super|non|anti|pro|semi|mid|micro|macro|meta)\s+(\w+)\b/gi, "$1-$2");
  
  // Ensure dates are properly formatted with hyphens
  cleanedText = cleanedText
    .replace(/(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*(?:to|–|—|-|through|until)\s*(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)/gi, "$1 - $2");
  
  // Format year ranges with hyphens
  cleanedText = cleanedText
    .replace(/(\b\d{4})\s*(?:to|–|—|-|through|until)\s*(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Ensure proper spacing around hyphens in date ranges
  cleanedText = cleanedText
    .replace(/(\b\d{4})-(\b\d{4}|Present)/gi, "$1 - $2")
    .replace(/(\b\d{4})\s+-\s+(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Remove fabricated statistics and percentages
  cleanedText = cleanedText
    .replace(/increased (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "increased $1")
    .replace(/improved (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "improved $1")
    .replace(/reduced (?:by |)(costs?|expenses?|time|errors?|defects?|complaints?|turnover|waste|downtime|delays?)(?:\s+by\s+)(\d+)%/gi, "reduced $1")
    .replace(/achieved (?:a |)(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "achieved significant $2")
    .replace(/(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "significant $2")
    .replace(/(\d+)% of (customers?|clients?|users?|employees?|team members?|projects?|goals?|targets?|objectives?|requirements?)/gi, "many $2")
    .replace(/saved (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "saved costs")
    .replace(/generated (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "generated revenue")
    .replace(/managed (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "managed a team of professionals")
    .replace(/led (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "led a team")
    .replace(/oversaw (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "oversaw a team")
    .replace(/supervised (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "supervised a team")
    .replace(/completed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?)/gi, "completed multiple $2")
    .replace(/handled (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "handled multiple $2")
    .replace(/managed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "managed multiple $2")
    .replace(/delivered (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|presentations?|trainings?|workshops?)/gi, "delivered multiple $2")
    .replace(/within (\d+)% of (budget|schedule|timeline|deadline)/gi, "within $2")
    .replace(/exceeded (?:targets?|goals?|objectives?|expectations?|quotas?)(?:\s+by\s+)(\d+)%/gi, "exceeded $1")
    .replace(/under budget by (?:approximately |about |)(\d+)%/gi, "under budget")
    .replace(/ahead of schedule by (?:approximately |about |)(\d+)%/gi, "ahead of schedule");
  
  // Then escape RTF special characters
  return cleanedText
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ')
    .replace(/\r/g, '')
    .replace(/\t/g, '\\tab ')
    .replace(/\'/g, '\\\'')
    .replace(/\"/g, '\\"')
    .replace(/\~/g, '\\~')
    .replace(/\-/g, '\\-')
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\|/g, '\\|')
    .replace(/\:/g, '\\:')
    .replace(/\;/g, '\\;')
    .replace(/\^/g, '\\^')
    .replace(/\&/g, '\\&');
}

// Helper function to process markdown for PDF
function processMarkdownForPDF(text: string): string {
  // Extract the name from the first line (usually # Name)
  const nameMatch = text.match(/^# (.*?)(?:\n|$)/);
  const name = nameMatch ? nameMatch[1] : 'CV';
  
  // This is a simplified markdown processor
  let processed = text;
  
  // Replace headers
  processed = processed.replace(/^# .*?\n/m, `${name}\n\n`); // Replace first header with just the name
  processed = processed.replace(/^# (.*?)$/gm, '$1');
  processed = processed.replace(/^## (.*?)$/gm, '$1');
  processed = processed.replace(/^### (.*?)$/gm, '$1');
  
  // Replace bullet points with proper bullet character
  processed = processed.replace(/^\* (.*?)$/gm, '• $1');
  processed = processed.replace(/^- (.*?)$/gm, '• $1');
  
  // Replace bold and italic
  processed = processed.replace(/\*\*(.*?)\*\*/g, '$1');
  processed = processed.replace(/\*(.*?)\*/g, '$1');
  
  // Replace links
  processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
  
  // Remove LinkedIn URL if present
  processed = processed.replace(/LinkedIn: \[(.*?)\]\(.*?\)/g, 'LinkedIn: $1');
  processed = processed.replace(/LinkedIn: https?:\/\/.*?(?:\n|$)/gm, '');
  
  // Fix common special character issues
  processed = processed
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2014/g, "-") // em dash
    .replace(/…/g, "...")
    .replace(/\u2026/g, "...")
    .replace(/•/g, "•")
    .replace(/◦/g, "•")
    .replace(/·/g, "•")
    .replace(/\u2022/g, "•") // bullet
    .replace(/\u25E6/g, "•") // white bullet
    .replace(/\u2023/g, "•") // triangular bullet
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "-")
    .replace(/â€"/g, "-")
    .replace(/â€¦/g, "...")
    .replace(/â€¢/g, "•")
    .replace(/Â/g, "")
    .replace(/\u00A0/g, " "); // non-breaking space
  
  // Ensure proper hyphenation for compound adjectives
  processed = processed
    .replace(/(\w+)\s+(based|oriented|driven|focused|facing|ready|minded|specific|related|centered|friendly|aware)/gi, "$1-$2")
    .replace(/\b(well|self|high|low|long|short|full|part|cross|inter|multi|over|under|pre|post|re|co|sub|super|non|anti|pro|semi|mid|micro|macro|meta)\s+(\w+)\b/gi, "$1-$2");
  
  // Ensure dates are properly formatted with hyphens
  processed = processed
    .replace(/(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*(?:to|–|—|-|through|until)\s*(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)/gi, "$1 - $2");
  
  // Format year ranges with hyphens
  processed = processed
    .replace(/(\b\d{4})\s*(?:to|–|—|-|through|until)\s*(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Ensure proper spacing around hyphens in date ranges
  processed = processed
    .replace(/(\b\d{4})-(\b\d{4}|Present)/gi, "$1 - $2")
    .replace(/(\b\d{4})\s+-\s+(\b\d{4}|Present)/gi, "$1 - $2");
  
  // Remove fabricated statistics and percentages
  processed = processed
    .replace(/increased (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "increased $1")
    .replace(/improved (?:by |)(efficiency|productivity|sales|revenue|performance|growth|traffic|engagement|conversion|retention|satisfaction|quality|output|ROI|profit|margin)(?:\s+by\s+)(\d+)%/gi, "improved $1")
    .replace(/reduced (?:by |)(costs?|expenses?|time|errors?|defects?|complaints?|turnover|waste|downtime|delays?)(?:\s+by\s+)(\d+)%/gi, "reduced $1")
    .replace(/achieved (?:a |)(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "achieved significant $2")
    .replace(/(\d+)% (increase|improvement|reduction|growth|efficiency|accuracy)/gi, "significant $2")
    .replace(/(\d+)% of (customers?|clients?|users?|employees?|team members?|projects?|goals?|targets?|objectives?|requirements?)/gi, "many $2")
    .replace(/saved (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "saved costs")
    .replace(/generated (?:over |approximately |about |)(\$[\d,]+|£[\d,]+|€[\d,]+|\d+ dollars|\d+ pounds|\d+ euros)/gi, "generated revenue")
    .replace(/managed (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "managed a team of professionals")
    .replace(/led (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "led a team")
    .replace(/oversaw (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "oversaw a team")
    .replace(/supervised (?:a |)(?:team of |)(\d+)(?:-\d+|) (employees?|team members?|staff|people|professionals?|developers?|engineers?|designers?)/gi, "supervised a team")
    .replace(/completed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?)/gi, "completed multiple $2")
    .replace(/handled (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "handled multiple $2")
    .replace(/managed (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|clients?|customers?|accounts?)/gi, "managed multiple $2")
    .replace(/delivered (?:over |approximately |about |)(\d+) (projects?|tasks?|assignments?|initiatives?|presentations?|trainings?|workshops?)/gi, "delivered multiple $2")
    .replace(/within (\d+)% of (budget|schedule|timeline|deadline)/gi, "within $2")
    .replace(/exceeded (?:targets?|goals?|objectives?|expectations?|quotas?)(?:\s+by\s+)(\d+)%/gi, "exceeded $1")
    .replace(/under budget by (?:approximately |about |)(\d+)%/gi, "under budget")
    .replace(/ahead of schedule by (?:approximately |about |)(\d+)%/gi, "ahead of schedule");
  
  return processed;
}