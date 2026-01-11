import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiUser, FiActivity, FiDownload } from 'react-icons/fi';

const PatientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [labRequests, setLabRequests] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // GET /patients/ should return self for PATIENT? 
            // My PatientViewSet logic: "user.role == PATIENT: return PatientProfile.objects.filter(user=user)"
            const res = await api.get('patients/');
            if (res.data.length > 0) {
                setProfile(res.data[0]);
            }

            // Fetch Lab Requests
            // LabTestRequestViewSet filters by user.role=PATIENT automatically
            const labRes = await api.get('lab-tests/');
            setLabRequests(labRes.data);

        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    // Also reusing for Doctor to view self profile?
    // DoctorProfile logic same.
    // I can make this generic but requirements said "Profile page... uneditable".

    if (!profile) return <Layout role="PATIENT"><div>Loading...</div></Layout>;

    return (
        <Layout role="PATIENT">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-2xl">
                        <FiUser />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {profile.user.first_name && profile.user.last_name ? `${profile.user.first_name} ${profile.user.last_name}` : profile.user.username}
                        </h2>
                        <p className="text-gray-500">Patient</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Date of Birth</label>
                        <p className="text-lg font-medium text-gray-800">{profile.date_of_birth}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                        <p className="text-lg font-medium text-gray-800">{profile.phone_number}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
                        <p className="text-lg font-medium text-gray-800">{profile.address}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Doctors</h3>
                <div className="flex flex-wrap gap-3">
                    {profile.doctors && profile.doctors.length > 0 ? (
                        profile.doctors.map((doc, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                                <div className="p-2 bg-white rounded-full text-indigo-600">
                                    <FiActivity size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">
                                        Dr. {doc.user.first_name ? `${doc.user.first_name} ${doc.user.last_name}` : doc.user.username}
                                    </p>
                                    <p className="text-xs text-gray-500">{doc.specialization}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No doctors assigned yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Room</h3>
                {profile.assigned_room ? (
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-full">
                            <FiActivity size={24} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Room {profile.assigned_room.room_number}</p>
                            <p className="text-sm text-gray-500">{profile.assigned_room.room_type} - {profile.assigned_room.speciality || 'General'}</p>
                            {profile.assigned_room.scheduled_discharge && (
                                <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 px-2 py-1 rounded w-fit">
                                    Discharge Scheduled: {new Date(profile.assigned_room.scheduled_discharge).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Not admitted to any room.</p>
                )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-12 mb-6 flex items-center"><FiActivity className="mr-2" /> My Lab Reports & Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labRequests.length === 0 ? (
                    <p className="text-gray-500 italic">No tests requested yet.</p>
                ) : (
                    labRequests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-800">{req.lab_name}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{req.lab_address}</p>
                                    <p className="text-xs text-gray-500">Dr. {req.doctor_name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Tests: {req.test_names}</p>

                            {req.status === 'COMPLETED' && req.report_file ? (
                                <a
                                    href={req.report_file}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-auto flex items-center justify-center w-full py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium border border-green-200"
                                >
                                    <FiDownload className="mr-2" /> Download Report
                                </a>
                            ) : (
                                <div className="mt-auto text-center text-sm text-gray-400 italic py-2">
                                    Awaiting Results
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Layout >
    );
};

export default PatientProfile;
