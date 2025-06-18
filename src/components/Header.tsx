import React from 'react';
import { Shield, CheckCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-calibra-blue-900" />
              <CheckCircle className="h-4 w-4 text-calibra-green-500 absolute -top-1 -right-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-calibra-blue-900">CALIBRA</span>
              <span className="text-xs text-gray-500 -mt-1">Digital Certification</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
              Certificates
            </a>
            <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
              Laboratories
            </a>
            <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
              Support
            </a>
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-calibra-blue-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-calibra-blue-800 transition-colors">
              Connect Wallet
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-calibra-blue-900 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
                Home
              </a>
              <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
                Certificates
              </a>
              <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
                Laboratories
              </a>
              <a href="#" className="text-gray-700 hover:text-calibra-blue-900 font-medium transition-colors">
                Support
              </a>
              <button className="bg-calibra-blue-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-calibra-blue-800 transition-colors w-full">
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;