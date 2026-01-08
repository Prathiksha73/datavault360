import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiPlus, FiUser, FiClipboard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Create Patient Form
    const [firstName, setFirstName] = useState(''); // Just use name for simplification or split
    const [newUser, setNewUser] = useState({ username: '', password: '' }); // Generated creds
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        date_of_birth: '',
        phone_number: '',
        address: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('patients/');
            setPatients(res.data);
        } catch (error) {
            toast.error('Failed to load patients');
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (formData.password.length < 4) {
            toast.error('Password must be at least 4 characters');
            return;
        }
        if (formData.date_of_birth) {
            const year = new Date(formData.date_of_birth).getFullYear();
            const currentYear = new Date().getFullYear();
            if (year > currentYear || year < 1900) {
                toast.error('Please enter a valid Date of Birth');
                return;
            }
        }

        try {
            const res = await api.post('patients/', formData);
            setNewUser({ username: formData.username, password: formData.password });
            toast.success('Patient Created!');
            setShowModal(false);
            fetchPatients();
            setFormData({ username: '', password: '', date_of_birth: '', phone_number: '', address: '' });
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const msgs = Object.values(error.response.data).flat().join(', ');
                toast.error(`Failed to create patient: ${msgs}`);
            } else {
                toast.error('Failed to create patient');
            }
        }
    };

    const copyCreds = () => {
        navigator.clipboard.writeText(`Username: ${newUser.username}\nPassword: ${newUser.password}`);
        toast.success('Copied to clipboard');
    };

    return (
        <Layout role="DOCTOR">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
                    <p className="text-gray-500">Manage your patients and consultations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                >
                    <FiPlus className="mr-2" />
                    Create New Patient
                </button>
            </div>

            {/* New User Creds Display */}
            {newUser.username && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl"
                >
                    <h3 className="text-lg font-bold text-green-800 mb-2">Patient Created Successfully!</h3>
                    <p className="text-green-700 mb-4">Please share these credentials with the patient:</p>
                    <div className="bg-white p-4 rounded-lg border border-green-100 font-mono text-sm mb-4">
                        <p>Username: <span className="font-bold">{newUser.username}</span></p>
                        <p>Password: <span className="font-bold">{newUser.password}</span></p>
                    </div>
                    <button onClick={copyCreds} className="text-indigo-600 font-medium hover:underline">Copy Credentials</button>
                    <button onClick={() => setNewUser({})} className="ml-4 text-gray-500 hover:text-gray-700">Dismiss</button>
                </motion.div>
            )}

            {patients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <FiUser className="mx-auto text-gray-300 text-6xl mb-4" />
                    <h3 className="text-xl font-medium text-gray-800">No patients yet</h3>
                    <p className="text-gray-500 mb-6">Start by creating a new patient record</p>
                    <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Create Patient</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {patients.map(patient => (
                            <motion.div
                                key={patient.id}
                                layout
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {patient.user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">{patient.user.username}</h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-500">
                                    <p>DOB: {patient.date_of_birth}</p>
                                    <p>Phone: {patient.phone_number}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                        <p>Username: {patient.username || patient.user.username}</p>
                                        {/* Password not available unless passed from create response or stored somewhere insecurely which we shouldn't. 
                                            Requirement says: "username and password provided which is different fot every patient... should also show in the view more option"
                                            We can't show password after creation unless we store it raw (Security Risk). 
                                            I will assume we only show it upon creation, or fetch it if stored (Bad practice). 
                                            For this demo, if requirement insists "show in view more", I might have to store it in Profile temporarily or just show 'Hidden'.
                                            I'll opt to strictly show only on Creation for security, but allow Reset.
                                            Wait, requirement: "patient login username and password should also show in the view more option on the card".
                                            Okay, I will store password in PatientProfile for this specific simplified requirement, but mark as insecure in comments.
                                        */}
                                    </div>
                                    <Link to={`/doctor/patient/${patient.id}`} className="flex items-center text-indigo-600 font-medium hover:text-indigo-700">
                                        View Details <FiClipboard className="ml-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Patient Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-bold mb-6">Create New Patient</h2>
                        <form onSubmit={handleCreatePatient} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full p-3 border rounded-lg" required />
                                <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border rounded-lg" required />
                            </div>
                            <input type="date" placeholder="Date of Birth" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <input type="text" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <textarea placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 border rounded-lg" rows="3"></textarea>

                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md">Create Patient</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </Layout>
    );
};

export default DoctorDashboard;