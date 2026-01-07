import React from 'react';
import { useParams } from 'react-router-dom';

const PatientDetail = () => {
    const { id } = useParams();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Patient Detail</h1>
            <p>Viewing details for patient ID: {id}</p>
        </div>
    );
};

export default PatientDetail;
