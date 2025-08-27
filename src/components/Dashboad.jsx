import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaVideo, FaPlus, FaBook, FaRobot, FaBookReader, FaBars, FaTimes, FaFileAlt, FaChartLine } from "react-icons/fa";
import Home from '../components/Videocall/Home';
import { signOut } from "firebase/auth";
import { auth, realtimeDb } from '../firebase';
import { ref as dbRef, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Messages from './chat/Chat';
import Chatbot from './Chatbot';
import Prepration from './Prepration';
import DashboardInsights from './dashboard/DashboardInsights';
import MaterialsList from './materials/MaterialsList';
import GlobalSearch from './search/GlobalSearch';
import GroupMembership from './auth/GroupMembership';
import { AiFillAndroid } from "react-icons/ai";
import { IoIosCall } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { IoMdArrowBack } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

const Dashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeComponent, setActiveComponent] = useState('insights');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const subjects = ['All', 'Interview', 'Aptitude', 'English', 'Programming'];

  const studyGroups = [
    { id: 1, name: ' Study Group', subject: 'English', members: 12, description: 'Advanced English concepts ' },
    { id: 2, name: 'Programming Study Group', subject: 'Programming', members: 8, description: 'Programming Study Group for beginners' },
    { id: 3, name: 'study Group', subject: 'Aptitude', members: 15, description: 'Study of Aptitude for competitive exams' },
    { id: 4, name: 'Interview Preparation Group', subject: 'Interview', members: 20, description: 'Implementation and analysis of interview questions' }
  ];

  const filteredGroups = selectedSubject === 'All' ? studyGroups : studyGroups.filter(group => group.subject === selectedSubject);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const joinGroupAutomatically = async (groupId) => {
    if (!currentUser) return;

    try {
      const userGroupRef = dbRef(realtimeDb, `userGroups/${currentUser.uid}/${groupId}`);
      const groupMemberRef = dbRef(realtimeDb, `groupMembers/${groupId}/${currentUser.uid}`);

      const memberData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        joinedAt: Date.now()
      };

      await set(userGroupRef, true);
      await set(groupMemberRef, memberData);
    } catch (error) {
      console.error('Error auto-joining group:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 p-4 z-20">
        <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-indigo-600 focus:outline-none focus:shadow-outline">
          {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-xl h-screen fixed top-0 left-0 overflow-y-auto z-10 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-2xl text-indigo-600 font-bold mb-6 flex gap-2 items-center">
            <FaBookReader className='text-indigo-500' /> VirtualStudy
          </h2>
          <hr className='mb-6' />
          <nav className="flex flex-col gap-3">
            {[{
              key: 'insights', label: 'Dashboard', icon: <FaChartLine />
            }, {
              key: 'groups', label: 'Study Groups', icon: <FaBook />
            }, {
              key: 'materials', label: 'Materials', icon: <FaFileAlt />
            }, {
              key: 'create', label: 'Create Group', icon: <FaPlus />
            }, {
              key: 'video', label: 'Video Call', icon: <FaVideo />
            }, {
              key: 'ai', label: 'Ask with AI', icon: <FaRobot />
            }, {
              key: 'preparation', label: 'Preparation', icon: <FaBrain />
            }].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveComponent(item.key);
                  setIsMobileMenuOpen(false); // Close mobile menu after selection
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 text-lg ${activeComponent === item.key ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-800'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <hr className='my-4' />
          <Link to="/about" className="flex items-center gap-2 px-4 py-3 mb-2 rounded-lg transition-all hover:duration-300 text-lg hover:bg-gray-100 text-gray-800 ">
            <AiFillAndroid />About Us
          </Link>
          <Link to="/contact" className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all hover:duration-300 text-lg hover:bg-gray-100 text-gray-800">
            <IoIosCall />Contact Us
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'ml-0' : 'md:ml-64'} overflow-x-hidden`}>
        <div className='h-16 w-full bg-white shadow flex items-center justify-between px-6 animate-fade-in-down'>
          {/* Profile Icon with Tooltip */}
          <div className="relative group flex gap-1">
            <CgProfile className={`text-2xl text-gray-700 cursor-pointer ${isMobileMenuOpen ?'px-[2vw]':'ml-0'}`} />
            <p className="hidden md:block">{currentUser?.email}</p>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {currentUser?.email}
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            {/* Global Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Search everything"
            >
              <FaSearch />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Logout Button */}
            <button onClick={handleLogout} className="flex justify-center gap-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
              <IoMdArrowBack className='mt-1' />Logout
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 sm:px-8 animate-fade-in overflow-x-hidden">
          {activeComponent === 'insights' && (
            <DashboardInsights />
          )}

          {activeComponent === 'materials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
                <div className="flex gap-2 overflow-x-auto sm:flex-row flex-wrap">
                  {['All', ...subjects].map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 border ${selectedSubject === subject ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-100 border-gray-300'} sm:px-4 sm:py-1.5`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubject === 'All' ? (
                <div className="space-y-8">
                  {subjects.map(subject => (
                    <div key={subject}>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">{subject} Materials</h2>
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setSelectedGroup(subject);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          View All →
                        </button>
                      </div>
                      <MaterialsList groupId={subject} groupName={subject} />
                    </div>
                  ))}
                </div>
              ) : (
                <MaterialsList
                  groupId={selectedSubject.toLowerCase()}
                  groupName={selectedSubject}
                />
              )}
            </div>
          )}

          {activeComponent === 'groups' && (
            <>
              <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-y-2 sm:gap-y-0">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Study Groups</h1>
                <div className="flex gap-2 overflow-x-auto sm:flex-row flex-wrap justify-end">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 border ${selectedSubject === subject ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-100 border-gray-300'} sm:px-4 sm:py-1.5`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition transform hover:scale-[1.02] duration-200 sm:p-6">
                    <h3 className="text-xl font-semibold mb-1 text-gray-800 break-words">{group.name}</h3>
                    <p className="text-indigo-600 mb-2 font-medium break-words">{group.subject}</p>
                    <p className="text-gray-600 mb-4 break-words text-sm sm:text-base">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{group.members} members</span>
                      <Link
                        to={`/${group.subject.toLowerCase()}`}
                        onClick={() => joinGroupAutomatically(group.subject.toLowerCase())}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition text-sm sm:px-4 sm:py-2"
                      >
                        Join Group
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeComponent === 'create' && (
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in sm:p-8">
              <Messages room="general" />
            </div>
          )}

          {activeComponent === 'video' && (
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in  sm:p-8">
              <Home />
            </div>
          )}

          {activeComponent === 'ai' && (
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in  sm:p-8">
              <Chatbot />
            </div>
          )}

          {activeComponent === 'preparation' && (
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in  sm:p-8">
              <Prepration />
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
  );
};

export default Dashboard;