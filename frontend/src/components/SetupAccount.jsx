import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FiUserCheck, FiLock, FiUser } from 'react-icons/fi';

const SetupAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Debug state
    const [inviteData, setInviteData] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Clear any existing session to prevent 401 interceptor loops
        localStorage.clear();

        const verifyToken = async () => {
            try {
                console.log("Verifying token:", token);
                const res = await api.get(`invitations/check/${token}/`);
                console.log("Token verified:", res.data);
                setInviteData(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Token verification failed:", error);
                setError(error.message || "Unknown Error");
                // toast.error('Invalid or expired invitation link');
                // navigate('/login'); // Disable redirect for debugging
                setLoading(false); // Make sure we stop loading to show error
            }
        };
        verifyToken();
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        if (formData.password.length < 4) {
            toast.error("Password must be at least 4 characters");
            return;
        }

        try {
            await api.post('invitations/complete/', {
                token: token,
                username: formData.username,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            });
            toast.success('Account setup complete! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to setup account');
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!inviteData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">No Invitation Data Loaded</h2>
                {error && <p className="text-gray-700 mt-2">Error: {error}</p>}
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-200 rounded">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FiUserCheck />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome to DataVault360</h1>
                    <p className="text-gray-500 mt-2">
                        You've been invited as a <span className="font-semibold text-indigo-600">{inviteData.role}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{inviteData.email}</p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choose Username</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Set Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Complete Setup
                    </button>
                </form >
            </div >
        </div >
    );
};

export default SetupAccount;
