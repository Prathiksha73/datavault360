import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileMedicalAlt, FaUpload, FaUserInjured, FaUserMd, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const LabDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reportFile, setReportFile] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('lab-tests/');
            setRequests(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load test requests');
        }
    };

    const handleOpenUpload = (req) => {
        setSelectedRequest(req);
        setIsUploadModalOpen(true);
    };

    const handleCloseUpload = () => {
        setSelectedRequest(null);
        setReportFile(null);
        setIsUploadModalOpen(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedRequest || !reportFile) return;

        const formData = new FormData();
        formData.append('report_file', reportFile);
        formData.append('status', 'COMPLETED');

        try {
            await api.patch(`lab-tests/${selectedRequest.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Report uploaded successfully');
            fetchRequests();
            handleCloseUpload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload report');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <Toaster position="top-right" />

            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <FaFileMedicalAlt className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Lab Dashboard</h1>
                        <p className="text-slate-500">Manage test requests and reports</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        No test requests found.
                    </div>
                ) : requests.map((req) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">{req.patient_name}</h3>
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <FaUserInjured className="text-blue-400" /> Patient
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {req.status}
                            </span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-2">
                            <div className="text-sm text-slate-600">
                                <strong className="block text-slate-400 text-xs uppercase tracking-wide mb-1">Prescribed By</strong>
                                <div className="flex items-center gap-2">
                                    <FaUserMd className="text-slate-400" /> Dr. {req.doctor_name}
                                </div>
                            </div>
                            <div className="text-sm text-slate-600">
                                <strong className="block text-slate-400 text-xs uppercase tracking-wide mb-1">Tests Requested</strong>
                                <p className="bg-slate-50 p-2 rounded border border-slate-100">{req.test_names}</p>
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                <FaCalendarAlt /> {new Date(req.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {req.status !== 'COMPLETED' ? (
                            <button
                                onClick={() => handleOpenUpload(req)}
                                className="mt-auto w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaUpload /> Add Report
                            </button>
                        ) : (
                            <a
                                href={req.report_file}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-auto w-full bg-green-50 text-green-600 border border-green-200 py-2.5 rounded-xl font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-center"
                            >
                                View Report
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Upload Lab Report</h2>
                                <button onClick={handleCloseUpload} className="text-slate-400 hover:text-slate-600">
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select PDF Report
                                    </label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setReportFile(e.target.files[0])}
                                        required
                                        className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        "
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Upload & Complete
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabDashboard;
