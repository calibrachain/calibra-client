import { CheckCircle, Clock, Copy, Download, ExternalLink, RotateCcw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useDCCNFT } from '../hooks/useDCCNFT';
import { useDCCRegistry } from '../hooks/useDCCRegistry';
import { useTransactionManager } from '../hooks/useTransactionManager';
import { CertificateData, IPFSUploadResult, ProcessingStep } from '../types';
import { processAndGenerateMetadata } from '../utils/metadataGenerator';
import { parseXMLFile } from '../utils/xmlParser';
import ImageUpload from './ImageUpload';
import TransactionStatusDisplay from './TransactionStatusDisplay';

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
  const { chainId } = useAccount();
  const dccRegistry = useDCCRegistry();
  const dccNFT = useDCCNFT();
  const transactionManager = useTransactionManager();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { message: 'Reading XML file...', completed: false },
    { message: 'Extracting certificate data...', completed: false },
    { message: 'Creating NFT metadata...', completed: false },
    { message: 'Uploading files to IPFS...', completed: false },
    { message: 'Uploading metadata to IPFS...', completed: false },
    { message: 'Verifying laboratory credentials & Creating blockchain transaction...', completed: false },
    { message: 'Executing Chainlink Functions...', completed: false },
    { message: 'Searching for minted NFT...', completed: false },
    { message: 'Finalizing digital certificate...', completed: false }
  ]);
  
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [ipfsResult, setIPFSResult] = useState<IPFSUploadResult | null>(null);
  const [nftMetadataUrl, setNftMetadataUrl] = useState<string | null>(null);
  const [nftSnowtraceUrl, setNftSnowtraceUrl] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(true);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      // Don't auto-start processing, wait for user to choose image option
    }
  }, [isOpen, hasStarted]);

  const processWorkflow = async () => {
    try {
      // Step 1: Reading XML file
      await processStep(0, 1200);
      
      // Read the actual XML file content
      const xmlContent = await selectedFile.text();
      
      // Step 2: Extracting certificate data
      await processStep(1, 1500);
      const data = await parseXMLFile(xmlContent);
      setCertificateData(data);
      
      // Step 3: Creating NFT metadata
      await processStep(2, 1800);
      const metadataResult = await processAndGenerateMetadata(data);
      
      // Hide image upload after processing starts
      setShowImageUpload(false);
      
      // Step 4: Uploading files to IPFS
      await processStep(3, 2200);
      
      // Upload XML and optional image to IPFS
      const formData = new FormData();
      formData.append('xml', selectedFile);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const uploadResponse = await fetch('/api/upload-ipfs', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files to IPFS');
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('IPFS Upload Result:', uploadResult);
      
      // Step 5: Uploading metadata to IPFS
      await processStep(4, 1800);
      
      // Create updated metadata with real IPFS URLs
      const updatedMetadata = {
        ...metadataResult.metadata,
        image: uploadResult.image ? uploadResult.image.url : metadataResult.metadata.image,
        certificate_file: uploadResult.xml.url
      };
      
      // Upload metadata to IPFS
      const metadataResponse = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: updatedMetadata,
          folderName: uploadResult.folderName
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      
      const metadataUploadResult = await metadataResponse.json();
      console.log('Metadata Upload Result:', metadataUploadResult);
      
      // Update IPFS result with real data
      const ipfs: IPFSUploadResult = {
        fileHash: uploadResult.xml.cid,
        metadataHash: metadataUploadResult.metadata.cid,
        gatewayUrl: uploadResult.xml.url.replace(uploadResult.xml.cid, '')
      };
      setIPFSResult(ipfs);
      setNftMetadataUrl(metadataUploadResult.metadata.url);
      
      
      

      const chainlinkFunctionData = {
        accreditationNumber: data?.accreditationNumber,
        tokenURI: metadataUploadResult.metadata.url,
      };
      
      // Step 6: Verifying laboratory credentials & Creating blockchain transaction
      await processStep(5, 1500);
      
      // Start transaction monitoring
      transactionManager.startTransaction();
      
      // Call DCCRegistry contract
      console.log('🔗 Calling DCCRegistry contract...');
      const transactionHash = await dccRegistry.sendCertificateRequest(chainlinkFunctionData);
      
      if (transactionHash) {
        console.log('✅ Transaction sent successfully:', transactionHash);
        transactionManager.updateTransaction({ 
          hash: transactionHash,
          status: 'success'
        });

        // Step 7: Executing Chainlink Functions
      await processStep(6, 2500);
        
        // Step 8: Searching for minted NFT
        await processStep(7, 2000);
        
        // Wait a bit more for the NFT to be minted and indexed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const latestNFT = await dccNFT.getLatestNFT();
          if (latestNFT) {
            console.log('🎉 Found minted NFT:', latestNFT);
            setNftMetadataUrl(latestNFT.tokenURI);
            setNftSnowtraceUrl(latestNFT.snowtraceUrl);
          } else {
            console.log('⚠️ NFT not found yet, but transaction was successful');
          }
        } catch (nftError) {
          console.error('Error searching for NFT:', nftError);
          // Don't fail the whole process if NFT search fails
        }
        
        // Step 9: Finalizing digital certificate
        await processStep(8, 1200);
        
        setTransactionHash(transactionHash);
        setIsComplete(true);
        onComplete(true, transactionHash);
      } else {
        throw new Error('Failed to send certificate request to blockchain');
      }
      
    } catch (error) {
      console.error('Processing failed:', error);
      
      // Update transaction status with error
      transactionManager.failTransaction(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
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

          {/* Image Upload */}
          {showImageUpload && (
            <div className="mb-8">
              <ImageUpload
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowImageUpload(false);
                    processWorkflow();
                  }}
                  className="px-6 py-3 bg-calibra-blue-900 text-white rounded-lg hover:bg-calibra-blue-800 transition-colors font-medium"
                >
                  {selectedImage ? 'Process with Image' : 'Process without Image'}
                </button>
              </div>
            </div>
          )}

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

          {/* Transaction Status */}
          {transactionManager.currentTransaction.status !== 'idle' && (
            <TransactionStatusDisplay 
              transaction={transactionManager.currentTransaction}
              chainId={chainId}
              className="mb-6"
            />
          )}

          {/* Results Section */}
          {isComplete && transactionHash && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center mb-8">
                <CheckCircle className="h-16 w-16 text-calibra-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-semibold text-calibra-green-900 mb-2">Certificate Created Successfully!</h4>
                <p className="text-gray-600">Your digital calibration certificate has been created and stored on the blockchain</p>
              </div>

              {/* NFT Metadata URL */}
              {nftMetadataUrl && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ExternalLink className="h-6 w-6 text-purple-600" />
                    <h5 className="font-semibold text-purple-900">NFT Certificate URL</h5>
                  </div>
                  
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-purple-800 break-all font-mono">
                        {nftMetadataUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(nftMetadataUrl)}
                        className="ml-4 p-2 text-purple-600 hover:text-purple-800 transition-colors"
                        title="Copy URL"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-4">
                    <a
                      href={nftMetadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View NFT Metadata</span>
                    </a>
                    
                    <a
                      href={nftMetadataUrl}
                      download={`nft-metadata-${certificateData?.certificateNumber || 'download'}.json`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                  
                  <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>This is your NFT metadata URL</strong> - it contains all the certificate information that was stored on the blockchain.
                    </p>
                  </div>
                </div>
              )}

              {/* NFT Snowtrace URL */}
              {nftSnowtraceUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ExternalLink className="h-6 w-6 text-green-600" />
                    <h5 className="font-semibold text-green-900">🎉 Your NFT on Snowtrace</h5>
                  </div>
                  
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-green-800 break-all font-mono">
                        {nftSnowtraceUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(nftSnowtraceUrl)}
                        className="ml-4 p-2 text-green-600 hover:text-green-800 transition-colors"
                        title="Copy URL"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <a
                      href={nftSnowtraceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>View Your NFT on Snowtrace</span>
                    </a>
                  </div>
                  
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>🎯 This is your minted NFT!</strong> Click the link above to see your digital certificate NFT on the Avalanche blockchain explorer.
                    </p>
                  </div>
                </div>
              )}

              {/* Certificate URL */}
              {ipfsResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ExternalLink className="h-6 w-6 text-blue-600" />
                    <h5 className="font-semibold text-blue-900">Original Certificate File URL</h5>
                  </div>
                  
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-blue-800 break-all font-mono">
                        {`${ipfsResult.gatewayUrl}${ipfsResult.fileHash}`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${ipfsResult.gatewayUrl}${ipfsResult.fileHash}`)}
                        className="ml-4 p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copy URL"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-4">
                    <a
                      href={`${ipfsResult.gatewayUrl}${ipfsResult.fileHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Original File</span>
                    </a>
                    
                    <a
                      href={`${ipfsResult.gatewayUrl}${ipfsResult.fileHash}`}
                      download={`certificate-${certificateData?.certificateNumber || 'download'}.xml`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Certificate Details */}
              {certificateData && (
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
                    <div>
                      <span className="font-medium text-calibra-blue-700">Accreditation:</span>
                      <span className="ml-2 text-calibra-blue-800">{certificateData.accreditationNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-medium text-yellow-800 mb-2">What&apos;s Next?</h6>
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