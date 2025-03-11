import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { useCV } from '../context/CVContext';

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

const CreateCV: React.FC = () => {
  const navigate = useNavigate();
  const { cvData, setCVData } = useCV();
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: cvData.personalInfo.fullName || '',
      email: cvData.personalInfo.email || '',
      phone: cvData.personalInfo.phone || '',
      address: cvData.personalInfo.address || '',
      linkedIn: cvData.personalInfo.linkedIn || '',
    },
    education: cvData.education.length > 0 ? cvData.education.map(edu => ({
      id: edu.id || Date.now().toString(),
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
    })) : [] as Education[],
    workExperience: cvData.workExperience.length > 0 ? cvData.workExperience.map(work => ({
      id: work.id || Date.now().toString(),
      company: work.company,
      position: work.position,
      startDate: work.startDate,
      endDate: work.endDate,
      description: work.description,
    })) : [] as WorkExperience[],
    skills: cvData.skills || '',
    hobbies: cvData.hobbies || '',
  });

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setFormData({
      ...formData,
      education: [...formData.education, newEducation],
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData({
      ...formData,
      education: formData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu.id !== id),
    });
  };

  const addWorkExperience = () => {
    const newWorkExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, newWorkExperience],
    });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.map(work => 
        work.id === id ? { ...work, [field]: value } : work
      ),
    });
  };

  const removeWorkExperience = (id: string) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter(work => work.id !== id),
    });
  };

  const handlePersonalInfoChange = (field: keyof typeof formData.personalInfo, value: string) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [field]: value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save the form data to the context
    setCVData({
      personalInfo: formData.personalInfo,
      education: formData.education,
      workExperience: formData.workExperience,
      skills: formData.skills,
      hobbies: formData.hobbies,
    });
    navigate('/job-description');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Create Your CV</h1>
        <p className="text-gray-600">
          Fill in the details below to create your CV from scratch
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.personalInfo.fullName}
                onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.personalInfo.address}
                onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.personalInfo.linkedIn}
                onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <button
              type="button"
              onClick={addEducation}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={18} className="mr-1" />
              Add Education
            </button>
          </div>

          {formData.education.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <GraduationCap size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No education entries yet. Click "Add Education" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.education.map((edu) => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Education Entry</h3>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Experience */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            <button
              type="button"
              onClick={addWorkExperience}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={18} className="mr-1" />
              Add Work Experience
            </button>
          </div>

          {formData.workExperience.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <Briefcase size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No work experience entries yet. Click "Add Work Experience" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.workExperience.map((work) => (
                <div key={work.id} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Work Experience Entry</h3>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(work.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => updateWorkExperience(work.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) => updateWorkExperience(work.id, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="month"
                          value={work.startDate}
                          onChange={(e) => updateWorkExperience(work.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="month"
                          value={work.endDate}
                          onChange={(e) => updateWorkExperience(work.id, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={work.description}
                        onChange={(e) => updateWorkExperience(work.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe your responsibilities and achievements"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List your skills (separated by commas)
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., JavaScript, React, Project Management, Communication"
            ></textarea>
          </div>
        </div>

        {/* Hobbies */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Hobbies & Interests</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List your hobbies and interests (optional)
            </label>
            <textarea
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Photography, Hiking, Reading, Volunteering"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCV;