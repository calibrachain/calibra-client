import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import FileUpload from './FileUpload';
import ProcessingModal from './ProcessingModal';

const CertificateWorkflow: React.FC = () => {
  const { isConnected } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!isConnected) {
      alert('Please connect your wallet first to proceed with certificate processing.');
      return;
    }
    
    setSelectedFile(file);
    setShowProcessingModal(true);
  };

  const handleProcessingComplete = (success: boolean, hash?: string) => {
    console.log('✅ Certificate processing completed:', { 
      success, 
      transactionHash: hash,
      note: 'This hash is the blockchain transaction hash, NOT the Chainlink request ID',
      message: success ? 'Certificate successfully created on blockchain!' : 'Certificate processing failed'
    });
  };

  const handleCloseModal = () => {
    setShowProcessingModal(false);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-calibra-blue-900 via-calibra-blue-800 to-calibra-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transform Your Calibration Certificates
            </h1>
            <p className="text-xl text-calibra-blue-100 mb-8 max-w-3xl mx-auto">
              Convert traditional XML calibration certificates into secure, immutable digital certificates stored on blockchain. 
              Ensure authenticity, traceability, and permanent verification for your calibration records.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure & Immutable</h3>
                <p className="text-calibra-blue-100 text-sm">
                  Blockchain technology ensures your certificates cannot be altered or falsified
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-3">🌐</div>
                <h3 className="text-lg font-semibold text-white mb-2">Globally Accessible</h3>
                <p className="text-calibra-blue-100 text-sm">
                  Access and verify certificates from anywhere in the world, anytime
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-white mb-2">Instant Verification</h3>
                <p className="text-calibra-blue-100 text-sm">
                  Chainlink Functions automatically verify laboratory credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Wallet Connection Status */}
        <div className="mb-8">
          <div className={`rounded-lg p-4 border ${
            isConnected 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium">
                {isConnected 
                  ? '✅ Wallet Connected - Ready to process certificates'
                  : '⚠️ Please connect your wallet to continue'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get Started
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simply drag and drop your XML calibration certificate below. Our system will automatically process it, 
            verify the laboratory credentials, and create your secure digital certificate.
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={null}
          isLoading={false}
        />

        {/* How it Works */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Our automated process transforms your certificate in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-calibra-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload XML</h3>
              <p className="text-gray-600 text-sm">
                Drag your calibration certificate XML file
              </p>
            </div>

            <div className="text-center">
              <div className="bg-calibra-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Data</h3>
              <p className="text-gray-600 text-sm">
                Extract and validate certificate information
              </p>
            </div>

            <div className="text-center">
              <div className="bg-calibra-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Lab</h3>
              <p className="text-gray-600 text-sm">
                Chainlink Functions verify laboratory credentials
              </p>
            </div>

            <div className="text-center">
              <div className="bg-calibra-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Certificate</h3>
              <p className="text-gray-600 text-sm">
                Receive your blockchain-secured digital certificate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {showProcessingModal && selectedFile && (
        <ProcessingModal
          selectedFile={selectedFile}
          onComplete={handleProcessingComplete}
          onClose={handleCloseModal}
          isOpen={showProcessingModal}
        />
      )}
    </div>
  );
};

export default CertificateWorkflow;