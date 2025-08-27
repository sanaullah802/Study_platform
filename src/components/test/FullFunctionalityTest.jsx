import { useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../config/cloudinary';
import { FaUpload, FaCheck, FaTimes, FaSpinner, FaComments, FaFileAlt, FaCloudUploadAlt } from 'react-icons/fa';

const FullFunctionalityTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const { currentUser } = useContext(AuthContext);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Check Authentication
  const testAuthentication = () => {
    addResult('🔐 Testing Authentication...', true);
    
    if (!currentUser) {
      addResult('❌ User not authenticated. Please login first.', false);
      return false;
    }
    
    addResult(`✅ User authenticated: ${currentUser.email || currentUser.displayName || currentUser.uid}`, true);
    return true;
  };

  // Test 2: Check Cloudinary Configuration
  const testCloudinaryConfig = () => {
    addResult('☁️ Testing Cloudinary Configuration...', true);
    
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'demo') {
      addResult('❌ Cloudinary Cloud Name not configured', false);
      return false;
    }
    
    if (!CLOUDINARY_UPLOAD_PRESET) {
      addResult('❌ Cloudinary Upload Preset not configured', false);
      return false;
    }
    
    addResult(`✅ Cloud Name: ${CLOUDINARY_CLOUD_NAME}`, true);
    addResult(`✅ Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}`, true);
    return true;
  };

  // Test 3: Test Message Sending
  const testMessageSending = async () => {
    if (!testAuthentication()) return;
    
    addResult('💬 Testing Message Sending...', true);
    
    if (!testMessage.trim()) {
      addResult('❌ Please enter a test message first', false);
      return;
    }

    try {
      const messageRef = collection(db, 'messages');
      const docRef = await addDoc(messageRef, {
        text: testMessage,
        createdAt: serverTimestamp(),
        user: currentUser?.displayName || currentUser?.email || currentUser?.uid,
        room: "programming",
        isTest: true
      });
      
      addResult(`✅ Message sent successfully! Doc ID: ${docRef.id}`, true);
      setTestMessage('');
    } catch (error) {
      addResult(`❌ Message sending failed: ${error.message}`, false);
    }
  };

  // Test 4: Test File Upload
  const testFileUpload = async () => {
    if (!testAuthentication()) return;
    if (!testCloudinaryConfig()) return;
    
    addResult('📤 Testing File Upload...', true);
    
    if (!file) {
      addResult('❌ Please select a file first', false);
      return;
    }

    try {
      addResult(`📁 Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, true);
      
      const result = await uploadToCloudinary(file);
      
      addResult('✅ File uploaded to Cloudinary successfully!', true);
      addResult(`🔗 File URL: ${result.url}`, true);
      addResult(`🆔 Public ID: ${result.public_id}`, true);
      addResult(`📊 Size: ${(result.bytes / 1024).toFixed(2)} KB`, true);
      
    } catch (error) {
      addResult(`❌ File upload failed: ${error.message}`, false);
    }
  };

  // Test 5: Run All Tests
  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Starting Full Functionality Test...', true);
    
    // Test 1: Authentication
    const authOk = testAuthentication();
    
    // Test 2: Cloudinary Config
    const cloudinaryOk = testCloudinaryConfig();
    
    // Test 3: Message (if we have a test message)
    if (testMessage.trim()) {
      await testMessageSending();
    } else {
      addResult('⚠️ Skipping message test - no test message provided', true);
    }
    
    // Test 4: File Upload (if we have a file)
    if (file) {
      await testFileUpload();
    } else {
      addResult('⚠️ Skipping file upload test - no file selected', true);
    }
    
    // Summary
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    if (authOk && cloudinaryOk) {
      addResult('🎉 All core systems are working correctly!', true);
    } else {
      addResult('⚠️ Some issues found. Please check the results above.', false);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
        <FaCloudUploadAlt className="text-blue-600" />
        StudyPoint Functionality Test
      </h3>
      
      <div className="space-y-6">
        {/* Test Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaComments className="inline mr-2" />
            Test Message:
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter a test message to send..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* File Upload Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaFileAlt className="inline mr-2" />
            Test File:
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        
        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={testAuthentication}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCheck />
            Test Auth
          </button>
          
          <button
            onClick={testCloudinaryConfig}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCloudUploadAlt />
            Test Config
          </button>
          
          <button
            onClick={testMessageSending}
            disabled={!testMessage.trim()}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaComments />
            Test Message
          </button>
          
          <button
            onClick={testFileUpload}
            disabled={!file}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaUpload />
            Test Upload
          </button>
        </div>
        
        {/* Run All Tests Button */}
        <button
          onClick={runAllTests}
          disabled={loading}
          className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 font-medium text-lg"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <FaCheck />
              Run All Tests
            </>
          )}
        </button>
        
        {/* Clear Results */}
        {testResults.length > 0 && (
          <button
            onClick={clearResults}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Results
          </button>
        )}
      </div>
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
          <h4 className="font-semibold text-gray-800 mb-3">Test Results:</h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  result.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {result.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullFunctionalityTest;
