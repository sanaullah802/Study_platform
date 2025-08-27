import React, { useState, useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';

function Messages(props) {
    const { room } = props;
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const messageRef = collection(db, 'messages');

    const { currentUser } = useContext(AuthContext);

    const scrollToBottom = () => {
        // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Query all messages from Firebase without room filter
        const queryMessages = query(
            messageRef, 
            orderBy("createdAt", "asc")
        );
        
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let msg = [];
            snapshot.forEach((doc) => {
                msg.push({ ...doc.data(), id: doc.id });
            });
            setAllMessages(msg);
            // console.log("All messages loaded:", msg); // Debug log
            scrollToBottom();
        }, (error) => {
            console.error("Error fetching messages:", error);
        });

        return () => unsubscribe();
    }, [messageRef]); // Removed room dependency to show all messages

    useEffect(() => {
        scrollToBottom();
    }, [allMessages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim() === '') {
            return;
        }

        try {
            await addDoc(messageRef, {
                text: message,
                createdAt: serverTimestamp(),
                user: currentUser?.displayName || currentUser?.email || currentUser?.uid,
                room: room,
            });
            setMessage('');
            console.log("Message sent successfully"); // Debug log
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <div className='flex flex-col h-screen bg-gray-100'>
            <h1 className='text-2xl font-bold p-4 text-center bg-white shadow-sm'>Welcome to {room} room</h1>
            
            <div className="flex-1 overflow-hidden p-4">
                <div className="h-full overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {allMessages.length > 0 ? (
                        allMessages.map((msg) => {
                            const isCurrentUser = msg.user === (currentUser?.displayName || currentUser?.email || currentUser?.uid);
                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white'} rounded-lg shadow-md px-4 py-2 transition-all duration-200 hover:shadow-lg`}>
                                        <div className="flex flex-col">
                                            <p className={`font-bold text-sm ${isCurrentUser ? 'text-indigo-200' : 'text-indigo-600'}`}>{msg.user}</p>
                                            <p className="my-1">{msg.text}</p>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    {!msg.createdAt && isCurrentUser && 'Sending...'}
                                                </span>
                                                <span className={`text-xs ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    {msg.createdAt && new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-gray-500 mt-4">No messages yet</p>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form 
                onSubmit={handleSubmit} 
                className='sticky bottom-0 left-0 right-0 flex justify-center p-4 border-t border-gray-200 bg-white shadow-lg'
            >
                <div className="flex items-center w-[50%] max-w-lg mx-auto">
                    <input
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        type="text"
                        placeholder='Type a message...'
                        className='flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
                    />
                    <button 
                        type='submit' 
                        className='ml-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200 disabled:opacity-50 transform hover:scale-105'
                        disabled={!message.trim()}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Messages
