import { useState } from 'react';
import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../config/cloudinary';
import { FaUpload, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const CloudinaryTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const checkConfiguration = () => {
    setTestResult('Checking Cloudinary configuration...\n');
    
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'demo') {
      setTestResult(prev => prev + '❌ Cloud Name not configured\n');
      return false;
    } else {
      setTestResult(prev => prev + `✅ Cloud Name: ${CLOUDINARY_CLOUD_NAME}\n`);
    }
    
    if (!CLOUDINARY_UPLOAD_PRESET) {
      setTestResult(prev => prev + '❌ Upload Preset not configured\n');
      return false;
    } else {
      setTestResult(prev => prev + `✅ Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}\n`);
    }
    
    setTestResult(prev => prev + '✅ Configuration looks good!\n');
    return true;
  };

  const testUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    
    if (!checkConfiguration()) {
      setLoading(false);
      return;
    }

    try {
      setTestResult(prev => prev + '\n📤 Starting upload...\n');
      
      const result = await uploadToCloudinary(file);
      
      setTestResult(prev => prev + '✅ Upload successful!\n');
      setTestResult(prev => prev + `📁 File URL: ${result.url}\n`);
      setTestResult(prev => prev + `🆔 Public ID: ${result.public_id}\n`);
      setTestResult(prev => prev + `📊 Size: ${(result.bytes / 1024).toFixed(2)} KB\n`);
      setTestResult(prev => prev + `🎯 Format: ${result.format}\n`);
      setTestResult(prev => prev + '\n🎉 Cloudinary is working perfectly!\n');
      
    } catch (error) {
      console.error('Cloudinary test error:', error);
      setTestResult(prev => prev + `\n❌ Upload failed: ${error.message}\n`);
      
      if (error.message.includes('cloud name not configured')) {
        setTestResult(prev => prev + '\n💡 Fix: Update VITE_CLOUDINARY_CLOUD_NAME in your .env file\n');
      } else if (error.message.includes('upload preset not configured')) {
        setTestResult(prev => prev + '\n💡 Fix: Update VITE_CLOUDINARY_UPLOAD_PRESET in your .env file\n');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaUpload className="text-blue-600" />
        Cloudinary Test
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a test file:
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>
        
        <button
          onClick={checkConfiguration}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Check Configuration
        </button>
        
        <button
          onClick={testUpload}
          disabled={loading || !file}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Testing Upload...
            </>
          ) : (
            <>
              <FaUpload />
              Test Upload
            </>
          )}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line font-mono">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default CloudinaryTest;
