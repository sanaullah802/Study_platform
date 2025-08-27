import React, { useState, useEffect, useContext } from 'react';
import { ref as dbRef, onValue, off } from 'firebase/database';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { realtimeDb, db } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaFilter, 
  FaFileAlt, 
  FaUsers, 
  FaComments, 
  FaTimes,
  FaDownload,
  FaExternalLinkAlt,
  FaUser,
  FaClock
} from 'react-icons/fa';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    materials: [],
    groups: [],
    users: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [allMaterials, setAllMaterials] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const subjects = ['interview', 'aptitude', 'english', 'programming'];

  useEffect(() => {
    if (!isOpen) return;

    // Fetch all materials from all groups
    const fetchMaterials = () => {
      const materials = [];
      let loadedGroups = 0;

      subjects.forEach(subject => {
        const materialsRef = dbRef(realtimeDb, `materials/${subject}`);
        onValue(materialsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const groupMaterials = Object.values(data).map(material => ({
              ...material,
              groupId: subject,
              groupName: subject.charAt(0).toUpperCase() + subject.slice(1)
            }));
            
            // Remove existing materials from this group and add new ones
            const filteredMaterials = materials.filter(m => m.groupId !== subject);
            materials.splice(0, materials.length, ...filteredMaterials, ...groupMaterials);
          }
          
          loadedGroups++;
          if (loadedGroups === subjects.length) {
            setAllMaterials([...materials]);
          }
        });
      });
    };

    // Fetch all messages
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      setAllMessages(messages);
    });

    fetchMaterials();

    return () => {
      unsubscribeMessages();
      // Clean up real-time listeners
      subjects.forEach(subject => {
        const materialsRef = dbRef(realtimeDb, `materials/${subject}`);
        off(materialsRef);
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ materials: [], groups: [], users: [] });
      return;
    }

    setLoading(true);
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search materials
    const matchingMaterials = allMaterials.filter(material =>
      material.title?.toLowerCase().includes(searchLower) ||
      material.description?.toLowerCase().includes(searchLower) ||
      material.uploadedBy?.displayName?.toLowerCase().includes(searchLower) ||
      material.groupName?.toLowerCase().includes(searchLower)
    );

    // Search groups (predefined groups)
    const matchingGroups = subjects.filter(subject =>
      subject.toLowerCase().includes(searchLower)
    ).map(subject => ({
      id: subject,
      name: subject.charAt(0).toUpperCase() + subject.slice(1),
      description: `${subject.charAt(0).toUpperCase() + subject.slice(1)} study group`,
      materialsCount: allMaterials.filter(m => m.groupId === subject).length
    }));

    // Search users (from messages and material uploads)
    const allUsers = new Map();
    
    // Add users from materials
    allMaterials.forEach(material => {
      if (material.uploadedBy?.uid && material.uploadedBy?.displayName) {
        allUsers.set(material.uploadedBy.uid, {
          uid: material.uploadedBy.uid,
          displayName: material.uploadedBy.displayName,
          email: material.uploadedBy.email,
          materialsCount: (allUsers.get(material.uploadedBy.uid)?.materialsCount || 0) + 1,
          lastActive: Math.max(allUsers.get(material.uploadedBy.uid)?.lastActive || 0, material.uploadedAt)
        });
      }
    });

    // Add users from messages
    allMessages.forEach(message => {
      if (message.user && !allUsers.has(message.user)) {
        allUsers.set(message.user, {
          uid: message.user,
          displayName: message.user,
          email: message.user,
          materialsCount: 0,
          lastActive: message.createdAt?.toDate?.()?.getTime() || Date.now()
        });
      }
    });

    const matchingUsers = Array.from(allUsers.values()).filter(user =>
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );

    setSearchResults({
      materials: matchingMaterials,
      groups: matchingGroups,
      users: matchingUsers
    });
    
    setLoading(false);
  }, [searchTerm, allMaterials, allMessages]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleMaterialClick = (material) => {
    if (material.type === 'link') {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.fileName || material.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTotalResults = () => {
    return searchResults.materials.length + searchResults.groups.length + searchResults.users.length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials, groups, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'all', label: `All (${getTotalResults()})`, icon: <FaSearch /> },
            { key: 'materials', label: `Materials (${searchResults.materials.length})`, icon: <FaFileAlt /> },
            { key: 'groups', label: `Groups (${searchResults.groups.length})`, icon: <FaUsers /> },
            { key: 'users', label: `Users (${searchResults.users.length})`, icon: <FaUser /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{searchResults[tab.key]?.length || getTotalResults()}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : !searchTerm.trim() ? (
            <div className="text-center py-12">
              <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Search Everything</h3>
              <p className="text-gray-500">Find materials, groups, and users across all study groups</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Materials Results */}
              {(activeTab === 'all' || activeTab === 'materials') && searchResults.materials.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaFileAlt className="text-indigo-600" />
                    Materials ({searchResults.materials.length})
                  </h3>
                  <div className="space-y-3">
                    {searchResults.materials.slice(0, activeTab === 'materials' ? undefined : 3).map((material) => (
                      <div
                        key={material.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleMaterialClick(material)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">{material.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{material.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded">{material.groupName}</span>
                              <span>by {material.uploadedBy?.displayName || 'Anonymous'}</span>
                              <span>{formatDate(material.uploadedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {material.type === 'link' ? <FaExternalLinkAlt /> : <FaDownload />}
                            <span>{material.reuseCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups Results */}
              {(activeTab === 'all' || activeTab === 'groups') && searchResults.groups.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUsers className="text-green-600" />
                    Groups ({searchResults.groups.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <h4 className="font-medium text-gray-800 mb-1">{group.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="text-xs text-gray-500">
                          {group.materialsCount} materials
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && searchResults.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUser className="text-purple-600" />
                    Users ({searchResults.users.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.users.slice(0, activeTab === 'users' ? undefined : 4).map((user) => (
                      <div
                        key={user.uid}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{user.displayName}</h4>
                            <p className="text-sm text-gray-600">{user.materialsCount} materials shared</p>
                            <p className="text-xs text-gray-500">
                              Last active: {formatDate(user.lastActive)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
