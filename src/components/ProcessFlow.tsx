import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FileText, Upload, Edit, Briefcase, Award, Download, Target, CheckCircle, Zap } from 'lucide-react';

const ProcessFlow: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative py-20 overflow-hidden" ref={ref}>
      <motion.div
        className="container mx-auto max-w-6xl px-4"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 bg-white p-6 rounded-lg shadow-lg border-2 border-indigo-100"
          >
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="bg-indigo-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <Upload size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">Upload Your CV</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <CheckCircle size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Upload existing CV or create new</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Automatic information extraction</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Smart formatting detection</span>
              </li>
            </ul>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 bg-white p-6 rounded-lg shadow-lg border-2 border-indigo-100 md:mt-8"
          >
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="bg-indigo-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <Target size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">Add Job Description</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <Zap size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>AI analyzes requirements</span>
              </li>
              <li className="flex items-start">
                <Zap size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Identifies key skills needed</span>
              </li>
              <li className="flex items-start">
                <Zap size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Matches your experience</span>
              </li>
            </ul>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 bg-white p-6 rounded-lg shadow-lg border-2 border-indigo-100"
          >
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="bg-indigo-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <Download size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">Get Tailored CVs</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <Award size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>3 professional CV versions</span>
              </li>
              <li className="flex items-start">
                <Award size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>Matching cover letters</span>
              </li>
              <li className="flex items-start">
                <Award size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span>ATS-optimized formats</span>
              </li>
            </ul>
          </motion.div>

          {/* Connecting Lines (visible on desktop) */}
          <div className="absolute top-1/2 left-0 w-full hidden md:block">
            <svg className="w-full h-4" viewBox="0 0 800 20">
              <motion.path
                d="M 0,10 L 800,10"
                stroke="#818CF8"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                variants={lineVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessFlow;