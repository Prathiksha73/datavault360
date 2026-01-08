import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiUser, FiActivity } from 'react-icons/fi';

const OrgDashboard = () => {
    const [activeTab, setActiveTab] = useState('doctors');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Form States
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState('');

    // Patient Form States
    const [patientForm, setPatientForm] = useState({
        username: '',
        password: '',
        date_of_birth: '',
        phone_number: '',
        address: '',
        doctor_id: ''
    });
    const [newUser, setNewUser] = useState(null); // To show creds

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'doctors') {
                const res = await api.get('doctors/');
                setDoctors(res.data);
            } else {
                const patRes = await api.get('patients/');
                setPatients(patRes.data);
                // Also fetch doctors for the assignment dropdown
                const docRes = await api.get('doctors/');
                setDoctors(docRes.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('doctors/', { username, password, specialization });
            toast.success('Doctor Created Successfully!');
            setShowModal(false);
            fetchData();
            setUsername(''); setPassword(''); setSpecialization('');
        } catch (error) {
            toast.error('Failed to create doctor');
        }
    };

    // Note: Patient creation for Org is similar? Requirement says "Organization... can create any new patient or doctor".
    // I'll implement Patient creation in future or now. Let's stick to Doctor creation focus for Org first as per "Org profile... doctors and patients pages".
    // I'll reuse the modal or create another one. For simplicity, just Doctor creation here for now.

    const handleCreatePatient = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (patientForm.password.length < 4) {
            toast.error('Password must be at least 4 characters');
            return;
        }
        if (patientForm.date_of_birth) {
            const year = new Date(patientForm.date_of_birth).getFullYear();
            const currentYear = new Date().getFullYear();
            if (year > currentYear || year < 1900) {
                toast.error('Please enter a valid Date of Birth');
                return;
            }
        }

        try {
            await api.post('patients/', patientForm);
            setNewUser({ username: patientForm.username, password: patientForm.password });
            toast.success('Patient Created Successfully!');
            setShowModal(false);
            fetchData();
            setPatientForm({ username: '', password: '', date_of_birth: '', phone_number: '', address: '', doctor_id: '' });
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const msgs = Object.values(error.response.data).flat().join(', ');
                toast.error(`Failed to create patient: ${msgs}`);
            } else {
                toast.error('Failed to create patient. Username may be taken.');
            }
        }
    };

    const handleAssignDoctor = async (patientId, doctorId) => {
        try {
            await api.patch(`patients/${patientId}/`, { doctor_id: doctorId });
            toast.success('Doctor Assigned Successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to assign doctor');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`${type}/${id}/`);
            toast.success('Deleted Successfully');
            fetchData();
        } catch (error) {
            toast.error('Delete Failed');
        }
    };

    return (
        <Layout role="ADMIN">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Organization Dashboard</h1>
                    <p className="text-gray-500">Manage your medical staff and patient records</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                >
                    <FiPlus className="mr-2" />
                    Create New {activeTab === 'doctors' ? 'Doctor' : 'Patient'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
                {['doctors', 'patients'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {activeTab === 'doctors' ? doctors.map(doc => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <FiActivity size={24} />
                                </div>
                                <button onClick={() => handleDelete(doc.id, 'doctors')} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Dr. {doc.user.username}</h3>
                            <p className="text-sm text-gray-500">{doc.specialization || 'General Physician'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm">
                                <span className="text-gray-500">Patients: {doc.patient_count || 0}</span> {/* need to add count in serializer if needed */}
                                <button className="text-indigo-600 font-medium hover:underline">View Details</button>
                            </div>
                        </motion.div>
                    )) : patients.map(pat => (
                        <motion.div
                            key={pat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                                    <FiUser size={24} />
                                </div>
                                <button onClick={() => handleDelete(pat.id, 'patients')} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{pat.user.username}</h3>
                            <p className="text-sm text-gray-500">DOB: {pat.date_of_birth}</p>
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                    Assigned to:
                                </span>
                                <select
                                    className="ml-2 p-1 border rounded text-sm w-full mt-2"
                                    value={pat.doctor?.id || ''}
                                    onChange={(e) => handleAssignDoctor(pat.id, e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.user.username} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">Create New {activeTab === 'doctors' ? 'Doctor' : 'Patient'}</h2>

                        {activeTab === 'doctors' ? (
                            <form onSubmit={handleCreateDoctor} className="space-y-4">
                                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border rounded-lg" required />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
                                <input type="text" placeholder="Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full p-3 border rounded-lg" />
                                <div className="flex space-x-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Create</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreatePatient} className="space-y-4">
                                <input type="text" placeholder="Username" value={patientForm.username} onChange={e => setPatientForm({ ...patientForm, username: e.target.value })} className="w-full p-3 border rounded-lg" required />
                                <input type="password" placeholder="Password" value={patientForm.password} onChange={e => setPatientForm({ ...patientForm, password: e.target.value })} className="w-full p-3 border rounded-lg" required />
                                <input type="date" placeholder="Date of Birth" value={patientForm.date_of_birth} onChange={e => setPatientForm({ ...patientForm, date_of_birth: e.target.value })} className="w-full p-3 border rounded-lg" />
                                <input type="text" placeholder="Phone Number" value={patientForm.phone_number} onChange={e => setPatientForm({ ...patientForm, phone_number: e.target.value })} className="w-full p-3 border rounded-lg" />
                                <textarea placeholder="Address" value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })} className="w-full p-3 border rounded-lg" rows="2"></textarea>

                                <select
                                    value={patientForm.doctor_id}
                                    onChange={e => setPatientForm({ ...patientForm, doctor_id: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    <option value="">Assign Doctor (Optional)</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.user.username}</option>
                                    ))}
                                </select>

                                <div className="flex space-x-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Create</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Creds Modal */}
            {newUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
                        <p className="mb-4">Please share these credentials with the patient:</p>
                        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left font-mono">
                            <p>Username: <strong>{newUser.username}</strong></p>
                            <p>Password: <strong>{newUser.password}</strong></p>
                        </div>
                        <button onClick={() => setNewUser(null)} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Done</button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default OrgDashboard;