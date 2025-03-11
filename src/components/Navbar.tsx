import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <FileText size={24} />
          <span>Create Best CV</span>
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-indigo-200 transition-colors">
            Home
          </Link>
          <Link to="/upload-cv" className="hover:text-indigo-200 transition-colors">
            Upload CV
          </Link>
          <Link to="/create-cv" className="hover:text-indigo-200 transition-colors">
            Create CV
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;