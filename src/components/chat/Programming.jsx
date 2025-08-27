import React, { useState, useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';
import MaterialsList from '../materials/MaterialsList';
import { FaComments, FaFileAlt } from 'react-icons/fa';
import FullFunctionalityTest from '../test/FullFunctionalityTest';

const Programming = () => {
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('chat');
    const messagesEndRef = useRef(null);

    const messageRef = collection(db, 'messages');

    const { currentUser } = useContext(AuthContext);

    // Debug: Log current user
    useEffect(() => {
        console.log("Current user in Programming component:", currentUser);
    }, [currentUser]);
    
        const scrollToBottom = () => {
            // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };
    
        useEffect(() => {
            // Query messages for programming room - simplified query
            const queryMessages = query(
                messageRef,
                where("room", "==", "programming")
            );
            
            const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
                let msg = [];
                snapshot.forEach((doc) => {
                    msg.push({ ...doc.data(), id: doc.id });
                });

                // Sort messages by timestamp on client side
                msg.sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return a.createdAt.toMillis() - b.createdAt.toMillis();
                });

                setAllMessages(msg);
                console.log("Messages loaded for programming room:", msg.length, "messages"); // Debug log
                scrollToBottom();
            }, (error) => {
                console.error("Error fetching messages:", error);
                console.log("Trying to fetch all messages without room filter...");

                // Fallback: try to get all messages if room filter fails
                const fallbackQuery = query(messageRef);
                onSnapshot(fallbackQuery, (snapshot) => {
                    let allMsg = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.room === "programming") {
                            allMsg.push({ ...data, id: doc.id });
                        }
                    });

                    allMsg.sort((a, b) => {
                        if (!a.createdAt || !b.createdAt) return 0;
                        return a.createdAt.toMillis() - b.createdAt.toMillis();
                    });

                    setAllMessages(allMsg);
                    console.log("Fallback: Messages loaded:", allMsg.length, "messages");
                });
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

            console.log("Attempting to send message:", message);
            console.log("Current user:", currentUser);
            console.log("Message ref:", messageRef);

            try {
                const docRef = await addDoc(messageRef, {
                    text: message,
                    createdAt: serverTimestamp(),
                    user: currentUser?.displayName || currentUser?.email || currentUser?.uid,
                    room: "programming",
                });
                setMessage('');
                console.log("Message sent successfully with ID:", docRef.id);
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please check your internet connection and try again.");
            }
        }

    return (
        <div className='flex flex-col h-screen bg-gray-100'>
            <div className="bg-white shadow-sm">
                <h1 className='text-2xl font-bold p-4 text-center'>Programming Study Group</h1>
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                            activeTab === 'chat'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FaComments />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                            activeTab === 'materials'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FaFileAlt />
                        Materials
                    </button>
                    <button
                        onClick={() => setActiveTab('test')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                            activeTab === 'test'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        🧪 Test
                    </button>
                </div>
            </div>

            {activeTab === 'chat' ? (
                <>
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
                                    <div className={`max-w-[70%] ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm px-4 py-3 transition-all duration-200 hover:shadow-md`}>
                                        <div className="flex flex-col">
                                            <p className={`font-semibold text-sm font-poppins ${isCurrentUser ? 'text-indigo-100' : 'text-indigo-700'} mb-1`}>{msg.user}</p>
                                            <p className={`font-inter text-sm leading-relaxed ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>{msg.text}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-xs font-inter ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    {!msg.createdAt && isCurrentUser && 'Sending...'}
                                                </span>
                                                <span className={`text-xs font-inter ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    {msg.createdAt && new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center text-gray-500 mt-8">
                            <FaComments className="mx-auto text-4xl mb-4 opacity-50" />
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm mt-2">Start the conversation by sending the first message!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
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
                        className='flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 font-inter text-sm'
                    />
                    <button
                        type='submit'
                        className='ml-3 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-200 disabled:opacity-50 transform hover:scale-105 font-medium text-sm shadow-lg'
                        disabled={!message.trim()}
                    >
                        Send
                    </button>
                </div>
            </form>
                    </div>
                </>
            ) : activeTab === 'materials' ? (
                <div className="flex-1 overflow-y-auto p-6">
                    <MaterialsList groupId="programming" groupName="Programming" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6">
                    <FullFunctionalityTest />
                </div>
            )}
        </div>
    );
}
export default Programming;