import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiHome, FiInfo, FiMail, FiUser } from 'react-icons/fi';

import { Toaster } from 'react-hot-toast';

const Layout = ({ children, role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 font-poppins">
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { zIndex: 9999 } }} />
            <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">DV</div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">DataVault360</span>
                </div>

                <div className="flex items-center space-x-8">
                    <Link to={`/${role.toLowerCase()}`} className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isActive(`/${role.toLowerCase()}`) ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                        <FiHome size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/about" className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <FiInfo size={18} />
                        <span>About Us</span>
                    </Link>
                    <Link to="/contact" className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <FiMail size={18} />
                        <span>Contact Us</span>
                    </Link>
                    {role === 'DOCTOR' && (
                        <Link to="/doctor/profile" className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isActive('/doctor/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                            <FiUser size={18} />
                            <span>Profile</span>
                        </Link>
                    )}
                    {role === 'PATIENT' && (
                        <Link to="/patient/profile" className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isActive('/patient/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                            <FiUser size={18} />
                            <span>Profile</span>
                        </Link>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                </button>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;