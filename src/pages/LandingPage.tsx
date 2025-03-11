import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Upload, Edit, Briefcase, Award, Download, Target, CheckCircle, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { getFormattedPrice } from '../services/paymentConfig';
import ProcessFlow from '../components/ProcessFlow';
import AnimatedComparison from '../components/AnimatedComparison';
import AnimatedFeatures from '../components/AnimatedFeatures';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Sparkles size={16} className="mr-1" />
                <span>AI-Powered Job Targeting</span>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                The CV Builder That <span className="text-indigo-600">Actually Reads</span> Your Job Description
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Unlike generic CV builders, we analyze your specific job description to create a perfectly tailored CV that highlights exactly what employers are looking for.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Link
                  to="/upload-cv"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Your CV
                </Link>
                <Link
                  to="/create-cv"
                  className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 px-6 rounded-lg border border-indigo-600 transition-colors flex items-center justify-center"
                >
                  <Edit size={20} className="mr-2" />
                  Create New CV
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Person working on resume"
                  className="rounded-lg shadow-xl"
                />
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-indigo-100 max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <div className="flex items-start">
                    <Target size={24} className="text-indigo-600 mr-2 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Our AI analyzes job descriptions</span> to identify exactly what skills and experiences employers are looking for
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <ProcessFlow />

      {/* Key Differentiator Section */}
      <AnimatedFeatures />

      {/* Comparison Section */}
      <AnimatedComparison />

      {/* Benefits */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our CV Optimizer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Target size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Job-Specific Tailoring</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes job descriptions to identify key skills and requirements, then tailors your CV to highlight relevant experiences that match exactly what employers are looking for.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Award size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multiple Options</h3>
                <p className="text-gray-600">
                  Receive three different CV and cover letter variations, each with a unique style and approach but all specifically tailored to your target job.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Zap size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">ATS Optimization</h3>
                <p className="text-gray-600">
                  Our CVs are optimized for Applicant Tracking Systems by incorporating the exact keywords and phrases from the job description, increasing your chances of getting past automated filters.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Sparkles size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Affordable Price</h3>
                <p className="text-gray-600">
                  Get professional CV optimization for just {getFormattedPrice()} - a small investment that could make the difference in landing your dream job.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-600 text-white">
        <motion.div 
          className="container mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Get the Job You Deserve?</h2>
          <p className="text-xl mb-8">
            Stop sending generic CVs. Start sending perfectly tailored applications that get noticed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/upload-cv"
              className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Upload size={20} className="mr-2" />
              Upload Your CV
            </Link>
            <Link
              to="/create-cv"
              className="bg-transparent hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg border border-white transition-colors flex items-center justify-center"
            >
              <Edit size={20} className="mr-2" />
              Create New CV
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;