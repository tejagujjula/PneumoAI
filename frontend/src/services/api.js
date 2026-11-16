import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
});

/**
 * Checks backend health and model loading status.
 */
export const checkBackendHealth = async () => {
  try {
    const response = await client.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Backend is currently unreachable.',
    };
  }
};

/**
 * Sends a chest X-ray image for pneumonia inference and Grad-CAM generation.
 * @param {File} imageFile - The chest X-ray file to upload.
 */
export const analyzeChestXRay = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await client.post('/api/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    let errorMsg = 'Failed to analyze the image. Please try again.';

    if (error.response) {
      // Backend returned HTTP 4xx or 5xx
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d) => d.msg).join(', ');
      } else {
        errorMsg = `Server error (${error.response.status}). Please check image requirements.`;
      }
    } else if (error.request) {
      // Request made but no response (server offline or CORS blocked)
      errorMsg = 'Cannot connect to the PneumoAI backend server. Please verify the FastAPI server is running on http://127.0.0.1:8000.';
    } else {
      errorMsg = error.message;
    }

    return { success: false, error: errorMsg };
  }
};

export default client;
