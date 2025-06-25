import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  disabled = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert('Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
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
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-calibra-blue-500 bg-calibra-blue-50'
              : 'border-gray-300 hover:border-calibra-blue-400 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <div className={`p-3 rounded-full ${
              dragActive ? 'bg-calibra-blue-100' : 'bg-gray-100'
            }`}>
              <ImageIcon className={`h-6 w-6 ${
                dragActive ? 'text-calibra-blue-600' : 'text-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                {dragActive ? 'Drop your image here' : 'Upload certificate image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag & drop or click to select • PNG, JPG, JPEG, GIF, WebP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
