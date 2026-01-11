import React from 'react';
import Layout from './Layout';

const AboutUs = () => {
    // Determine role from local storage or context if needed for Layout, 
    // but Layout might need 'role' prop. 
    // Since About Us is public/common, we need to know valid role or make Layout handle no role?
    // User is logged in (otherwise they hit login).
    // Let's parse role from token or storage.
    const getRole = () => {
        const token = localStorage.getItem('access_token'); // basic check
        if (!token) return 'GUEST';
        // We'd ideally decode token. For now, let's assume if they are viewing this from dashboard, they have a role.
        // We can pass a generic role or try to detect.
        // Actually Layout uses 'role' prop to show correct links.
        // We might need to store role in localStorage on login.
        return localStorage.getItem('role') || 'PATIENT'; // Fallback
    };

    const role = getRole();

    return (
        <Layout role={role}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">About DataVault360</h1>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                        Welcome to <strong>DataVault360</strong>, a secure and comprehensive web-based data management system
                        designed to revolutionize how medical institutions manage patient records and doctor consultations.
                    </p>
                    <p>
                        Our mission is to provide a seamless, secure, and efficient platform for Organizations, Doctors, and Patients
                        to interact. We prioritize data security, ease of use, and accessibility, ensuring that critical medical
                        information is always available to those who need it, when they need it.
                    </p>
                    <h2 className="text-xl font-bold text-gray-800 mt-4">For Organizations</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Manage doctors and patients efficiently.</li>
                        <li>Monitor clinic activities and statistics.</li>
                        <li>Securely onboard new medical staff.</li>
                    </ul>
                    <h2 className="text-xl font-bold text-gray-800 mt-4">For Doctors</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Access patient history and records instantly.</li>
                        <li>Manage appointments and consultations.</li>
                        <li>Securely prescribe medication and diagnosis.</li>
                    </ul>
                    <h2 className="text-xl font-bold text-gray-800 mt-4">For Patients</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>View your own medical history and prescriptions.</li>
                        <li>Know your assigned doctor.</li>
                        <li>Secure and private access to your health data.</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default AboutUs;
