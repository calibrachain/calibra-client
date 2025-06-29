import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { NetworkIndicator } from './NetworkIndicator';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src="favicon.ico" className='w-10 h-10'/>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-calibra-blue-900">CALIBRA</span>
              <span className="text-xs text-gray-500 -mt-1">Digital Certification</span>
            </div>
          </div>


          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <NetworkIndicator />
            <ConnectButton />
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
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;