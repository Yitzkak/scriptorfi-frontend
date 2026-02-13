import React, { useState } from 'react';
import { FiX, FiClock, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

const VersionHistoryModal = ({ isOpen, onClose, versions, onRestore, onDelete }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPreview = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 2).join(' ').substring(0, 80);
    return preview + (content.length > 80 ? '...' : '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FiClock className="text-gray-500" size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Version History</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Version List */}
          <div className="w-72 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
            {versions.length === 0 ? (
              <div className="p-8 text-center">
                <FiClock size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">No versions saved yet</p>
                <p className="text-xs text-gray-300 mt-1">Versions auto-save every 5 minutes</p>
              </div>
            ) : (
              <div className="p-2">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                      selectedVersion?.id === version.id 
                        ? 'bg-white shadow-sm border border-gray-100' 
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Version {versions.length - index}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(version.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {getPreview(version.content)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col">
            {selectedVersion ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Version {versions.length - versions.findIndex(v => v.id === selectedVersion.id)}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                        {formatDate(selectedVersion.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 whitespace-pre-wrap font-mono text-sm text-gray-600 leading-relaxed max-h-80 overflow-y-auto border border-gray-100">
                    {selectedVersion.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-100 p-4 flex gap-2 justify-end bg-gray-50/50">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this version?')) {
                        onDelete(selectedVersion.id);
                        setSelectedVersion(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Restore this version? Current content will be saved first.')) {
                        onRestore(selectedVersion.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <FiRotateCcw size={14} />
                    Restore
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                <FiClock size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Select a version to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
