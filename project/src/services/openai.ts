import OpenAI from 'openai';
import mammoth from 'mammoth';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
});

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedIn: string;
  };
  education: Array<{
    id?: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  workExperience: Array<{
    id?: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string;
  hobbies: string;
}

export interface GeneratedCV {
  id: number;
  title: string;
  description: string;
  cv: string;
  coverLetter: string;
}

// Function to generate CV and cover letter using OpenAI
export async function generateCVAndCoverLetter(
  cvData: CVData,
  jobDescription: string,
  companyName?: string,
  applicantName?: string,
  languagePreference: 'uk' | 'us' = 'uk'
): Promise<GeneratedCV[]> {
  try {
    // If hobbies are empty, generate some based on the person's profile
    if (!cvData.hobbies || cvData.hobbies.trim() === '') {
      cvData.hobbies = await generateHobbies(cvData, jobDescription);
    }
    
    // Format the CV data for the prompt
    const formattedCV = formatCVForPrompt(cvData);
    
    // Create the prompt for OpenAI
    const prompt = createPrompt(formattedCV, jobDescription, companyName, applicantName, languagePreference);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional ${languagePreference === 'uk' ? 'UK' : 'US'}-based CV writer and career consultant specializing in career transitions and highlighting transferable skills. Generate a highly tailored CV and cover letter for a job application, ensuring ${languagePreference === 'uk' ? 'UK' : 'US'} spelling and grammar.

Format the document with proper structure:
- Use the person's name as the main heading (without any # symbols)
- Use BOLD CAPITAL LETTERS for main section headings (e.g., WORK EXPERIENCE, EDUCATION, SKILLS)
- Use Bold Title Case for subsection headings (e.g., company names, university names)
- Use proper bullet points (*) for listing responsibilities, achievements, and skills
- Do not include LinkedIn URLs, only mention LinkedIn profile name if relevant
- Use hyphens (-) between words where appropriate, especially for compound adjectives (e.g., "well-organized", "customer-focused")
- Always use a hyphen (-) between date ranges (e.g., "2018 - 2022", "January 2018 - December 2022")

IMPORTANT: DO NOT include specific percentages, metrics, or statistics in bullet points unless they are explicitly provided in the original CV data. Do not fabricate or invent quantifiable achievements.

CRITICAL: When the target job differs from the candidate's experience:
- Focus heavily on identifying and emphasizing TRANSFERABLE SKILLS
- Reframe past experiences to highlight relevance to the new role
- Use language that bridges different industries or roles
- NEVER fabricate experience, qualifications, or technical skills
- Instead, highlight soft skills, adaptable competencies, and relevant achievements
- Demonstrate how past responsibilities relate to the requirements of the new role

Ensure bullet points are well-structured and properly formatted.

Format the document neatly with proper spacing and alignment for a visually appealing yet ATS-friendly design.

Extract key skills, achievements, and experiences from the user's existing CV (or manually entered details).

Align these skills with the job description provided, ensuring relevance and clarity.

Optimise content for readability and impact, focusing on transferable skills and accomplishments over generic duties.


Cover Letter Instructions:

The cover letter MUST be formatted as a plain text formal business letter with NO special formatting, styling, or colored elements.

If a company name is provided, use it in the cover letter. If not, use a generic reference like "your company".

DO NOT include an addressee at the top of the cover letter.

CRITICAL: The salutation "Dear Hiring Manager," MUST be in plain text as a normal paragraph, NOT as a heading or with any special formatting.

The cover letter should be comprehensive and detailed, filling approximately a full page in length (around 400-500 words).

Start with a strong opening that immediately highlights the candidate's fit for the role.

For career transitions, explicitly address the change and explain how the candidate's background provides valuable perspective.

The body of the letter should:
- Highlight 5-7 key achievements relevant to the position with specific details
- Emphasize both hard skills AND soft skills from the candidate's background
- Reference relevant education, achievements, work experience, and even hobbies if they demonstrate transferable skills
- Address specific requirements mentioned in the job posting with evidence of meeting them
- Demonstrate knowledge of the industry and potential employer needs

Use persuasive, engaging language that aligns the candidate's experience with the job requirements.

If an applicant name is provided, use it to sign the cover letter. If not, use the full name from the CV.

The entire cover letter should be in plain black text on white background with NO formatting beyond standard paragraphs.


Context for AI:

The user has either uploaded an existing CV (where key details should be extracted) or manually entered their work history.

The job description provided should be thoroughly analysed to match the candidate's experience and skills.

Ensure that all content is factually correct, avoiding assumptions or fabrications.

Do not include any unnecessary symbols or unprofessional formatting.

IMPORTANT: Use standard ASCII characters only - avoid fancy quotes, em dashes, and other special characters that might display incorrectly. Use regular quotes ("), apostrophes ('), and hyphens (-) instead.

CRITICAL: Use ${languagePreference === 'uk' ? 'UK' : 'US'} English spelling throughout the document. For example, ${languagePreference === 'uk' ? 'use "organise", "colour", "specialise", "centre", "analyse", "programme", "travelled", "defence", "licence" (noun), "practise" (verb)' : 'use "organize", "color", "specialize", "center", "analyze", "program", "traveled", "defense", "license", "practice"'}.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 16000, // Increased token limit for longer content
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the content to extract the three CV variations
    return parseOpenAIResponse(content);
  } catch (error) {
    console.error("Error generating CV:", error);
    throw error;
  }
}

// Function to generate hobbies based on the person's profile
async function generateHobbies(cvData: CVData, jobDescription: string): Promise<string> {
  try {
    // Create a prompt to generate relevant hobbies
    const prompt = `
Based on the following information about a person and the job they're applying for, suggest 3-5 appropriate hobbies or interests that would complement their professional profile. The hobbies should be realistic, balanced between personal and professional interests, and potentially relevant to the job where appropriate.

Person's Information:
- Name: ${cvData.personalInfo.fullName}
- Professional Background: ${cvData.workExperience.map(work => `${work.position} at ${work.company}`).join(', ')}
- Skills: ${cvData.skills}

Job Description:
${jobDescription.substring(0, 500)}...

Please provide a comma-separated list of 3-5 hobbies/interests that would be appropriate for this person's CV. Make them specific rather than generic where possible.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a career coach who helps job seekers create well-rounded professional profiles. Your task is to suggest appropriate hobbies and interests for a CV that complement a person's professional background."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    // Get the generated hobbies
    const generatedHobbies = response.choices[0].message.content?.trim() || "Reading, outdoor activities, volunteering";
    
    // If the response is too short, use default hobbies
    if (generatedHobbies.length < 10) {
      return "Reading professional literature, participating in industry meetups, outdoor activities, volunteering, and continuous learning through online courses";
    }
    
    return generatedHobbies;
  } catch (error) {
    console.error("Error generating hobbies:", error);
    // Return default hobbies if there's an error
    return "Reading, outdoor activities, volunteering, traveling, and continuous learning";
  }
}

// Function to analyze job-CV relevance and identify transferable skills
async function analyzeJobCVRelevance(cvData: CVData, jobDescription: string): Promise<{
  relevanceScore: number;
  transferableSkills: string[];
  recommendations: string;
}> {
  try {
    // Create a prompt to analyze relevance and identify transferable skills
    const prompt = `
Analyze the following CV information and job description to:
1. Determine how directly relevant the person's experience is to the job (score from 1-10)
2. Identify key transferable skills that would be valuable for the new role
3. Provide recommendations for how to position their experience for this role

CV Information:
${JSON.stringify({
  workExperience: cvData.workExperience,
  skills: cvData.skills,
  education: cvData.education
}, null, 2)}

Job Description:
${jobDescription}

Please respond in JSON format with the following structure:
{
  "relevanceScore": number from 1-10,
  "transferableSkills": ["skill1", "skill2", "skill3", ...],
  "recommendations": "Brief paragraph with recommendations"
}
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor specializing in career transitions and identifying transferable skills. Analyze the CV and job description to provide insights on relevance and transferable skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing job-CV relevance:", error);
    // Return default values if there's an error
    return {
      relevanceScore: 5,
      transferableSkills: ["Communication", "Problem-solving", "Adaptability", "Time management", "Teamwork"],
      recommendations: "Focus on highlighting transferable skills and adaptable competencies rather than specific technical experience."
    };
  }
}

// Helper function to format CV data for the prompt
function formatCVForPrompt(cvData: CVData): string {
  let formattedCV = `# Personal Information\n`;
  formattedCV += `Name: ${cvData.personalInfo.fullName}\n`;
  formattedCV += `Email: ${cvData.personalInfo.email}\n`;
  formattedCV += `Phone: ${cvData.personalInfo.phone}\n`;
  formattedCV += `Address: ${cvData.personalInfo.address}\n`;
  formattedCV += `LinkedIn: ${cvData.personalInfo.linkedIn}\n\n`;

  formattedCV += `# Education\n`;
  cvData.education.forEach((edu, index) => {
    formattedCV += `## Education ${index + 1}\n`;
    formattedCV += `Institution: ${edu.institution}\n`;
    formattedCV += `Degree: ${edu.degree}\n`;
    formattedCV += `Field of Study: ${edu.fieldOfStudy}\n`;
    formattedCV += `Start Date: ${edu.startDate}\n`;
    formattedCV += `End Date: ${edu.endDate}\n`;
    formattedCV += `Description: ${edu.description}\n\n`;
  });

  formattedCV += `# Work Experience\n`;
  cvData.workExperience.forEach((work, index) => {
    formattedCV += `## Work Experience ${index + 1}\n`;
    formattedCV += `Company: ${work.company}\n`;
    formattedCV += `Position: ${work.position}\n`;
    formattedCV += `Start Date: ${work.startDate}\n`;
    formattedCV += `End Date: ${work.endDate}\n`;
    formattedCV += `Description: ${work.description}\n\n`;
  });

  formattedCV += `# Skills\n${cvData.skills}\n\n`;
  formattedCV += `# Hobbies\n${cvData.hobbies}`;

  return formattedCV;
}

// Helper function to create the prompt for OpenAI
function createPrompt(
  formattedCV: string, 
  jobDescription: string, 
  companyName?: string, 
  applicantName?: string,
  languagePreference: 'uk' | 'us' = 'uk'
): string {
  return `
I need you to create three different versions of a comprehensive, detailed resume and cover letter based on my CV information and a job description. Each resume should be extensive and span at least 4-5 pages in length with extremely detailed work experience sections.

# My CV Information:
${formattedCV}

# Job Description:
${jobDescription}

${companyName ? `# Company Name: ${companyName}` : ''}
${applicantName ? `# Applicant Name: ${applicantName}` : ''}

# Language Preference: ${languagePreference === 'uk' ? 'UK English' : 'US English'}

IMPORTANT INSTRUCTIONS:
- Use ${languagePreference === 'uk' ? 'UK' : 'US'} English spelling throughout (${languagePreference === 'uk' ? 'e.g., organise, colour, specialise, centre' : 'e.g., organize, color, specialize, center'})
- If my experience doesn't directly match the job description, focus on highlighting TRANSFERABLE SKILLS rather than inventing experience
- Reframe my existing experience to show relevance to the new role
- Use language that bridges different industries or roles
- NEVER fabricate experience, qualifications, or technical skills
- Instead, highlight soft skills, adaptable competencies, and relevant achievements
- Demonstrate how my past responsibilities relate to the requirements of the new role
- Use hyphens (-) between words where appropriate, especially for compound adjectives (e.g., "well-organized", "customer-focused", "results-driven")
- ALWAYS use a hyphen (-) between date ranges (e.g., "2018 - 2022", "January 2018 - December 2022", "2018 - Present")
- DO NOT include specific percentages, metrics, or statistics in bullet points unless they are explicitly provided in my original CV data
- DO NOT fabricate or invent quantifiable achievements
- Use standard ASCII characters only - avoid fancy quotes, em dashes, and other special characters
- Use regular quotes ("), apostrophes ('), and hyphens (-) instead of typographic ones

Please create three different versions of my resume and cover letter:

1. Professional & Formal: Classic structure with professional tone, clear section headers in BOLD CAPITAL LETTERS, and consistent formatting. Use bold for all section headings and subheadings, and proper bullet points (*) for listing items.

2. Skills & Achievement-Based: Emphasizes skills and accomplishments, with key achievements in bold. Use BOLD CAPITAL LETTERS for main sections and bold for subsections.

3. Concise & Impactful: A minimalistic, to-the-point format with strategic bolding and clear section spacing. Use BOLD CAPITAL LETTERS for main sections.

For each version:

1. Create a DETAILED resume in a format that:
   - Spans at least 4-5 pages when printed
   - Uses the person's name as the main heading (without any # symbols)
   - Uses BOLD CAPITAL LETTERS for main section headings (e.g., WORK EXPERIENCE, EDUCATION, SKILLS)
   - Uses Bold Title Case for subsection headings (e.g., company names, university names)
   - Uses proper bullet points (*) for listing responsibilities, achievements, and skills
   - Does NOT include LinkedIn URLs, only mention LinkedIn profile name if relevant
   - Includes a comprehensive professional summary/profile section (7-10 sentences)
   - Expands on work experiences with 10-15 detailed bullet points per role that clearly outline:
     * Specific day-to-day responsibilities and duties in great detail
     * Projects managed or contributed to with specific outcomes
     * Team leadership and collaboration experiences with team sizes and structures
     * Tools, technologies, methodologies, and frameworks used with specific examples
     * Challenges overcome with detailed problem-solving approaches
     * Client/stakeholder interactions and relationship management
     * Budget management and resource allocation if applicable
     * Process improvements and efficiency gains implemented
     * Training, mentoring, or knowledge sharing activities
   - Elaborates on achievements with specific details from my actual experience
   - Includes detailed descriptions of projects with technologies used, your role, challenges, and outcomes
   - Organizes skills into detailed categories (technical, soft skills, languages, domain knowledge, etc.)
   - Adds relevant sections like certifications, publications, projects, or professional development
   - Uses industry-specific terminology and buzzwords that match the job description
   - Includes a detailed education section with relevant coursework, academic achievements, and extracurricular activities
   - Adds a section for hobbies/interests that might be relevant to the role or demonstrate transferable skills
   - ALWAYS uses a hyphen (-) between date ranges (e.g., "2018 - 2022", "January 2018 - December 2022")

2. Create a matching cover letter that:
   - Is formatted as a plain text formal business letter with NO special formatting or styling
   - Is comprehensive and detailed, filling approximately a full page in length (400-500 words)
   - Has "Dear Hiring Manager," as a normal plain text salutation (NOT as a heading)
   - Is personalized to the job description with specific company references
   - Highlights 5-7 key achievements relevant to the position with specific details
   - Emphasizes both hard skills AND soft skills from my background
   - References relevant education, achievements, work experience, and hobbies that demonstrate transferable skills
   - Explains motivation and fit for the role with concrete examples
   - Addresses specific requirements mentioned in the job posting with evidence of meeting them
   - Demonstrates knowledge of the industry, company, and potential employer needs
   - Includes a compelling introduction and strong closing statement
   - For career transitions, explicitly addresses the change and explains how my background provides valuable perspective
   - If a company name is provided, uses it throughout the letter instead of generic terms
   - If an applicant name is provided, uses it to sign the letter
   - Uses plain black text on white background with NO formatting beyond standard paragraphs

IMPORTANT: 
1. Use standard ASCII characters only - avoid fancy quotes, em dashes, and other special characters
2. Use regular quotes ("), apostrophes ('), and hyphens (-) instead of typographic ones
3. Keep the font size consistent and readable (equivalent to 11pt)
4. Avoid any strange symbols or characters that might not display correctly
5. ALWAYS use a hyphen (-) between date ranges (e.g., "2018 - 2022", "January 2018 - December 2022")

IMPORTANT: Analyze the job description extremely carefully to identify:
1. Key skills and qualifications required (both explicit and implicit)
2. Industry-specific terminology, buzzwords, and frameworks
3. Soft skills and personality traits valued by the organization
4. Technical competencies and tools needed for success
5. Company values, culture indicators, and mission alignment
6. Reporting structure and team dynamics
7. Performance metrics and success indicators

Then, tailor each resume version to emphasize the aspects of the candidate's experience that best match these requirements. For each work experience entry:
1. Infer and expand on typical responsibilities for someone in that role and industry
2. Add reasonable details to expand thin sections with industry-standard responsibilities
3. Translate general descriptions into specific, detailed bullet points
4. Incorporate relevant keywords from the job description naturally throughout
5. Highlight transferable skills that apply to the target role

IMPORTANT: Make sure to include a HOBBIES AND INTERESTS section in each CV version with 3-5 specific hobbies that show personality and potentially relevant soft skills. If hobbies are provided in the CV information, use those. Otherwise, suggest appropriate hobbies based on the person's professional background and the job they're applying for.

Do not add any false information about qualifications, degrees, or companies worked for, but DO expand significantly on the responsibilities, projects, and achievements that would be reasonable for someone in these positions. Use industry knowledge to flesh out what someone in these roles would typically do day-to-day and what skills they would use.

Format your response as follows:

---VERSION 1: PROFESSIONAL & FORMAL---
# RESUME
(detailed resume content in markdown)

# COVER LETTER
(cover letter content in markdown)

---VERSION 2: SKILLS & ACHIEVEMENT-BASED---
# RESUME
(detailed resume content in markdown)

# COVER LETTER
(cover letter content in markdown)

---VERSION 3: CONCISE & IMPACTFUL---
# RESUME
(detailed resume content in markdown)

# COVER LETTER
(cover letter content in markdown)
`;
}

// Helper function to parse the OpenAI response
function parseOpenAIResponse(content: string): GeneratedCV[] {
  const results: GeneratedCV[] = [];
  
  // Split the content by version markers
  const versions = content.split(/---VERSION \d+: [A-Z & -]+---/);
  
  // Skip the first element if it's empty (which it likely is)
  const startIndex = versions[0].trim() === '' ? 1 : 0;
  
  // Define the titles and descriptions for each version
  const versionInfo = [
    {
      title: "Professional & Formal",
      description: "Standard structure with a professional tone."
    },
    {
      title: "Skills & Achievement-Based",
      description: "Emphasizes skills and accomplishments."
    },
    {
      title: "Concise & Impactful",
      description: "A streamlined, less verbose CV getting straight to the point."
    }
  ];
  
  // Process each version
  for (let i = 0; i < 3; i++) {
    const versionContent = versions[startIndex + i];
    if (!versionContent) continue;
    
    // Split the content into resume and cover letter
    const parts = versionContent.split(/# (RESUME|COVER LETTER)/i);
    
    // Extract resume and cover letter content
    let resume = '';
    let coverLetter = '';
    
    for (let j = 1; j < parts.length; j += 2) {
      const type = parts[j].trim().toUpperCase();
      const content = parts[j + 1]?.trim() || '';
      
      if (type === 'RESUME') {
        resume = content;
      } else if (type === 'COVER LETTER') {
        coverLetter = content ;
      }
    }
    
    // Clean up any special characters that might cause issues
    resume = cleanSpecialCharacters(resume);
    coverLetter = cleanSpecialCharacters(coverLetter);
    
    // Add to results
    results.push({
      id: i + 1,
      title: versionInfo[i].title,
      description: versionInfo[i].description,
      cv: resume,
      coverLetter: coverLetter
    });
  }
  
  return results;
}

// Function to clean up special characters
function cleanSpecialCharacters(text: string): string {
  return text
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
    .replace(/•/g, "*")
    .replace(/◦/g, "*")
    .replace(/·/g, "*")
    .replace(/\u2022/g, "*") // bullet
    .replace(/\u25E6/g, "*") // white bullet
    .replace(/\u2023/g, "*") // triangular bullet
    // Fix common UTF-8 encoding issues
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "-")
    .replace(/â€"/g, "-")
    .replace(/â€¦/g, "...")
    .replace(/â€¢/g, "*")
    .replace(/Â/g, "")
    // Fix non-breaking spaces
    .replace(/\u00A0/g, " ")
    // Fix other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Ensure proper hyphenation for compound adjectives
    .replace(/(\w+)\s+(based|oriented|driven|focused|facing|ready|minded|specific|related|centered|friendly|aware)/gi, "$1-$2")
    .replace(/\b(well|self|high|low|long|short|full|part|cross|inter|multi|over|under|pre|post|re|co|sub|super|non|anti|pro|semi|mid|micro|macro|meta)\s+(\w+)\b/gi, "$1-$2")
    // Ensure dates are properly formatted with hyphens
    .replace(/(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*(?:to|–|—|-|through|until)\s*(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)/gi, "$1 - $2")
    // Format year ranges with hyphens
    .replace(/(\b\d{4})\s*(?:to|–|—|-|through|until)\s*(\b\d{4}|Present)/gi, "$1 - $2")
    // Ensure proper spacing around hyphens in date ranges
    .replace(/(\b\d{4})-(\b\d{4}|Present)/gi, "$1 - $2")
    .replace(/(\b\d{4})\s+-\s+(\b\d{4}|Present)/gi, "$1 - $2")
    // Remove fabricated statistics and percentages
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
}

// Function to extract text from a Word document
export async function extractTextFromWordDocument(file: File): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader ();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || !event.target.result) {
            throw new Error("Failed to read file");
          }
          
          // Use mammoth to extract text from the Word document
          const arrayBuffer = event.target.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          resolve(result.value);
        } catch (error) {
          console.error("Error in mammoth processing:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Error reading file"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error("Error in extractTextFromWordDocument:", error);
    throw error;
  }
}

// Function to parse extracted text into CV data
export async function parseExtractedText(text: string): Promise<CVData> {
  try {
    // First, try to extract information using regex patterns
    const initialData = extractBasicInfo(text);
    
    // Then, use OpenAI to enhance and fill in missing details
    return await enhanceWithOpenAI(text, initialData);
  } catch (error) {
    console.error("Error parsing extracted text:", error);
    // Return the basic extracted data as fallback
    return extractBasicInfo(text);
  }
}

// Extract basic information using regex patterns
function extractBasicInfo(text: string): CVData {
  const cvData: CVData = {
    personalInfo: {
      fullName: extractPersonalInfo(text, 'name') || '',
      email: extractPersonalInfo(text, 'email') || '',
      phone: extractPersonalInfo(text, 'phone') || '',
      address: extractPersonalInfo(text, 'address') || '',
      linkedIn: extractPersonalInfo(text, 'linkedin') || '',
    },
    education: extractEducation(text),
    workExperience: extractWorkExperience(text),
    skills: extractSkills(text),
    hobbies: extractHobbies(text),
  };
  
  return cvData;
}

// Use OpenAI to enhance the extracted CV data
async function enhanceWithOpenAI(originalText: string, initialData: CVData): Promise<CVData> {
  try {
    const prompt = `
I have extracted text from a CV/resume document and need to parse it into structured data. 
I've already attempted to extract some information using regex patterns, but I need your help to improve the extraction and fill in any missing details.

Here is the original text from the CV:
\`\`\`
${originalText}
\`\`\`

Here is what I've extracted so far:
\`\`\`
${JSON.stringify(initialData, null, 2)}
\`\`\`

Please analyze the original text and provide a more accurate and complete structured representation of the CV data in the following JSON format:

{
  "personalInfo": {
    "fullName": "Full name of the person",
    "email": "Email address",
    "phone": "Phone number",
    "address": "Physical address",
    "linkedIn": "LinkedIn profile URL or username"
  },
  "education": [
    {
      "institution": "Name of university/school",
      "degree": "Degree obtained",
      "fieldOfStudy": "Field of study",
      "startDate": "Start date (YYYY-MM format if available, or just YYYY)",
      "endDate": "End date (YYYY-MM format if available, or just YYYY, or 'Present')",
      "description": "Any additional details about the education"
    }
  ],
  "workExperience": [
    {
      "company": "Company name",
      "position": "Job title",
      "startDate": "Start date (YYYY-MM format if available, or just YYYY)",
      "endDate": "End date (YYYY-MM format if available, or just YYYY, or 'Present')",
      "description": "Detailed description of responsibilities and achievements"
    }
  ],
  "skills": "Comprehensive list of skills mentioned in the CV",
  "hobbies": "Any hobbies or interests mentioned in the CV"
}

Important guidelines:
1. Do not invent information that is not present in the original text
2. If certain information is not available, leave it as an empty string
3. For education and work experience, include all entries mentioned in the CV
4. Format dates consistently (YYYY-MM if month is available, otherwise just YYYY)
5. For descriptions, include as much detail as provided in the original text
6. Make sure to properly identify section boundaries (education vs work experience vs skills)
7. Return ONLY the JSON object, no additional text or explanation

Return the complete JSON object with all available information from the CV.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at parsing CV/resume documents and extracting structured information. Your task is to analyze the text from a CV and return a structured JSON representation of the data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the JSON response
    const enhancedData = JSON.parse(content) as CVData;
    
    // Add IDs to education and work experience entries
    enhancedData.education = enhancedData.education.map(edu => ({
      ...edu,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    }));
    
    enhancedData.workExperience = enhancedData.workExperience.map(work => ({
      ...work,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    }));
    
    return enhancedData;
  } catch (error) {
    console.error("Error enhancing CV data with OpenAI:", error);
    // Return the initial data as fallback
    return initialData;
  }
}

// Helper functions for text extraction
function extractPersonalInfo(text: string, type: string): string | null {
  // Very basic extraction - would need to be much more sophisticated in a real app
  const patterns: Record<string, RegExp> = {
    name: /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/m,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    address: /\b\d+\s+[A-Za-z\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?(?:\s+[A-Za-z]+,\s+[A-Za-z]{2}\s+\d{5}(?:-\d{4})?)?/i,
    linkedin: /linkedin\.com\/in\/[A-Za-z0-9_-]+/i,
  };
  
  const match = text.match(patterns[type]);
  return match ? match[0] : null;
}

function extractEducation(text: string): CVData['education'] {
  const education = [];
  
  // Look for education section
  const educationSection = text.match(/education(?:.*?)(?:experience|skills|references|$)/is);
  
  if (educationSection) {
    const eduText = educationSection[0];
    
    // Try to find degree patterns
    const degreeMatches = eduText.match(/(?:Bachelor|Master|PhD|BSc|MSc|BA|MA|MBA|MD|JD)[^\n.]*(?:\n|\.)/g);
    
    if (degreeMatches) {
      for (const match of degreeMatches) {
        // Try to extract institution
        const institutionMatch = match.match(/(?:at|from)\s+([^,\n.]+)/i);
        const institution = institutionMatch ? institutionMatch[1].trim() : '';
        
        // Try to extract degree
        const degreeMatch = match.match(/(Bachelor|Master|PhD|BSc|MSc|BA|MA|MBA|MD|JD)[^\n,]*/i);
        const degree = degreeMatch ? degreeMatch[0].trim() : '';
        
        // Try to extract field of study
        const fieldMatch = match.match(/in\s+([^,\n.]+)/i);
        const fieldOfStudy = fieldMatch ? fieldMatch[1].trim() : '';
        
        // Try to extract dates
        const dateMatch = match.match(/(\d{4})\s*-\s*(\d{4}|Present)/i);
        const startDate = dateMatch ? dateMatch[1] : '';
        const endDate = dateMatch ? dateMatch[2] : '';
        
        education.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate,
          description: '',
        });
      }
    }
  }
  
  // If no education was found, add an empty entry
  if (education.length === 0) {
    education.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  }
  
  return education;
}

function extractWorkExperience(text: string): CVData['workExperience'] {
  try {
    const workExperience = [];
    
    // Look for work experience section
    const experienceSection = text.match(/(?:work experience|professional experience|employment)(?:.*?)(?:education|skills|references|$)/is);
    
    if (experienceSection) {
      const expText = experienceSection[0];
      
      // Try to find job entries
      const jobEntries = expText.split(/\n(?=[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:at|,|\n))/);
      
      for (const entry of jobEntries) {
        if (entry.trim().length < 10) continue; // Skip very short entries
        
        // Try to extract position
        const positionMatch = entry.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        const position = positionMatch ? positionMatch[0].trim() : '';
        
        // Try to extract company
        const companyMatch = entry.match(/(?:at|,)\s+([^,\n]+)/i);
        const company = companyMatch ? companyMatch[1].trim() : '';
        
        // Try to extract dates
        const dateMatch = entry.match(/(\d{4})\s*-\s*(\d{4}|Present)/i);
        const startDate = dateMatch ? dateMatch[1] : '';
        const endDate = dateMatch ? dateMatch[2] : '';
        
        // Use the rest as description
        let description = entry;
        if (position) description = description.replace(position, '');
        if (company) description = description.replace(company, '');
        if (dateMatch) description = description.replace(dateMatch[0], '');
        description = description.replace(/^[,\s]+|[,\s]+$/g, '');
        
        workExperience.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          company,
          position,
          startDate,
          endDate,
          description,
        });
      }
    }
    
    // If no work experience was found, add an empty entry
    if (workExperience.length === 0) {
      workExperience.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
    
    return workExperience;
  } catch (error) {
    console.error("Error in extractWorkExperience:", error);
    return [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    ];
  }
}

function extractSkills(text: string): string {
  try {
    // Look for skills section
    const skillsSection = text.match(/skills(?:.*?)(?:references|education|experience|hobbies|interests|$)/is);
    
    if (skillsSection) {
      // Extract the skills text and clean it up
      let skillsText = skillsSection[0].replace(/skills[:\s]*/i, '').trim();
      
      // Remove any section headers that might have been captured
      skillsText = skillsText.replace(/(?:references|education|experience|hobbies|interests).*/is, '').trim();
      
      return skillsText;
    }
    
    return '';
  } catch (error) {
    console.error("Error in extractSkills:", error);
    return '';
  }
}

function extractHobbies(text: string): string {
  try {
    // Look for hobbies/interests section
    const hobbiesSection = text.match(/(?:hobbies|interests)(?:.*?)(?:references|education|experience|skills|$)/is);
    
    if (hobbiesSection) {
      // Extract the hobbies text and clean it up
      let hobbiesText = hobbiesSection[0].replace(/(?:hobbies|interests)[:\s]*/i, '').trim();
      
      // Remove any section headers that might have been captured
      hobbiesText = hobbiesText.replace(/(?:references|education|experience|skills).*/is, '').trim();
      
      return hobbiesText;
    }
    
    return '';
  } catch (error) {
    console.error("Error in extractHobbies:", error);
    return '';
  }
}