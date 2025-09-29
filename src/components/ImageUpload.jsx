import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({
  activeTab,
  singleImage,
  multiviewImages,
  onSingleImageUpload,
  onMultiviewImageUpload
}) => {
  const handleFileSelect = (event, view = null) => {
    const file = event.target.files[0];
    if (file) {
      if (view) {
        onMultiviewImageUpload(view, file);
      } else {
        onSingleImageUpload(file);
      }
    }
  };

  const removeImage = (view = null) => {
    if (view) {
      onMultiviewImageUpload(view, null);
    } else {
      onSingleImageUpload(null);
    }
  };

  const ImagePreview = ({ file, onRemove, label }) => (
    <div className="relative group">
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={URL.createObjectURL(file)}
          alt={label}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {label && (
        <p className="text-xs text-gray-600 mt-2 text-center font-medium">{label}</p>
      )}
    </div>
  );

  const UploadArea = ({ onFileSelect, label, hasFile }) => (
    <div
      className={`upload-area ${hasFile ? 'active' : ''}`}
      onClick={() => document.getElementById(`file-input-${label?.toLowerCase() || 'single'}`).click()}
    >
      <input
        id={`file-input-${label?.toLowerCase() || 'single'}`}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center space-y-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasFile ? 'bg-crail text-white' : 'bg-gray-100 text-gray-400'}`}>
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-700">
            {hasFile ? 'Image selected' : `Upload ${label || 'image'}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG up to 10MB
          </p>
        </div>
      </div>
    </div>
  );

  if (activeTab === 'single') {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-crail" />
          Single Image Upload
        </h3>
        
        {singleImage ? (
          <ImagePreview
            file={singleImage}
            onRemove={() => removeImage()}
          />
        ) : (
          <UploadArea
            onFileSelect={(e) => handleFileSelect(e)}
            hasFile={!!singleImage}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Layers className="w-5 h-5 mr-2 text-crail" />
        Multiview Images Upload
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(multiviewImages).map(([view, file]) => (
          <div key={view}>
            {file ? (
              <ImagePreview
                file={file}
                onRemove={() => removeImage(view)}
                label={view.charAt(0).toUpperCase() + view.slice(1)}
              />
            ) : (
              <UploadArea
                onFileSelect={(e) => handleFileSelect(e, view)}
                label={view.charAt(0).toUpperCase() + view.slice(1)}
                hasFile={!!file}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> At minimum, upload a front view image. Additional views (back, left, right) will improve the 3D model quality.
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;