import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';

const PatientDoctor = () => {
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        // Since we don't have a direct "get my doctor" endpoint, we can infer it
        // Or fetch list of doctors (which filter for patient returns self-doctor)
        // Correct approach: GET /doctors/ and it should return the assigned doctor list (length 1)
        fetchDoctor();
    }, []);

    const fetchDoctor = async () => {
        try {
            const res = await api.get('doctors/');
            if (res.data.length > 0) {
                setDoctor(res.data[0]);
            }
        } catch (error) {
            toast.error('Failed to fetch doctor info');
        }
    };

    return (
        <Layout role="PATIENT">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Assigned Doctor</h1>
            {doctor ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                            <FiUser />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Dr. {doctor.user.username}</h2>
                            <p className="text-lg text-indigo-600 font-medium">{doctor.specialization || 'General Practitioner'}</p>
                            <div className="mt-4 space-y-2 text-gray-500">
                                <p>Email: {doctor.user.email || 'N/A'}</p>
                                <p className="text-xs">License ID: {doctor.id} (System ID)</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 bg-yellow-50 text-yellow-800 rounded-xl">
                    No doctor currently assigned.
                </div>
            )}
        </Layout>
    );
};

export default PatientDoctor;
