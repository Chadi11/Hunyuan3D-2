import React, { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Layers, Loader2, AlertCircle } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ModelViewer from './components/ModelViewer';
import LoadingState from './components/LoadingState';
import { generateModel } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [singleImage, setSingleImage] = useState(null);
  const [multiviewImages, setMultiviewImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModel, setGeneratedModel] = useState(null);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');

  const handleSingleImageUpload = (file) => {
    setSingleImage(file);
    setError(null);
  };

  const handleMultiviewImageUpload = (view, file) => {
    setMultiviewImages(prev => ({
      ...prev,
      [view]: file
    }));
    setError(null);
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setGenerationProgress('Preparing images...');
    
    try {
      let imageData = null;
      
      if (activeTab === 'single') {
        if (!singleImage) {
          throw new Error('Please select an image first');
        }
        imageData = await fileToBase64(singleImage);
      } else {
        // For multiview, we need at least the front image
        if (!multiviewImages.front) {
          throw new Error('Please select at least a front view image');
        }
        
        // Convert multiview images to the format expected by the API
        const mvData = {};
        for (const [view, file] of Object.entries(multiviewImages)) {
          if (file) {
            mvData[view] = await fileToBase64(file);
          }
        }
        imageData = mvData;
      }

      setGenerationProgress('Generating 3D model...');
      
      const modelBlob = await generateModel({
        image: activeTab === 'single' ? imageData : undefined,
        multiview: activeTab === 'multiview' ? imageData : undefined,
        octree_resolution: 256,
        num_inference_steps: 20,
        guidance_scale: 5.0,
        texture: true
      });

      // Create a URL for the generated model
      const modelUrl = URL.createObjectURL(modelBlob);
      setGeneratedModel(modelUrl);
      setGenerationProgress('');
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate 3D model. Please try again.');
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/...;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDownload = () => {
    if (generatedModel) {
      const link = document.createElement('a');
      link.href = generatedModel;
      link.download = `generated-model-${Date.now()}.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canGenerate = () => {
    if (activeTab === 'single') {
      return singleImage !== null;
    } else {
      return multiviewImages.front !== null;
    }
  };

  return (
    <div className="min-h-screen bg-pampas">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-crail rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ImageTo3D</h1>
              <p className="text-sm text-gray-600">Convert images to 3D models</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Upload Mode Tabs */}
            <div className="card">
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`tab-button ${activeTab === 'single' ? 'active' : 'inactive'}`}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Single Image
                </button>
                <button
                  onClick={() => setActiveTab('multiview')}
                  className={`tab-button ${activeTab === 'multiview' ? 'active' : 'inactive'}`}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Multiview
                </button>
              </div>

              {/* Image Upload Section */}
              <ImageUpload
                activeTab={activeTab}
                singleImage={singleImage}
                multiviewImages={multiviewImages}
                onSingleImageUpload={handleSingleImageUpload}
                onMultiviewImageUpload={handleMultiviewImageUpload}
              />

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate() || isGenerating}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Generate 3D Model</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Generation Failed</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-crail/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-crail font-semibold text-xs">1</span>
                  </div>
                  <p>Upload a single image or multiple views (front, back, left, right)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-crail/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-crail font-semibold text-xs">2</span>
                  </div>
                  <p>Our AI processes the image(s) to generate a detailed 3D mesh</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-crail/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-crail font-semibold text-xs">3</span>
                  </div>
                  <p>Preview and download your 3D model in GLB format</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {/* 3D Model Preview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">3D Preview</h3>
                {generatedModel && (
                  <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download GLB</span>
                  </button>
                )}
              </div>

              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                {isGenerating ? (
                  <LoadingState progress={generationProgress} />
                ) : generatedModel ? (
                  <ModelViewer modelUrl={generatedModel} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No model generated yet</p>
                      <p className="text-gray-400 text-sm mt-1">Upload an image and click generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Model Info */}
            {generatedModel && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">GLB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generated:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium capitalize">{activeTab} Image</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;