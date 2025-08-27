import React, { useState, useContext } from 'react';
import { ref as dbRef, update } from 'firebase/database';
import { realtimeDb } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaDownload, 
  FaExternalLinkAlt, 
  FaThumbsUp, 
  FaComment, 
  FaFile, 
  FaFilePdf, 
  FaFileWord, 
  FaFileImage, 
  FaFileAlt,
  FaLink,
  FaUser,
  FaClock
} from 'react-icons/fa';

const MaterialCard = ({ material, onCommentClick }) => {
  const [isLiking, setIsLiking] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const getFileIcon = (fileType) => {
    if (fileType === 'link') return <FaLink className="text-blue-500" />;
    if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <FaFileWord className="text-blue-600" />;
    if (fileType?.includes('image')) return <FaFileImage className="text-green-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const materialRef = dbRef(realtimeDb, `materials/${material.groupId}/${material.id}`);
      await update(materialRef, {
        reuseCount: (material.reuseCount || 0) + 1
      });
    } catch (error) {
      console.error('Error updating reuse count:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = () => {
    if (material.type === 'link') {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    } else {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.fileName || material.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Increment reuse count on download
      handleLike();
    }
  };

  const commentCount = material.comments ? Object.keys(material.comments).length : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {getFileIcon(material.fileType)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
              {material.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <FaUser className="text-xs" />
              <span>{material.uploadedBy?.displayName || 'Anonymous'}</span>
              <span>•</span>
              <FaClock className="text-xs" />
              <span>{formatDate(material.uploadedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {material.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {material.description}
        </p>
      )}

      {/* File Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        {material.fileSize && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {formatFileSize(material.fileSize)}
          </span>
        )}
        <span className="bg-gray-100 px-2 py-1 rounded capitalize">
          {material.type}
        </span>
        {material.fileType && material.fileType !== 'link' && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {material.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Like/Reuse Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            <FaThumbsUp className={`${isLiking ? 'animate-pulse' : ''}`} />
            <span>{material.reuseCount || 0}</span>
            <span className="hidden sm:inline">Useful</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onCommentClick && onCommentClick(material)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaComment />
            <span>{commentCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>
        </div>

        {/* Download/Open Button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
        >
          {material.type === 'link' ? (
            <>
              <FaExternalLinkAlt />
              <span className="hidden sm:inline">Open Link</span>
            </>
          ) : (
            <>
              <FaDownload />
              <span className="hidden sm:inline">Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
