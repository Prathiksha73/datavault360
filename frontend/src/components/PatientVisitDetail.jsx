import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';

const PatientVisitDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [visit, setVisit] = useState(null);

    useEffect(() => {
        fetchVisit();
    }, [id]);

    const fetchVisit = async () => {
        try {
            const res = await api.get(`visits/${id}/`);
            setVisit(res.data);
        } catch (error) {
            toast.error('Failed to load visit details');
            navigate('/patient');
        }
    };

    if (!visit) return <Layout role="PATIENT"><div>Loading...</div></Layout>;

    return (
        <Layout role="PATIENT">
            <button onClick={() => navigate('/patient')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <FiArrowLeft className="mr-2" /> Back to History
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-3xl mx-auto">
                <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Medical Prescription</h1>
                        <p className="opacity-80 text-sm mt-1">Visit Date: {new Date(visit.visit_date).toLocaleDateString()}</p>
                    </div>
                    <FiPrinter className="text-2xl opacity-70 cursor-pointer hover:opacity-100" onClick={() => window.print()} title="Print" />
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex justify-between pb-6 border-b border-gray-100">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Doctor</h3>
                            <p className="font-medium text-lg text-gray-800">Dr. {visit.doctor_name}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Patient</h3>
                            <p className="font-medium text-lg text-gray-800">{visit.patient_name}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Diagnosis</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-800 leading-relaxed border border-gray-100">
                            {visit.diagnosis}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Rx / Prescription</h3>
                        <div className="bg-indigo-50 p-6 rounded-lg text-gray-800 font-mono leading-relaxed border border-indigo-100 relative">
                            <div className="absolute top-4 right-4 text-indigo-200 text-4xl leading-none select-none">Rx</div>
                            {visit.prescription}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">DataVault360 Secure Medical Record</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PatientVisitDetail;
