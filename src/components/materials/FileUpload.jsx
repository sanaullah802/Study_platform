import React, { useState, useContext } from 'react';
import { ref as dbRef, push, set } from 'firebase/database';
import { realtimeDb } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { FaUpload, FaFile, FaLink, FaTimes, FaSpinner } from 'react-icons/fa';
import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME } from '../../config/cloudinary';

const FileUpload = ({ groupId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('File type not supported. Please upload PDF, DOC, DOCX, TXT, JPG, PNG, GIF, PPT, or PPTX files.');
        return;
      }
      
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    try {
      setUploadProgress(10);

      // Check if Cloudinary is configured
      if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'demo') {
        console.warn('Cloudinary not configured, using data URL fallback');

        // Fallback to data URL for development
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            setUploadProgress(100);
            resolve({
              url: reader.result,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              isDataUrl: true
            });
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          setUploadProgress(50);
          reader.readAsDataURL(file);
        });
      }

      // Upload to Cloudinary
      setUploadProgress(25);
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(25 + (progress * 0.75)); // Scale progress from 25% to 100%
      });

      setUploadProgress(100);

      return {
        url: result.url,
        fileName: result.original_filename || file.name,
        fileSize: result.bytes || file.size,
        fileType: file.type,
        cloudinaryId: result.public_id,
        resourceType: result.resource_type,
        format: result.format
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const saveMaterialMetadata = async (materialData) => {
    const materialsRef = dbRef(realtimeDb, `materials/${groupId}`);
    const newMaterialRef = push(materialsRef);
    
    const metadata = {
      id: newMaterialRef.key,
      title: title.trim(),
      description: description.trim(),
      type: uploadType,
      uploadedBy: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0]
      },
      uploadedAt: Date.now(),
      groupId,
      reuseCount: 0,
      comments: {},
      ...materialData
    };

    await set(newMaterialRef, metadata);
    return metadata;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (uploadType === 'file' && !file) {
      alert('Please select a file');
      return;
    }

    if (uploadType === 'link' && !linkUrl.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let materialData = {};

      if (uploadType === 'file') {
        const fileData = await uploadFile();
        materialData = {
          ...fileData,
          url: fileData.url
        };
      } else {
        // Validate URL
        try {
          new URL(linkUrl);
          materialData = {
            url: linkUrl,
            fileName: title,
            fileType: 'link'
          };
        } catch {
          alert('Please enter a valid URL');
          setUploading(false);
          return;
        }
      }

      const savedMaterial = await saveMaterialMetadata(materialData);
      
      // Reset form
      setFile(null);
      setLinkUrl('');
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      setShowModal(false);
      
      if (onUploadComplete) {
        onUploadComplete(savedMaterial);
      }
      
      alert('Material uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);

      // Provide specific error messages
      let errorMessage = 'Failed to upload material. Please try again.';
      if (error.message.includes('cloud name not configured')) {
        errorMessage = 'File upload service not configured. Please contact administrator.';
      } else if (error.message.includes('upload preset not configured')) {
        errorMessage = 'Upload configuration missing. Please contact administrator.';
      } else if (error.message.includes('Upload failed')) {
        errorMessage = 'Upload failed. Please check your internet connection and try again.';
      }

      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setLinkUrl('');
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setUploadType('file');
  };

  const closeModal = () => {
    if (!uploading) {
      setShowModal(false);
      resetForm();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
      >
        <FaUpload className="text-lg" />
        <span>📤 Add Files & Links</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 font-poppins">Share Study Material</h2>
              <button
                onClick={closeModal}
                disabled={uploading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Upload Type Selection */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadType === 'file'}
                    onChange={(e) => setUploadType(e.target.value)}
                    disabled={uploading}
                    className="mr-2"
                  />
                  <FaFile className="mr-1" /> Upload File
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="link"
                    checked={uploadType === 'link'}
                    onChange={(e) => setUploadType(e.target.value)}
                    disabled={uploading}
                    className="mr-2"
                  />
                  <FaLink className="mr-1" /> Share Link
                </label>
              </div>

              {/* File Upload */}
              {uploadType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File (PDF, DOC, DOCX, TXT, Images, PPT - Max 10MB)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.ppt,.pptx"
                  />
                  {file && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {/* Link Input */}
              {uploadType === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    disabled={uploading}
                    placeholder="https://example.com/resource"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  placeholder="Enter material title"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  placeholder="Describe the material (optional)"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span>Uploading... {Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !title.trim() || (uploadType === 'file' && !file) || (uploadType === 'link' && !linkUrl.trim())}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Share Material
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;
