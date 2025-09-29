import React, { useEffect, useRef } from 'react';

const ModelViewer = ({ modelUrl }) => {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    if (modelViewerRef.current && modelUrl) {
      modelViewerRef.current.src = modelUrl;
    }
  }, [modelUrl]);

  return (
    <div className="w-full h-full">
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt="Generated 3D Model"
        auto-rotate
        camera-controls
        environment-image="neutral"
        shadow-intensity="1"
        camera-orbit="0deg 75deg 105%"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
};

export default ModelViewer;