import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiClock, FiFileText, FiActivity, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
    const [visits, setVisits] = useState([]);
    const [labRequests, setLabRequests] = useState([]);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await api.get('visits/');
            // Backend should already filter self visits for PATIENT role
            setVisits(res.data);

            // Fetch Lab Requests
            const labRes = await api.get('lab-tests/');
            setLabRequests(labRes.data);
        } catch (error) {
            toast.error('Failed to load history');
        }
    };

    return (
        <Layout role="PATIENT">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Medical History</h1>
            <p className="text-gray-500 mb-8">History of your visits and prescriptions</p>

            {visits.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <FiClock className="mx-auto text-gray-300 text-6xl mb-4" />
                    <h3 className="text-xl font-medium text-gray-800">No visits recorded</h3>
                    <p className="text-gray-500">Your visit history will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visits.map(visit => (
                        <motion.div
                            key={visit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <FiFileText size={24} />
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {new Date(visit.visit_date).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Dr. {visit.doctor_name || 'Unknown'}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{visit.diagnosis}</p>

                            <Link to={`/patient/visit/${visit.id}`} className="block w-full py-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                View Prescription & Details
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

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
        </Layout>
    );
};

export default PatientDashboard;
