import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import OrgDashboard from './components/OrgDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDetail from './components/PatientDetail';
import PatientDashboard from './components/PatientDashboard';
import PatientVisitDetail from './components/PatientVisitDetail';
import PatientDoctor from './components/PatientDoctor';
import PatientProfile from './components/PatientProfile';
import ContactUs from './components/ContactUs';
import AboutUs from './components/AboutUs';
import DoctorProfile from './components/DoctorProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<OrgDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patient/:id" element={<PatientDetail />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />

        {/* Public/Common Routes */}
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />

        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/visit/:id" element={<PatientVisitDetail />} />
        <Route path="/patient/doctor" element={<PatientDoctor />} />
        <Route path="/patient/profile" element={<PatientProfile />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;