import React, { useState, useEffect, useContext } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { realtimeDb, db } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import {
  FaUsers,
  FaFileAlt,
  FaComments,
  FaThumbsUp,
  FaClock,
  FaChartLine
} from 'react-icons/fa';

const DashboardInsights = () => {
  const [insights, setInsights] = useState({
    totalMaterials: 0,
    recentMaterials: [],
    popularMaterials: [],
    recentMessages: [],
    groupActivity: {},
    userStats: {
      materialsUploaded: 0,
      totalDownloads: 0,
      commentsReceived: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  const subjects = ['interview', 'aptitude', 'english', 'programming'];

  useEffect(() => {
    if (!currentUser) return;

    const fetchInsights = async () => {
      try {
        // Fetch materials from all groups
        const allMaterials = [];
        const groupActivities = {};

        // Listen to materials from all subject groups
        const unsubscribers = [];

        subjects.forEach(subject => {
          const materialsRef = dbRef(realtimeDb, `materials/${subject}`);

          const unsubscribe = onValue(materialsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const materials = Object.values(data).map(material => ({
                ...material,
                groupId: subject
              }));

              // Remove existing materials from this group and add new ones
              const filteredMaterials = allMaterials.filter(m => m.groupId !== subject);
              allMaterials.length = 0;
              allMaterials.push(...filteredMaterials, ...materials);

              // Calculate group activity
              groupActivities[subject] = {
                materialsCount: materials.length,
                recentActivity: materials.filter(m =>
                  Date.now() - m.uploadedAt < 7 * 24 * 60 * 60 * 1000 // Last 7 days
                ).length,
                totalReuses: materials.reduce((sum, m) => sum + (m.reuseCount || 0), 0)
              };

              updateInsights();
            }
          });

          unsubscribers.push(unsubscribe);
        });

        // Fetch recent messages from Firestore
        const messagesQuery = query(
          collection(db, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const messages = [];
          snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
          });
          
          setInsights(prev => ({
            ...prev,
            recentMessages: messages
          }));
        });

        const updateInsights = () => {
          // Sort materials by upload date
          const sortedMaterials = [...allMaterials].sort((a, b) => b.uploadedAt - a.uploadedAt);
          
          // Get recent materials (last 7 days)
          const recentMaterials = sortedMaterials.filter(material => 
            Date.now() - material.uploadedAt < 7 * 24 * 60 * 60 * 1000
          ).slice(0, 5);

          // Get popular materials (by reuse count)
          const popularMaterials = [...allMaterials]
            .sort((a, b) => (b.reuseCount || 0) - (a.reuseCount || 0))
            .slice(0, 5);

          // Calculate user stats
          const userMaterials = allMaterials.filter(m => m.uploadedBy?.uid === currentUser.uid);
          const userStats = {
            materialsUploaded: userMaterials.length,
            totalDownloads: userMaterials.reduce((sum, m) => sum + (m.reuseCount || 0), 0),
            commentsReceived: userMaterials.reduce((sum, m) => {
              const comments = m.comments ? Object.keys(m.comments).length : 0;
              return sum + comments;
            }, 0)
          };

          setInsights(prev => ({
            ...prev,
            totalMaterials: allMaterials.length,
            recentMaterials,
            popularMaterials,
            groupActivity: groupActivities,
            userStats
          }));
          
          setLoading(false);
        };

        // Initial update
        updateInsights();

        return () => {
          unsubscribeMessages();
          // Clean up real-time listeners
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('Error fetching insights:', error);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [currentUser]);

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

  const getGroupDisplayName = (groupId) => {
    const names = {
      interview: 'Interview Prep',
      aptitude: 'Aptitude',
      english: 'English',
      programming: 'Programming'
    };
    return names[groupId] || groupId;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaFileAlt className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Materials</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalMaterials}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaThumbsUp className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{insights.userStats.totalDownloads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaComments className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comments Received</p>
              <p className="text-2xl font-bold text-gray-900">{insights.userStats.commentsReceived}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaUsers className="text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Materials Shared</p>
              <p className="text-2xl font-bold text-gray-900">{insights.userStats.materialsUploaded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Popular Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-indigo-600" />
              Recent Materials
            </h3>
          </div>
          <div className="p-6">
            {insights.recentMaterials.length > 0 ? (
              <div className="space-y-4">
                {insights.recentMaterials.map((material, index) => (
                  <div key={material.id || index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">{material.title}</p>
                      <p className="text-sm text-gray-600">
                        {getGroupDisplayName(material.groupId)} • {formatDate(material.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaThumbsUp />
                      <span>{material.reuseCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent materials</p>
            )}
          </div>
        </div>

        {/* Popular Materials */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-green-600" />
              Popular Materials
            </h3>
          </div>
          <div className="p-6">
            {insights.popularMaterials.length > 0 ? (
              <div className="space-y-4">
                {insights.popularMaterials.map((material, index) => (
                  <div key={material.id || index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">{material.title}</p>
                      <p className="text-sm text-gray-600">
                        {getGroupDisplayName(material.groupId)} • by {material.uploadedBy?.displayName || 'Anonymous'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <FaThumbsUp />
                      <span>{material.reuseCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No popular materials yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Group Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Group Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map(subject => {
              const activity = insights.groupActivity[subject] || {};
              return (
                <div key={subject} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">{getGroupDisplayName(subject)}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{activity.materialsCount || 0} materials</p>
                    <p>{activity.recentActivity || 0} this week</p>
                    <p>{activity.totalReuses || 0} total uses</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInsights;
