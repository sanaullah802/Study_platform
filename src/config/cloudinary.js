// Cloudinary configuration for client-side uploads
// These values come from environment variables
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
export const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'studypoint_uploads';

// Upload function for client-side
export const uploadToCloudinary = async (file, onProgress = null) => {
  // Validate configuration
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'demo') {
    throw new Error('Cloudinary cloud name not configured. Please check your .env file.');
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset not configured. Please check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'studypoint/materials'); // Organize files in folders

  try {
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary API error:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data);

    return {
      url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      original_filename: data.original_filename,
      width: data.width,
      height: data.height,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Instructions for setting up Cloudinary:
// 1. Go to https://cloudinary.com and create a free account
// 2. Get your Cloud Name from the dashboard
// 3. Go to Settings > Upload > Add upload preset
// 4. Create an unsigned upload preset named 'studypoint_uploads'
// 5. Replace CLOUDINARY_CLOUD_NAME above with your actual cloud name
