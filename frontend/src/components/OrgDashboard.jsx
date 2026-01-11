
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiUser, FiActivity, FiPieChart } from 'react-icons/fi';
import InsightsTab from './InsightsTab';

const OrgDashboard = () => {
    const [activeTab, setActiveTab] = useState('doctors');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [labs, setLabs] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Lab specific auth states (since Doc/Pat uses email now)
    const [labUsername, setLabUsername] = useState('');
    const [labPassword, setLabPassword] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [inviteLink, setInviteLink] = useState(null); // To show link after invite

    // Lab Form
    const [labName, setLabName] = useState('');
    const [labAddress, setLabAddress] = useState('');

    // Room Form
    const [roomForm, setRoomForm] = useState({
        room_number: '',
        room_type: 'GENERAL',
        speciality: ''
    });

    // Patient Form States
    const [patientForm, setPatientForm] = useState({
        email: '',
        date_of_birth: '',
        phone_number: '',
        address: '',
        doctor_id: ''
    });
    const [createdLabUser, setCreatedLabUser] = useState(null); // For Lab creds

    // Assignment Edit State
    const [activePatient, setActivePatient] = useState(null);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    // Doctor Details State
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [showDoctorModal, setShowDoctorModal] = useState(false);

    // Room Details State
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
    const [admitPatientId, setAdmitPatientId] = useState('');
    const [dischargeTime, setDischargeTime] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'doctors') {
                const res = await api.get('doctors/');
                setDoctors(res.data);
            } else if (activeTab === 'patients') {
                const patRes = await api.get('patients/');
                setPatients(patRes.data);
                // Also fetch doctors for the assignment dropdown
                const docRes = await api.get('doctors/');
                setDoctors(docRes.data);
            } else if (activeTab === 'labs') {
                const labRes = await api.get('labs/');
                setLabs(labRes.data);
            } else if (activeTab === 'rooms') {
                const roomRes = await api.get('rooms/');
                setRooms(roomRes.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        }
    };

    const handleInviteDoctor = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('invitations/', {
                email,
                role: 'DOCTOR',
                extra_data: { specialization }
            });
            toast.success('Invitation Sent Successfully!');
            setInviteLink(res.data.link);
            setShowModal(false);
            setEmail(''); setSpecialization('');
        } catch (error) {
            toast.error('Failed to send invitation');
        }
    };

    const handleCreateLab = async (e) => {
        e.preventDefault();
        try {
            await api.post('labs/', {
                name: labName,
                address: labAddress,
                username: labUsername,
                password: labPassword
            });
            toast.success('Lab Created Successfully!');
            setCreatedLabUser({ username: labUsername, password: labPassword });
            setShowModal(false);
            fetchData();
            setLabUsername(''); setLabPassword(''); setLabName(''); setLabAddress('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create Lab');
        }
    };

    // Note: Patient creation for Org is similar? Requirement says "Organization... can create any new patient or doctor".
    // I'll implement Patient creation in future or now. Let's stick to Doctor creation focus for Org first as per "Org profile... doctors and patients pages".
    // I'll reuse the modal or create another one. For simplicity, just Doctor creation here for now.

    const handleCreatePatient = async (e) => {
        e.preventDefault();

        if (patientForm.phone_number.length < 5) {
            toast.error('Invalid phone number');
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
            const res = await api.post('invitations/', {
                email: patientForm.email,
                role: 'PATIENT',
                extra_data: {
                    date_of_birth: patientForm.date_of_birth,
                    phone_number: patientForm.phone_number,
                    address: patientForm.address,
                    doctor_id: patientForm.doctor_id
                }
            });
            toast.success('Patient Invitation Sent!');
            setInviteLink(res.data.link);
            setShowModal(false);
            setPatientForm({ email: '', date_of_birth: '', phone_number: '', address: '', doctor_id: '' });
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const msgs = Object.values(error.response.data).flat().join(', ');
                toast.error(`Failed to create patient: ${msgs} `);
            } else {
                toast.error('Failed to create patient. Username may be taken.');
            }
        }
    };

    const handleEditAssignments = (patient) => {
        setActivePatient(patient);
        const currentDocIds = patient.doctors ? patient.doctors.map(d => d.id) : [];
        setSelectedDoctors(currentDocIds);
        setShowAssignmentModal(true);
    };

    const handleSaveAssignments = async () => {
        try {
            await api.patch(`patients/${activePatient.id}/`, { doctor_ids: selectedDoctors });
            toast.success('Assignments Updated Successfully');
            setShowAssignmentModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update assignments');
        }
    };

    const handleViewDoctorDetails = (doc) => {
        // Find patients assigned to this doctor
        const assignedPatients = patients.filter(p => p.doctors.some(d => d.id === doc.id));
        setSelectedDoctor({ ...doc, assignedPatients });
        setShowDoctorModal(true);
    };

    const toggleDoctorSelection = (docId) => {
        if (selectedDoctors.includes(docId)) {
            setSelectedDoctors(selectedDoctors.filter(id => id !== docId));
        } else {
            setSelectedDoctors([...selectedDoctors, docId]);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('rooms/', roomForm);
            toast.success('Room Created Successfully!');
            fetchData();
            setShowModal(false);
            setRoomForm({ room_number: '', room_type: 'GENERAL', speciality: '' });
        } catch (error) {
            toast.error('Failed to create room. Number may be duplicate.');
        }
    };

    const handleViewRoomDetails = (room) => {
        setSelectedRoom(room);
        setAdmitPatientId('');
        setDischargeTime('');
        setShowRoomDetailsModal(true);
    };

    const handleAdmitPatient = async (e) => {
        e.preventDefault();
        if (!admitPatientId) {
            toast.error('Please select a patient');
            return;
        }
        try {
            await api.post(`rooms/${selectedRoom.id}/admit/`, { patient_id: admitPatientId });
            toast.success('Patient Admitted!');
            setShowRoomDetailsModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Admit failed');
        }
    };

    const handleDischargePatient = async (e) => {
        e.preventDefault();
        if (!dischargeTime) {
            toast.error('Please select discharge time');
            return;
        }
        try {
            await api.post(`rooms/${selectedRoom.id}/discharge/`, { discharge_time: dischargeTime });
            toast.success('Discharge Scheduled!');
            setShowRoomDetailsModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Discharge failed');
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

                {activeTab !== 'insights' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                    >
                        <FiPlus className="mr-2" />
                        Create New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'patients' ? 'Patient' : activeTab === 'labs' ? 'Lab' : 'Room'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
                {['doctors', 'patients', 'labs', 'rooms', 'insights'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'insights' && <FiPieChart className="mr-2" />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {activeTab === 'doctors' && doctors.map(doc => (
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
                            <h3 className="text-lg font-bold text-gray-800">
                                Dr. {doc.user.first_name && doc.user.last_name ? `${doc.user.first_name} ${doc.user.last_name}` : doc.user.username}
                            </h3>
                            <p className="text-sm text-gray-500">{doc.specialization || 'General Physician'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm">
                                <span className="text-gray-500">Patients: {patients.filter(p => p.doctors && p.doctors.some(d => d.id === doc.id)).length}</span>
                                <button onClick={() => handleViewDoctorDetails(doc)} className="text-indigo-600 font-medium hover:underline">View Details</button>
                            </div>
                        </motion.div>
                    ))}

                    {activeTab === 'patients' && patients.map(pat => (
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
                            <h3 className="text-lg font-bold text-gray-800">
                                {pat.user.first_name && pat.user.last_name ? `${pat.user.first_name} ${pat.user.last_name}` : pat.user.username}
                            </h3>
                            <p className="text-sm text-gray-500">DOB: {pat.date_of_birth}</p>

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                    Assigned Doctors:
                                </span>
                                <button
                                    onClick={() => handleEditAssignments(pat)}
                                    className="text-xs text-indigo-600 font-bold hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {pat.doctors && pat.doctors.length > 0 ? (
                                    pat.doctors.map(d => (
                                        <span key={d.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
                                            Dr. {d.user.first_name ? `${d.user.first_name} ${d.user.last_name}` : d.user.username}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50 mt-2">
                                <span className="font-semibold text-gray-600">Assigned Room:</span>
                                {pat.assigned_room ? (
                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                        Room {pat.assigned_room.room_number}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 italic">Not Admitted</span>
                                )}
                            </div>

                        </motion.div>
                    ))}

                    {activeTab === 'labs' && labs.map(lab => (
                        <motion.div
                            key={lab.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                                    <FiActivity size={24} />
                                </div>
                                <button onClick={() => handleDelete(lab.id, 'labs')} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{lab.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">@{lab.user.username}</p>
                            <p className="text-sm text-gray-600">{lab.address}</p>
                        </motion.div>
                    ))}

                    {activeTab === 'rooms' && rooms.map(room => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-full ${room.patient ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <FiActivity size={24} />
                                </div>
                                <button onClick={() => handleDelete(room.id, 'rooms')} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Room {room.room_number}</h3>
                            <p className="text-sm text-gray-500">{room.room_type} - {room.speciality || 'General'}</p>

                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <p className={`text-sm font-semibold mb-2 ${room.patient ? 'text-red-500' : 'text-green-500'}`}>
                                    {room.patient ? 'Occupied' : 'Available'}
                                </p>
                                {room.patient && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Patient: <span className="font-medium">{room.patient_details?.name || 'Unknown'}</span>
                                    </p>
                                )}
                                <button
                                    onClick={() => handleViewRoomDetails(room)}
                                    className="text-sm text-indigo-600 font-medium hover:underline w-full text-left"
                                >
                                    View Details & Manage
                                </button>
                            </div>
                        </motion.div>
                    ))}


                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3"
                        >
                            <InsightsTab />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-6">
                                Create New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'patients' ? 'Patient' : activeTab === 'labs' ? 'Lab' : 'Room'}
                            </h2>

                            {activeTab === 'doctors' ? (
                                <form onSubmit={handleInviteDoctor} className="space-y-4">
                                    <p className="text-sm text-gray-500 mb-2">Send an invitation link to the doctor.</p>
                                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
                                    <input type="text" placeholder="Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full p-3 border rounded-lg" />
                                    <div className="flex space-x-3 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Send Invite</button>
                                    </div>
                                </form>
                            ) : activeTab === 'patients' ? (
                                <form onSubmit={handleCreatePatient} className="space-y-4">
                                    <p className="text-sm text-gray-500 mb-2">Send an invitation link to the patient.</p>
                                    <input type="email" placeholder="Email Address" value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
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
                                            <option key={d.id} value={d.id}>
                                                Dr. {d.user.first_name ? `${d.user.first_name} ${d.user.last_name}` : d.user.username}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex space-x-3 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Create</button>
                                    </div>
                                </form>
                            ) : activeTab === 'rooms' ? (
                                <form onSubmit={handleCreateRoom} className="space-y-4">
                                    <input type="text" placeholder="Room Number (e.g. 101)" value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} className="w-full p-3 border rounded-lg" required />
                                    <select
                                        value={roomForm.room_type}
                                        onChange={e => setRoomForm({ ...roomForm, room_type: e.target.value })}
                                        className="w-full p-3 border rounded-lg"
                                    >
                                        <option value="GENERAL">General Ward</option>
                                        <option value="ICU">ICU</option>
                                        <option value="PRIVATE">Private Room</option>
                                        <option value="SEMI">Semi-Private Room</option>
                                    </select>
                                    <input type="text" placeholder="Speciality (Optional)" value={roomForm.speciality} onChange={e => setRoomForm({ ...roomForm, speciality: e.target.value })} className="w-full p-3 border rounded-lg" />

                                    <div className="flex space-x-3 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Create Room</button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateLab} className="space-y-4">
                                    <input type="text" placeholder="Lab Name (e.g. XRay Lab)" value={labName} onChange={e => setLabName(e.target.value)} className="w-full p-3 border rounded-lg" required />
                                    <input type="text" placeholder="Address" value={labAddress} onChange={e => setLabAddress(e.target.value)} className="w-full p-3 border rounded-lg" />
                                    <hr className="border-gray-100" />
                                    <p className="text-sm font-bold text-gray-500 uppercase">Login Credentials</p>
                                    <input type="text" placeholder="Username" value={labUsername} onChange={e => setLabUsername(e.target.value)} className="w-full p-3 border rounded-lg" required />
                                    <input type="password" placeholder="Password" value={labPassword} onChange={e => setLabPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />

                                    <div className="flex space-x-3 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Create Lab</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Invitation Link Modal */}
            {
                inviteLink && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-lg text-center">
                            <h2 className="text-2xl font-bold text-green-600 mb-4">Invitation Sent!</h2>
                            <p className="mb-4 text-gray-600">The user has been emailed. Here is the backup link:</p>
                            <div className="bg-gray-100 p-4 rounded-lg mb-6 break-all border border-gray-200 text-sm font-mono text-gray-800">
                                {inviteLink}
                            </div>
                            <button onClick={() => setInviteLink(null)} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Done</button>
                        </div>
                    </div>
                )
            }

            {/* Lab Creds Modal */}
            {
                createdLabUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center">
                            <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
                            <p className="mb-4">Lab Created. Share these credentials:</p>
                            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left font-mono">
                                <p>Username: <strong>{createdLabUser.username}</strong></p>
                                <p>Password: <strong>{createdLabUser.password}</strong></p>
                            </div>
                            <button onClick={() => setCreatedLabUser(null)} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Done</button>
                        </div>
                    </div>
                )
            }
            {/* Assignment Modal */}
            {
                showAssignmentModal && activePatient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Manage Assigned Doctors</h2>
                            <p className="text-sm text-gray-500 mb-4">Select doctors for {activePatient.user.username}</p>

                            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleDoctorSelection(doc.id)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDoctors.includes(doc.id)}
                                            onChange={() => { }} // Handled by div click
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Dr. {doc.user.first_name ? `${doc.user.first_name} ${doc.user.last_name}` : doc.user.username}
                                            </p>
                                            <p className="text-xs text-gray-500">{doc.specialization}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-3">
                                <button onClick={() => setShowAssignmentModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleSaveAssignments} className="flex-1 py-2 text-white bg-indigo-600 rounded-lg">Save Assignments</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Doctor Details Modal */}
            {
                showDoctorModal && selectedDoctor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Doctor Details</h2>
                                <button onClick={() => setShowDoctorModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                            </div>

                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mr-4">
                                    {selectedDoctor.user.first_name ? selectedDoctor.user.first_name[0] : selectedDoctor.user.username[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Dr. {selectedDoctor.user.first_name && selectedDoctor.user.last_name ? `${selectedDoctor.user.first_name} ${selectedDoctor.user.last_name}` : selectedDoctor.user.username}
                                    </h3>
                                    <p className="text-gray-500">{selectedDoctor.specialization || 'General Physician'}</p>
                                    <p className="text-sm text-gray-400">@{selectedDoctor.user.username}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-700 mb-3">Assigned Patients ({selectedDoctor.assignedPatients.length})</h3>
                            <div className="space-y-2 mb-6">
                                {selectedDoctor.assignedPatients.length > 0 ? (
                                    selectedDoctor.assignedPatients.map(pat => (
                                        <div key={pat.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                            <span className="font-medium text-gray-800">
                                                {pat.user.first_name && pat.user.last_name ? `${pat.user.first_name} ${pat.user.last_name}` : pat.user.username}
                                            </span>
                                            <span className="text-xs text-gray-500">DOB: {pat.date_of_birth}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No patients assigned.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Room Details Modal */}
            {
                showRoomDetailsModal && selectedRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Room {selectedRoom.room_number} Details</h2>
                                <button onClick={() => setShowRoomDetailsModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Type</p>
                                <p className="text-lg font-bold text-gray-800 mb-2">{selectedRoom.room_type}</p>
                                <p className="text-sm font-semibold text-gray-500 uppercase">Speciality</p>
                                <p className="text-lg font-bold text-gray-800">{selectedRoom.speciality || 'General'}</p>
                            </div>

                            {selectedRoom.patient ? (
                                <div className="border-t pt-4">
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4">Occupied</span>

                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500">Current Patient</p>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {selectedRoom.patient_details?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">ID: {selectedRoom.patient_details?.id}</p>
                                    </div>

                                    <form onSubmit={handleDischargePatient} className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">Schedule Discharge</label>
                                        <input
                                            type="datetime-local"
                                            value={dischargeTime}
                                            onChange={(e) => setDischargeTime(e.target.value)}
                                            className="w-full p-3 border rounded-lg"
                                            required
                                        />
                                        {selectedRoom.scheduled_discharge && (
                                            <p className="text-xs text-orange-500">
                                                Currently scheduled for: {new Date(selectedRoom.scheduled_discharge).toLocaleString()}
                                            </p>
                                        )}
                                        <button type="submit" className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                            {selectedRoom.scheduled_discharge ? 'Update Discharge Time' : 'Schedule Discharge'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="border-t pt-4">
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold mb-4">Available</span>

                                    <form onSubmit={handleAdmitPatient} className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">Admit Patient</label>
                                        <select
                                            value={admitPatientId}
                                            onChange={(e) => setAdmitPatientId(e.target.value)}
                                            className="w-full p-3 border rounded-lg"
                                            required
                                        >
                                            <option value="">Select Patient</option>
                                            {patients
                                                .filter(p => !p.assigned_room) // Hide already assigned patients?
                                                // The backend prevents reassignment, but frontend filter is nicer. 
                                                // However, `p.assigned_room` might not be in the list view data unless serializer includes it.
                                                // I added assigned_room to PatientProfileSerializer. 
                                                // `fetchData` fetches `patients/` which uses `PatientProfileSerializer`.
                                                // So `p.assigned_room` should be available.
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.user.first_name ? `${p.user.first_name} ${p.user.last_name}` : p.user.username} (ID: {p.id})
                                                    </option>
                                                ))}
                                        </select>
                                        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                            Admit Patient
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

        </Layout >
    );
};

export default OrgDashboard;
