import React from 'react';
import { useParams } from 'react-router-dom';

const PatientVisitDetail = () => {
    const { id } = useParams();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Patient Visit Detail</h1>
            <p>Viewing visit details for ID: {id}</p>
        </div>
    );
};

export default PatientVisitDetail;
