import React, { useState, useEffect, useContext } from 'react';
import { ref as dbRef, push, set, onValue, off } from 'firebase/database';
import { realtimeDb } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { FaTimes, FaReply, FaUser, FaClock, FaSpinner } from 'react-icons/fa';

const CommentsModal = ({ material, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!material?.id || !material?.groupId) return;

    const commentsRef = dbRef(realtimeDb, `materials/${material.groupId}/${material.id}/comments`);
    
    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentsArray = Object.entries(data).map(([id, comment]) => ({
          id,
          ...comment
        }));
        
        // Sort comments by timestamp
        commentsArray.sort((a, b) => a.timestamp - b.timestamp);
        setComments(commentsArray);
      } else {
        setComments([]);
      }
      setLoading(false);
    };

    onValue(commentsRef, handleData);

    return () => {
      off(commentsRef, 'value', handleData);
    };
  }, [material?.id, material?.groupId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const commentsRef = dbRef(realtimeDb, `materials/${material.groupId}/${material.id}/comments`);
      const newCommentRef = push(commentsRef);
      
      const commentData = {
        id: newCommentRef.key,
        text: newComment.trim(),
        author: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0]
        },
        timestamp: Date.now(),
        replies: {}
      };

      await set(newCommentRef, commentData);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting || !replyTo) return;

    setSubmitting(true);
    try {
      const repliesRef = dbRef(realtimeDb, `materials/${material.groupId}/${material.id}/comments/${replyTo}/replies`);
      const newReplyRef = push(repliesRef);
      
      const replyData = {
        id: newReplyRef.key,
        text: replyText.trim(),
        author: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0]
        },
        timestamp: Date.now()
      };

      await set(newReplyRef, replyData);
      setReplyText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getReplies = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment?.replies) return [];
    
    return Object.entries(comment.replies).map(([id, reply]) => ({
      id,
      ...reply
    })).sort((a, b) => a.timestamp - b.timestamp);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Comments</h2>
            <p className="text-gray-600 text-sm">{material.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-xl text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUser className="text-gray-400 text-sm" />
                        <span className="font-medium text-gray-800">
                          {comment.author?.displayName || 'Anonymous'}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-indigo-600 text-sm hover:text-indigo-700 flex items-center gap-1"
                      >
                        <FaReply className="text-xs" />
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {replies.map((reply) => (
                          <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <FaUser className="text-gray-400 text-xs" />
                              <span className="font-medium text-gray-700 text-sm">
                                {reply.author?.displayName || 'Anonymous'}
                              </span>
                              <span className="text-gray-400 text-sm">•</span>
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                <FaClock className="text-xs" />
                                {formatDate(reply.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyTo === comment.id && (
                      <div className="ml-6">
                        <form onSubmit={handleSubmitReply} className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows="2"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            disabled={submitting}
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={!replyText.trim() || submitting}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {submitting ? 'Replying...' : 'Reply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No comments yet</h3>
              <p className="text-gray-500">Be the first to comment on this material!</p>
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t p-6">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={submitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
