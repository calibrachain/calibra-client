import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { validateXMLFile } from '../utils/xmlParser';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateXMLFile(file)) {
        onFileSelect(file);
      } else {
        setError('Please select a valid XML file.');
      }
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateXMLFile(file)) {
        onFileSelect(file);
      } else {
        setError('Please select a valid XML file.');
      }
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300',
          {
            'border-calibra-blue-500 bg-calibra-blue-50': dragActive,
            'border-calibra-green-500 bg-calibra-green-50': selectedFile && !error,
            'border-red-500 bg-red-50': error,
            'border-gray-300 bg-gray-50 hover:border-calibra-blue-400 hover:bg-calibra-blue-50': !dragActive && !selectedFile && !error,
          }
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xml,text/xml,application/xml"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="space-y-6">
          <div className="flex justify-center">
            {error ? (
              <AlertCircle className="h-16 w-16 text-red-500" />
            ) : (
              <Upload className={clsx(
                'h-16 w-16 transition-colors',
                dragActive ? 'text-calibra-blue-500' : 'text-gray-400'
              )} />
            )}
          </div>
          
          <div>
            <p className="text-2xl font-semibold text-gray-700 mb-3">
              {error ? 'File Error' : 'Drop your XML certificate here'}
            </p>
            <p className="text-lg text-gray-500 mb-6">
              {error ? error : 'or click to browse and select your calibration certificate'}
            </p>
            
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
              <FileText className="h-5 w-5" />
              <span>Supports .xml files up to 10MB</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-calibra-green-500" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-calibra-green-500" />
              <span>Blockchain Storage</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-calibra-green-500" />
              <span>Instant Verification</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calibra-blue-900"></div>
              <span className="text-calibra-blue-900 font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;