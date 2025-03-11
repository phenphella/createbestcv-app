import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, X } from 'lucide-react';

const AnimatedComparison: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div ref={ref} className="py-16 px-4">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            variants={itemVariants}
          >
            How We Compare
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            See why job-specific tailoring makes all the difference in your job search success
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Generic CV Builders */}
          <motion.div 
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-500">Generic CV Builders</h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <X className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-600">Create one-size-fits-all CVs</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <X className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-600">Focus only on design templates</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <X className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-600">Ignore specific job requirements</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <X className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-600">Miss key keywords that ATS systems look for</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <X className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-600">Require you to figure out what to emphasize</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Our Approach */}
          <motion.div 
            className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 relative"
            variants={itemVariants}
          >
            <div className="absolute -top-3 -right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Our Approach
            </div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Create Best CV</h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <CheckCircle className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-800">Creates job-specific, tailored CVs for each application</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <CheckCircle className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-800">Analyzes job descriptions to identify key requirements</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <CheckCircle className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-800">Highlights your most relevant skills and experiences</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <CheckCircle className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-800">Optimizes for ATS systems with job-specific keywords</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <CheckCircle className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-800">Automatically emphasizes what matters most to employers</span>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedComparison;