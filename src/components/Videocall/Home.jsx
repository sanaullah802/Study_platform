import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(() => {
    if (value.trim()) {
      navigate(`/room/${value}`);
    }
  }, [value, navigate]);

  return (
    <div className="flex flex-col items-center h-[22vw] bg-gray-50">
      <div className="bg-white p-8 rounded-lg mt-5 shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Join a Study Group</h2>
        <label className="block text-gray-700 font-medium mb-2">Enter Room Code:</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., physics-group"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />
        <button
          onClick={handleJoinRoom}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;

