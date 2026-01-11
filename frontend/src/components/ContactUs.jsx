import React, { useState } from 'react';
import Layout from './Layout';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const ContactUs = () => {
    const role = localStorage.getItem('role') || 'PATIENT'; // Fallback
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        toast.success('Message sent successfully! We will get back to you properly.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <Layout role={role}>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Us</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
                            <p className="text-indigo-100 mb-8">
                                Have a question or feedback? We'd love to hear from you. Fill out the form or reach us via other channels.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <FiPhone className="text-indigo-300 text-xl" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <FiMail className="text-indigo-300 text-xl" />
                                    <span>support@datavault360.com</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <FiMapPin className="text-indigo-300 text-xl" />
                                    <span>123 Medical Center Dr, Health City</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="font-bold text-lg">DV</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="4"
                                    placeholder="How can we help?"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Send Message</span>
                                <FiSend />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ContactUs;
