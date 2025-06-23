import clsx from 'clsx';
import { AlertCircle, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  disabled?: boolean;
}

const validateImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      if (validateImageFile(file)) {
        onImageSelect(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setError('Please select a valid image file.');
      }
    }
  }, [onImageSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateImageFile(file)) {
        onImageSelect(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setError('Please select a valid image file.');
      }
    }
  }, [onImageSelect]);

  const handleRemoveImage = () => {
    onImageSelect(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate Image (Optional)
        </label>
        <p className="text-xs text-gray-500">
          Add an image to represent your certificate (PNG, JPG, JPEG, GIF, WebP)
        </p>
      </div>

      {selectedImage && previewUrl ? (
        <div className="relative">
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Certificate preview" 
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {selectedImage.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-gray-500">
                  {selectedImage.type}
                </p>
              </div>
              <button
                onClick={handleRemoveImage}
                disabled={disabled}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300',
            {
              'border-calibra-blue-500 bg-calibra-blue-50': dragActive,
              'border-calibra-green-500 bg-calibra-green-50': selectedImage && !error,
              'border-red-500 bg-red-50': error,
              'border-gray-300 bg-gray-50 hover:border-calibra-blue-400 hover:bg-calibra-blue-50': !dragActive && !selectedImage && !error,
            }
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
          />

          <div className="space-y-6">
            <div className="flex justify-center">
              {error ? (
                <AlertCircle className="h-16 w-16 text-red-500" />
              ) : (
                <ImageIcon className={clsx(
                  'h-16 w-16 transition-colors',
                  dragActive ? 'text-calibra-blue-500' : 'text-gray-400'
                )} />
              )}
            </div>
            
            <div>
              <p className="text-2xl font-semibold text-gray-700 mb-3">
                {error ? 'File Error' : 'Drop your certificate image here'}
              </p>
              <p className="text-lg text-gray-500 mb-6">
                {error ? error : 'or click to browse and select your certificate image'}
              </p>
              
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
                <ImageIcon className="h-5 w-5" />
                <span>Supports image files up to 10MB</span>
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
                <span>IPFS Storage</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-calibra-green-500" />
                <span>Optional Upload</span>
              </div>
            </div>
          </div>

          {disabled && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calibra-blue-900"></div>
                <span className="text-calibra-blue-900 font-medium">Processing...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
