import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api/api";
import Alert from "../components/ui/Alert";
import { 
  FiFile, 
  FiDownload, 
  FiTrash2, 
  FiEye, 
  FiClock, 
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiDollarSign
} from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { BiTimeFive } from "react-icons/bi";

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

    // Fetch files
    useEffect(() => {
      const fetchFiles = async () => {
        try {
          const response = await api.get('/api/files/');
          setFiles(response.data);
          if (response.data.length > 0) {
           setMessage("Files loaded successfully.");
          }
          setMessageType("success");
        } catch (error) {
          setMessage("Failed to fetch files. Please try again.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      };
  
      fetchFiles();
    }, []);
  
    // Delete file
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this file?");
        if (confirmed) {
          try {
            await api.delete(`/api/files/${id}/delete/`);
            setFiles(files.filter((file) => file.id !== id));
            setMessage("File deleted successfully.");
            setMessageType("success");
          } catch (err) {
            setMessage("Failed to delete file. Please try again.");
            setMessageType("error");
          }
        }
    };

    // Filter and search files
    const filteredFiles = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || file.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Get status badge styling
    const getStatusBadge = (status) => {
      const styles = {
        'Completed': 'bg-green-100 text-green-800 border-green-200',
        'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
        'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
        'Failed': 'bg-red-100 text-red-800 border-red-200'
      };
      return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Get status icon
    const getStatusIcon = (status) => {
      switch(status) {
        case 'Completed': return <FiCheckCircle className="w-4 h-4" />;
        case 'Processing': return <BiTimeFive className="w-4 h-4" />;
        case 'Pending': return <FiClock className="w-4 h-4" />;
        case 'Failed': return <FiAlertCircle className="w-4 h-4" />;
        default: return <FiFile className="w-4 h-4" />;
      }
    };

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Stats summary
    const stats = {
      total: files.length,
      completed: files.filter(f => f.status === 'Completed').length,
      processing: files.filter(f => f.status === 'Processing' || f.status === 'Pending').length,
      failed: files.filter(f => f.status === 'Failed').length
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and view all your transcription files
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <HiOutlineDocumentText className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <FiCheckCircle className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processing}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <BiTimeFive className="text-orange-600 w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.failed}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <FiAlertCircle className="text-red-600 w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Files Display */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-green mb-4"></div>
                <p className="text-gray-600">Loading your files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineDocumentText className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {files.length === 0 ? 'No files yet' : 'No files found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {files.length === 0 
                    ? 'Upload your first audio file to get started with transcription'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {files.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/dashboard/upload'}
                    className="inline-flex items-center gap-2 bg-mint-green text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <FiFile /> Upload Files
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* File Icon and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-mint-green bg-opacity-10 p-3 rounded-lg">
                        <HiOutlineDocumentText className="text-mint-green w-8 h-8" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(file.status)}`}>
                        {getStatusIcon(file.status)}
                        {file.status}
                      </span>
                    </div>

                    {/* File Info */}
                    <h3 className="font-semibold text-gray-900 mb-2 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(file.date_uploaded || file.uploaded_at)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock className="w-4 h-4" />
                        {file.size} minutes
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiDollarSign className="w-4 h-4" />
                        ${file.total_cost}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => alert(`Viewing details for ${file.name}`)}
                        disabled={file.status !== "Completed"}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          file.status === "Completed" 
                            ? "bg-mint-green text-white hover:bg-teal-600" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-mint-green bg-opacity-10 p-2 rounded">
                              <HiOutlineDocumentText className="text-mint-green w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-900">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {file.size} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(file.date_uploaded || file.uploaded_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusBadge(file.status)}`}>
                            {getStatusIcon(file.status)}
                            {file.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${file.total_cost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => alert(`Viewing details for ${file.name}`)}
                              disabled={file.status !== "Completed"}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                                file.status === "Completed" 
                                  ? "bg-mint-green text-white hover:bg-teal-600" 
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <FiEye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default FileList;
  