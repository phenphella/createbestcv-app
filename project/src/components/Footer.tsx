import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Create Best CV. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <span>Made with</span>
            <Heart size={16} className="text-red-500" />
            <span>for job seekers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;