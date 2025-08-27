import React, { useState, useRef } from 'react'
import Messages from './Messages';

function Chat() {
    const [room, setRoom] = useState(null);
    const roomInputRef = useRef(null); // this helps to get the input value when joining a room
 
    return (
    <div className="w-full h-full">
      {room ? (
        // Chat interface when user has joined a room
        <Messages room={room} />
      ) : (
        // Room selection interface
        <div className='flex flex-col items-center  h-[22vw] bg-gray-50'>
            <div className="bg-white p-8 rounded-lg mt-5 shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Create a Study Group</h2>
                <label className='block text-gray-700 font-medium mb-2'>Enter Room Name:</label>
                <input 
                    type="text" 
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4' 
                    ref={roomInputRef}
                    placeholder="e.g., math-study-group" 
                />
                <button 
                    onClick={() => setRoom(roomInputRef.current.value)}  
                    className='w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200'
                >
                    Join Room
                </button>
            </div>
        </div>
      )}
    </div>
  )
}

export default Chat
