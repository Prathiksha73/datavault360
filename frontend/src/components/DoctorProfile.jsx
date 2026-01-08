import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiUser, FiBriefcase, FiMail, FiHash, FiShield } from 'react-icons/fi';

const DoctorProfile = () => {
    // We can fetch profile from /doctors/ (filtering for self) or maybe new endpoint.
    // Existing logic in DoctorDashboard used fetching patients.
    // Let's rely on /doctors/ returning own profile for Doctor role? 
    // In views.py DoctorViewSet: `elif user.role == User.Role.DOCTOR: return DoctorProfile.objects.filter(user=user)`
    // So GET /doctors/ should return list of 1 item which is me.

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('doctors/');
            if (res.data && res.data.length > 0) {
                setProfile(res.data[0]);
            }
        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    if (!profile) return (
        <Layout role="DOCTOR">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout role="DOCTOR">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto">
                <div className="bg-indigo-600 px-8 py-10 text-white text-center">
                    <div className="w-24 h-24 bg-white text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg">
                        {profile.user.username[0].toUpperCase()}
                    </div>
                    <h2 className="text-3xl font-bold">Dr. {profile.user.username}</h2>
                    <p className="opacity-90 mt-1 uppercase tracking-wide text-sm font-semibold">{profile.specialization || 'General Specialist'}</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <FiUser className="mr-2" />
                                <span className="text-sm font-medium">Username</span>
                            </div>
                            <p className="text-gray-800 font-semibold">{profile.user.username}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <FiBriefcase className="mr-2" />
                                <span className="text-sm font-medium">Specialization</span>
                            </div>
                            <p className="text-gray-800 font-semibold">{profile.specialization || 'Not Assigned'}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <FiHash className="mr-2" />
                                <span className="text-sm font-medium">System ID</span>
                            </div>
                            <p className="text-gray-800 font-semibold text-lg">{profile.id}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <FiShield className="mr-2" />
                                <span className="text-sm font-medium">Role</span>
                            </div>
                            <p className="text-gray-800 font-semibold">Doctor</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-gray-500 text-sm">
                            To update your profile details, please contact the Organization Administrator.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DoctorProfile;