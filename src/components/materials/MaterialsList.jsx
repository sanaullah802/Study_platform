import React, { useState, useEffect, useContext } from 'react';
import { ref as dbRef, onValue, off } from 'firebase/database';
import { realtimeDb } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { useGroupMembership } from '../auth/GroupMembership';
import MaterialCard from './MaterialCard';
import FileUpload from './FileUpload';
import CommentsModal from './CommentsModal';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaSpinner, FaLock } from 'react-icons/fa';

const MaterialsList = ({ groupId, groupName }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular, title
  const [filterType, setFilterType] = useState('all'); // all, file, link
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { isMember, loading: membershipLoading } = useGroupMembership(groupId);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    const materialsRef = dbRef(realtimeDb, `materials/${groupId}`);

    const handleData = (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const materialsArray = Object.entries(data).map(([key, material]) => ({
            ...material,
            id: key // Use the Firebase key as ID
          }));
          setMaterials(materialsArray);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error('Error processing materials data:', error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onValue(materialsRef, handleData, (error) => {
      console.error('Firebase listener error:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [groupId]);

  useEffect(() => {
    let filtered = [...materials];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.uploadedBy?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(material => material.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.uploadedAt - b.uploadedAt;
        case 'popular':
          return (b.reuseCount || 0) - (a.reuseCount || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return b.uploadedAt - a.uploadedAt;
      }
    });

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, sortBy, filterType]);

  const handleUploadComplete = (newMaterial) => {
    // The real-time listener will automatically update the materials list
    console.log('Material uploaded:', newMaterial);
  };

  const handleCommentClick = (material) => {
    setSelectedMaterial(material);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedMaterial(null);
  };

  if (loading || membershipLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading materials...</span>
      </div>
    );
  }

  // Check if user has access to this group
  if (!isMember) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">
          <FaLock />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-500 mb-6">
          You need to join the {groupName} group to view and share materials.
        </p>
        <button
          onClick={() => window.location.reload()} // Simple refresh to check membership
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Study Materials</h2>
            <p className="text-gray-600">{groupName} Group • {materials.length} materials shared</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <FileUpload groupId={groupId} onUploadComplete={handleUploadComplete} />
            <div className="text-sm text-gray-500 text-center sm:text-right">
              <p>📚 Share files, links & resources</p>
              <p>🤝 Help your study group succeed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials, descriptions, or uploaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="file">Files Only</option>
              <option value="link">Links Only</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Useful</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredMaterials.length} of {materials.length} materials
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onCommentClick={handleCommentClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || filterType !== 'all' ? 'No materials found' : 'No materials yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Be the first to share study materials with your group!'}
          </p>
          {(!searchTerm && filterType === 'all') && (
            <FileUpload groupId={groupId} onUploadComplete={handleUploadComplete} />
          )}
        </div>
      )}

      {/* Comments Modal */}
      {showComments && selectedMaterial && (
        <CommentsModal
          material={selectedMaterial}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
};

export default MaterialsList;
