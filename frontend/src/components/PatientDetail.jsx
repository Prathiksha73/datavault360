import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiClock, FiActivity, FiDownload, FiCheck } from 'react-icons/fi';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [showVisitModal, setShowVisitModal] = useState(false);

    // Lab Prescriptions
    const [labs, setLabs] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [showLabModal, setShowLabModal] = useState(false);
    const [selectedLabs, setSelectedLabs] = useState([]);
    const [labTestNames, setLabTestNames] = useState('');

    // Visit Form
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Need endpoint to get single patient or filter
            // Assuming /patients/id/ works if ViewSet logic IsAuthenticated
            const patRes = await api.get(`patients/${id}/`);
            setPatient(patRes.data);

            const visitRes = await api.get('visits/');
            // Filter visits for this patient
            // Ideally backend filters, but VisitViewSet returns all for doctor? 
            // VisitViewSet.get_queryset: "return Visit.objects.filter(doctor__user=user)"
            // So we need to filter client side for specific patient or add query param
            const doctorVisits = visitRes.data;
            setVisits(doctorVisits.filter(v => v.patient === parseInt(id)));

            // Fetch Labs
            const labsRes = await api.get('labs/');
            setLabs(labsRes.data);

            // Fetch Lab Requests for this patient
            // LabTestRequestViewSet returns all for doctor, need to filter by patient
            const labReqRes = await api.get('lab-tests/');
            // Client side filter
            setLabRequests(labReqRes.data.filter(r => r.patient === parseInt(id)));

        } catch (error) {
            toast.error('Failed to load details');
        }
    };

    const handlePrescribeTests = async (e) => {
        e.preventDefault();
        if (selectedLabs.length === 0) {
            toast.error('Please select at least one lab');
            return;
        }
        if (!labTestNames.trim()) {
            toast.error('Please enter test names');
            return;
        }

        try {
            // Create request for each selected lab
            // Promise.all to handle multiple requests
            const promises = selectedLabs.map(labId =>
                api.post('lab-tests/', {
                    patient: id,
                    lab: labId,
                    test_names: labTestNames
                })
            );

            await Promise.all(promises);

            toast.success('Tests prescribed successfully');
            setShowLabModal(false);
            setSelectedLabs([]);
            setLabTestNames('');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to prescribe tests');
        }
    };

    const toggleLabSelection = (labId) => {
        setSelectedLabs(prev =>
            prev.includes(labId) ? prev.filter(id => id !== labId) : [...prev, labId]
        );
    };
    const handleAddVisit = async (e) => {
        e.preventDefault();
        try {
            await api.post('visits/', {
                patient: id,
                diagnosis,
                prescription
            });
            toast.success('Visit/Prescription Added');
            setShowVisitModal(false);
            setDiagnosis(''); setPrescription('');
            fetchData();
        } catch (error) {
            toast.error('Failed to add visit');
        }
    };

    if (!patient) return <Layout role="DOCTOR"><div>Loading...</div></Layout>;

    return (
        <Layout role="DOCTOR">
            <button onClick={() => navigate('/doctor')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.user.username}</h1>
                        <div className="flex space-x-6 text-sm text-gray-500">
                            <p>DOB: <span className="font-medium text-gray-800">{patient.date_of_birth}</span></p>
                            <p>Phone: <span className="font-medium text-gray-800">{patient.phone_number}</span></p>
                            <p className="max-w-xs truncate">Address: <span className="font-medium text-gray-800">{patient.address}</span></p>
                        </div>
                        {/* Disclaimer: Password display as per requirement */}
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg inline-block text-xs text-yellow-800">
                            <strong>Logins:</strong> User: {patient.user.username} | Pass: (Hidden for Security)
                        </div>
                    </div>
                    <button
                        onClick={() => setShowVisitModal(true)}
                        className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transform hover:-translate-y-1 transition-all"
                    >
                        <FiPlus className="mr-2" /> Add Prescription
                    </button>
                    <button
                        onClick={() => setShowLabModal(true)}
                        className="mt-4 md:mt-0 ml-4 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all"
                    >
                        <FiActivity className="mr-2" /> Prescribe Tests
                    </button>
                </div>
            </div>

            {/* Assigned Doctors Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Doctors</h3>
                <div className="flex flex-wrap gap-4">
                    {patient.doctors && patient.doctors.length > 0 ? (
                        patient.doctors.map(doc => (
                            <div key={doc.id} className="flex items-center space-x-3 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
                                <div className="p-2 bg-white rounded-full text-indigo-600">
                                    <FiActivity />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">
                                        Dr. {doc.user.first_name ? `${doc.user.first_name} ${doc.user.last_name}` : doc.user.username}
                                    </p>
                                    <p className="text-xs text-gray-500">{doc.specialization}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No doctors assigned.</p>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FiClock className="mr-2" /> Visit History</h2>
            <div className="space-y-4">
                {visits.length === 0 ? (
                    <p className="text-gray-500 italic">No visits recorded yet.</p>
                ) : (
                    visits.map((visit) => (
                        <div key={visit.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{new Date(visit.visit_date).toLocaleDateString()}</span>
                                    <span className="text-sm text-gray-400 ml-2">{new Date(visit.visit_date).toLocaleTimeString()}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">Dr. {visit.doctor_name}</span>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Diagnosis</h4>
                                <p className="text-gray-800">{visit.diagnosis}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Prescription</h4>
                                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm text-gray-800 border border-gray-200">
                                    {visit.prescription}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-12 mb-6 flex items-center"><FiActivity className="mr-2" /> Lab Reports & Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labRequests.length === 0 ? (
                    <p className="text-gray-500 italic col-span-full">No tests prescribed.</p>
                ) : (
                    labRequests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{req.lab_name}</h4>
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
                                    Awaiting Report
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Visit Modal */}
            {showVisitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6">Add Prescription / Visit Details</h2>
                        <form onSubmit={handleAddVisit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                <textarea className="w-full p-3 border rounded-lg h-24" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required placeholder="Enter diagnosis details..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                                <textarea className="w-full p-3 border rounded-lg h-32 font-mono" value={prescription} onChange={e => setPrescription(e.target.value)} required placeholder="Rx..."></textarea>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setShowVisitModal(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Prescribe Tests Modal */}
            {showLabModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Prescribe Lab Tests</h2>
                        <form onSubmit={handlePrescribeTests} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Labs (Multi-select)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {labs.map(lab => (
                                        <button
                                            key={lab.id}
                                            type="button"
                                            onClick={() => toggleLabSelection(lab.id)}
                                            className={`p-4 rounded-xl border text-sm font-medium transition-all relative
                                                ${selectedLabs.includes(lab.id)
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-offset-2 shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {lab.name}
                                            {selectedLabs.includes(lab.id) && (
                                                <div className="absolute top-2 right-2 text-blue-500"><FiCheck /></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {selectedLabs.length === 0 && <p className="text-xs text-red-500 mt-2">Select at least one lab.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Names / Instructions</label>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                    rows="3"
                                    value={labTestNames}
                                    onChange={e => setLabTestNames(e.target.value)}
                                    required
                                    placeholder="e.g. CBC, Lipid Profile, Chest X-Ray..."
                                ></textarea>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowLabModal(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30">Prescribe</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PatientDetail;
