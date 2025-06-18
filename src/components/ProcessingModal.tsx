import { CheckCircle, Clock, Copy, ExternalLink, Hash, RotateCcw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CertificateData, IPFSUploadResult, ProcessingStep } from '../types';
import { generateIPFSHash, generateTransactionHash } from '../utils/mockData';
import { parseXMLFile } from '../utils/xmlParser';

interface ProcessingModalProps {
  selectedFile: File;
  onComplete: (success: boolean, hash?: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  selectedFile, 
  onComplete, 
  onClose, 
  isOpen 
}) => {
  const { address, isConnected } = useAccount();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { message: 'Reading XML file...', completed: false },
    { message: 'Extracting certificate data...', completed: false },
    { message: 'Creating NFT metadata...', completed: false },
    { message: 'Uploading to IPFS...', completed: false },
    { message: 'Executing Chainlink Functions...', completed: false },
    { message: 'Verifying laboratory credentials...', completed: false },
    { message: 'Creating blockchain transaction...', completed: false },
    { message: 'Finalizing digital certificate...', completed: false }
  ]);
  
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [ipfsResult, setIPFSResult] = useState<IPFSUploadResult | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      processWorkflow();
    }
  }, [isOpen, hasStarted]);

  const processWorkflow = async () => {
    try {
      // Step 1: Reading XML file
      await processStep(0, 1200);
      
      // Step 2: Extracting certificate data
      await processStep(1, 1500);
      const data = await parseXMLFile('mock-xml-content');
      setCertificateData(data);
      
      // Step 3: Creating NFT metadata
      await processStep(2, 1800);
      
      // Step 4: Uploading to IPFS
      await processStep(3, 2200);
      const ipfs: IPFSUploadResult = {
        fileHash: generateIPFSHash(),
        metadataHash: generateIPFSHash(),
        gatewayUrl: 'https://ipfs.io/ipfs/'
      };
      setIPFSResult(ipfs);
      
      // Step 5: Executing Chainlink Functions
      await processStep(4, 2500);
      
      // Step 6: Verifying laboratory credentials
      await processStep(5, 2000);
      
      // Step 7: Creating blockchain transaction
      await processStep(6, 1800);
      
      // Step 8: Finalizing digital certificate
      await processStep(7, 1200);
      
      // Generate final transaction hash
      const txHash = generateTransactionHash();
      setTransactionHash(txHash);
      setIsComplete(true);
      onComplete(true, txHash);
      
    } catch (error) {
      console.error('Processing failed:', error);
      onComplete(false);
    }
  };

  const processStep = async (stepIndex: number, duration: number) => {
    setCurrentStepIndex(stepIndex);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      completed: index <= stepIndex
    })));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleProcessAnother = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-calibra-blue-900 to-calibra-blue-800 px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Processing Certificate</h3>
            <p className="text-calibra-blue-100 mt-1">Creating your digital calibration certificate</p>
          </div>
          {isComplete && (
            <button
              onClick={handleClose}
              className="text-calibra-blue-200 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="p-8">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-calibra-blue-100 rounded-lg p-2">
                <span className="text-calibra-blue-600 text-sm font-medium">XML</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
                  step.completed
                    ? 'bg-calibra-green-50 border border-calibra-green-200'
                    : index === currentStepIndex
                    ? 'bg-calibra-blue-50 border border-calibra-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-calibra-green-600 flex-shrink-0" />
                ) : index === currentStepIndex ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-calibra-blue-600 flex-shrink-0"></div>
                ) : (
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                
                <span className={`font-medium ${
                  step.completed
                    ? 'text-calibra-green-800'
                    : index === currentStepIndex
                    ? 'text-calibra-blue-800'
                    : 'text-gray-500'
                }`}>
                  {step.message}
                </span>
              </div>
            ))}
          </div>

          {/* Results Section */}
          {isComplete && transactionHash && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center mb-8">
                <CheckCircle className="h-16 w-16 text-calibra-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-semibold text-calibra-green-900 mb-2">Certificate Created Successfully!</h4>
                <p className="text-gray-600">Your digital calibration certificate has been created and stored on the blockchain</p>
              </div>

              {/* Transaction Hash */}
              <div className="bg-calibra-green-50 border border-calibra-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Hash className="h-6 w-6 text-calibra-green-600" />
                  <h5 className="font-semibold text-calibra-green-900">Transaction Hash</h5>
                </div>
                
                <div className="bg-white border border-calibra-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-calibra-green-800 break-all font-mono">
                      {transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transactionHash)}
                      className="ml-4 p-2 text-calibra-green-600 hover:text-calibra-green-800 transition-colors"
                      title="Copy hash"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              {certificateData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-calibra-blue-50 border border-calibra-blue-200 rounded-lg p-6">
                    <h5 className="font-semibold text-calibra-blue-900 mb-4">Certificate Details</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-calibra-blue-700">Number:</span>
                        <span className="ml-2 text-calibra-blue-800">{certificateData.certificateNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-calibra-blue-700">Laboratory:</span>
                        <span className="ml-2 text-calibra-blue-800">{certificateData.laboratory}</span>
                      </div>
                      <div>
                        <span className="font-medium text-calibra-blue-700">Instrument:</span>
                        <span className="ml-2 text-calibra-blue-800">{certificateData.instrument}</span>
                      </div>
                    </div>
                  </div>

                  {ipfsResult && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h5 className="font-semibold text-purple-900 mb-4">IPFS Storage</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-700 mb-1">
                            Certificate File
                          </label>
                          <div className="bg-white border border-purple-200 rounded px-2 py-1">
                            <code className="text-xs text-purple-800 break-all">
                              {ipfsResult.fileHash}
                            </code>
                          </div>
                        </div>
                        
                        <a
                          href={`${ipfsResult.gatewayUrl}${ipfsResult.fileHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View on IPFS</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-medium text-yellow-800 mb-2">What's Next?</h6>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your certificate is now permanently stored on the blockchain</li>
                  <li>• Use the transaction hash to verify authenticity</li>
                  <li>• Access your certificate anytime through the IPFS links</li>
                  <li>• Share the hash with stakeholders for verification</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={handleProcessAnother}
                  className="flex items-center space-x-2 px-6 py-3 bg-calibra-blue-900 text-white rounded-lg hover:bg-calibra-blue-800 transition-colors font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Process Another Certificate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;