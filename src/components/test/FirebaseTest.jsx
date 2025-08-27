import { useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestore = async () => {
    setLoading(true);
    setTestResult('Testing Firestore connection...');
    
    try {
      // Test writing to Firestore
      const testCollection = collection(db, 'test');
      const docRef = await addDoc(testCollection, {
        message: 'Test message',
        timestamp: new Date(),
        test: true
      });
      
      setTestResult(prev => prev + '\n✅ Write test successful. Doc ID: ' + docRef.id);
      
      // Test reading from Firestore
      const querySnapshot = await getDocs(testCollection);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      setTestResult(prev => prev + '\n✅ Read test successful. Found ' + docs.length + ' documents');
      setTestResult(prev => prev + '\n🎉 Firebase Firestore is working correctly!');
      
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult(prev => prev + '\n❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4">Firebase Connection Test</h3>
      <button
        onClick={testFirestore}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
