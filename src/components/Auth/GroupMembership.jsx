import React, { useState, useEffect, useContext } from 'react';
import { ref as dbRef, set, get, onValue, off } from 'firebase/database';
import { realtimeDb } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';

const GroupMembership = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  const availableGroups = [
    { id: 'interview', name: 'Interview Preparation', description: 'Practice interview questions and techniques' },
    { id: 'aptitude', name: 'Aptitude', description: 'Logical reasoning and quantitative aptitude' },
    { id: 'english', name: 'English', description: 'Grammar, vocabulary, and communication skills' },
    { id: 'programming', name: 'Programming', description: 'Coding practice and algorithm discussions' }
  ];

  useEffect(() => {
    if (!currentUser) return;

    const userGroupsRef = dbRef(realtimeDb, `userGroups/${currentUser.uid}`);
    
    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserGroups(Object.keys(data));
      } else {
        setUserGroups([]);
      }
      setLoading(false);
    };

    onValue(userGroupsRef, handleData);

    return () => {
      off(userGroupsRef, 'value', handleData);
    };
  }, [currentUser]);

  const joinGroup = async (groupId) => {
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
      
      console.log(`Joined group: ${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    }
  };

  const leaveGroup = async (groupId) => {
    if (!currentUser) return;

    try {
      const userGroupRef = dbRef(realtimeDb, `userGroups/${currentUser.uid}/${groupId}`);
      const groupMemberRef = dbRef(realtimeDb, `groupMembers/${groupId}/${currentUser.uid}`);
      
      await set(userGroupRef, null);
      await set(groupMemberRef, null);
      
      console.log(`Left group: ${groupId}`);
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group. Please try again.');
    }
  };

  const isUserInGroup = (groupId) => {
    return userGroups.includes(groupId);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Membership</h3>
      
      {availableGroups.map((group) => {
        const isMember = isUserInGroup(group.id);
        
        return (
          <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{group.name}</h4>
                <p className="text-sm text-gray-600">{group.description}</p>
                {isMember && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Member
                  </span>
                )}
              </div>
              
              <button
                onClick={() => isMember ? leaveGroup(group.id) : joinGroup(group.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isMember
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isMember ? 'Leave' : 'Join'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Hook to check if user is member of a group
export const useGroupMembership = (groupId) => {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser || !groupId) {
      setLoading(false);
      return;
    }

    const userGroupRef = dbRef(realtimeDb, `userGroups/${currentUser.uid}/${groupId}`);
    
    const handleData = (snapshot) => {
      setIsMember(snapshot.exists());
      setLoading(false);
    };

    onValue(userGroupRef, handleData);

    return () => {
      off(userGroupRef, 'value', handleData);
    };
  }, [currentUser, groupId]);

  return { isMember, loading };
};

// Function to check if user can access group materials
export const checkGroupAccess = async (userId, groupId) => {
  if (!userId || !groupId) return false;

  try {
    const userGroupRef = dbRef(realtimeDb, `userGroups/${userId}/${groupId}`);
    const snapshot = await get(userGroupRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking group access:', error);
    return false;
  }
};

export default GroupMembership;
