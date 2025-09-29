const API_BASE_URL = '/api';

export const generateModel = async (params) => {
  try {
    const requestBody = {};
    
    if (params.image) {
      // Single image mode
      requestBody.image = params.image;
    } else if (params.multiview) {
      // Multiview mode - convert to the format expected by the API
      // For now, we'll use the front image as the main image
      // The API might need to be extended to handle multiview properly
      requestBody.image = params.multiview.front;
    }
    
    // Add other parameters
    requestBody.octree_resolution = params.octree_resolution || 256;
    requestBody.num_inference_steps = params.num_inference_steps || 20;
    requestBody.guidance_scale = params.guidance_scale || 5.0;
    requestBody.texture = params.texture || true;

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    // The API returns the GLB file directly
    const blob = await response.blob();
    return blob;
    
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to generate 3D model');
  }
};

export const checkGenerationStatus = async (uid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${uid}`);
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
};