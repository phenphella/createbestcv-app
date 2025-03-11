import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Target, Zap, FileText } from 'lucide-react';

const AnimatedFeatures: React.FC = () => {
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
      },
    },
  };

  const features = [
    {
      icon: <Target size={24} className="text-white" />,
      title: "Job Description Analysis",
      description: "Our AI reads your target job description and identifies key requirements, skills, and keywords that hiring managers are looking for.",
    },
    {
      icon: <Zap size={24} className="text-white" />,
      title: "Perfect Skill Matching",
      description: "We automatically highlight your most relevant skills and experiences that match what the employer needs, increasing your chances of getting an interview.",
    },
    {
      icon: <FileText size={24} className="text-white" />,
      title: "Tailored Cover Letters",
      description: "Get a perfectly matched cover letter that addresses specific job requirements and explains why you're the ideal candidate for this particular role.",
    },
  ];

  return (
    <div ref={ref} className="py-16 px-4 bg-indigo-600 text-white">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold mb-4">Why We're Different</h2>
          <p className="text-xl max-w-3xl mx-auto">
            Most CV builders create generic templates. We create <span className="font-bold underline">job-specific CVs</span> that get you noticed.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-indigo-700 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300"
              variants={itemVariants}
            >
              <div className="bg-indigo-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-indigo-100">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedFeatures;