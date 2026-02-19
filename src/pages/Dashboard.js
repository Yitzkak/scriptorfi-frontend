import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUpload, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiTrendingUp,
  FiDollarSign 
} from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { BiTimeFive } from 'react-icons/bi';
import { useAuth } from '../authContext';
import api from '../api/api';

const Dashboard = () => {
    const { user } = useAuth();
    const displayName = user?.first_name || (user?.email?.split('@')[0] || 'User');
    const [stats, setStats] = useState({
        totalFiles: 0,
        pendingFiles: 0,
        completedFiles: 0,
        totalSpent: 0
    });
    const [recentFiles, setRecentFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState(getInitialCurrency());
    const [exchangeRate, setExchangeRate] = useState(1);
    const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(res => res.json())
            .then(data => {
                setAvailableCurrencies(Object.keys(data.rates));
                if (currency !== 'USD') {
                    setExchangeRate(data.rates[currency] || 1);
                } else {
                    setExchangeRate(1);
                }
            })
            .catch(() => {
                setAvailableCurrencies(['USD']);
                setExchangeRate(1);
            });
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('userCurrency', currency);
    }, [currency]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/files/');
            const files = response.data;
            
            setStats({
                totalFiles: files.length,
                pendingFiles: files.filter(f => f.status === 'Pending' || f.status === 'Processing').length,
                completedFiles: files.filter(f => f.status === 'Completed').length,
                totalSpent: files.reduce((sum, f) => sum + parseFloat(f.total_cost || 0), 0)
            });
            
            // Get 5 most recent files
            setRecentFiles(files.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getInitialCurrency = () => {
        return localStorage.getItem('userCurrency') || 'USD';
    };

    const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }) => (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <FiTrendingUp size={12} />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`${bgColor} p-4 rounded-lg`}>
                    <Icon className={`${color} w-8 h-8`} />
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ icon: Icon, title, description, link, color, bgColor }) => (
        <Link to={link} className="group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-mint-green">
                <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`${color} w-6 h-6`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-mint-green to-teal-400 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Welcome back, {displayName}! 👋
                    </h1>
                    <p className="text-teal-50 text-lg">Here's what's happening with your transcriptions today.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        icon={HiOutlineDocumentText}
                        title="Total Files"
                        value={loading ? '...' : stats.totalFiles}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <StatCard 
                        icon={BiTimeFive}
                        title="In Progress"
                        value={loading ? '...' : stats.pendingFiles}
                        color="text-orange-600"
                        bgColor="bg-orange-50"
                    />
                    <StatCard 
                        icon={FiCheckCircle}
                        title="Completed"
                        value={loading ? '...' : stats.completedFiles}
                        color="text-green-600"
                        bgColor="bg-green-50"
                        trend="+12% this month"
                    />
                    <StatCard 
                        icon={FiDollarSign}
                        title="Total Spent"
                        value={loading ? '...' : `${currency} ${(stats.totalSpent * exchangeRate).toFixed(2)}`}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickActionCard 
                            icon={FiUpload}
                            title="Upload Files"
                            description="Upload new audio files for transcription"
                            link="/dashboard/upload"
                            color="text-mint-green"
                            bgColor="bg-teal-50"
                        />
                        <QuickActionCard 
                            icon={FiFileText}
                            title="My Files"
                            description="View and manage your transcription files"
                            link="/dashboard/files"
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <QuickActionCard 
                            icon={FiClock}
                            title="Recent Activity"
                            description="Check your recent transcription activity"
                            link="/dashboard/notifications"
                            color="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                    </div>
                </div>

                {/* Recent Files */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Recent Transcriptions</h2>
                        <Link to="/dashboard/files" className="text-mint-green hover:text-teal-600 text-sm font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                Loading...
                            </div>
                        ) : recentFiles.length > 0 ? (
                            recentFiles.map((file) => (
                                <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <HiOutlineDocumentText className="text-gray-600 w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(file.uploaded_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                file.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                file.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                file.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {file.status}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {currency} {(file.total_cost * exchangeRate).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <HiOutlineDocumentText className="mx-auto text-gray-300 w-12 h-12 mb-4" />
                                <p className="text-gray-500 mb-4">No transcriptions yet</p>
                                <Link 
                                    to="/dashboard/upload" 
                                    className="inline-flex items-center gap-2 bg-mint-green text-white px-6 py-2 rounded-lg hover:bg-teal-500 transition-colors"
                                >
                                    <FiUpload /> Upload Your First File
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
