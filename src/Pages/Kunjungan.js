import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Kunjungan.css';

function Kunjungan() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json'
            );
            if (response.data) {
                console.log('Fetched patients:', response.data);
                setPatients(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculateAge = (dob, filterDate) => {
        if (!dob || !filterDate) return null;
        const dobDate = new Date(dob);
        const filter = new Date(filterDate);
        const ageDate = new Date(filter - dobDate);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        const days = ageDate.getUTCDate() - 1;
        return { years, months, days };
    };

    const handleFilter = () => {
        const filtered = Object.values(patients || {}).filter(patient => {
            const medicalRecords = Object.values(patient.medical_records || {});
            return medicalRecords.some(record => {
                const timestamp = record?.Encounter_period_start
                    ? new Date(record.Encounter_period_start)
                    : null;
                return timestamp?.toISOString().split('T')[0] === filterDate;
            });
        });

        const updatedFilteredPatients = filtered.map(patient => {
            const age = patient.birthDate ? calculateAge(patient.birthDate, filterDate) : null;
            return { ...patient, usia: age };
        });

        setFilteredPatients(updatedFilteredPatients);
    };

    return (
        <div className="kunjungan-container">
            <div className="kunjungan-input-container">
                <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                />
                <button onClick={handleFilter}>Filter</button>
            </div>
            <ul className="kunjungan-patient-list">
                {filteredPatients.map(patient => (
                    <li key={patient.identifier} className="kunjungan-patient-item">
                        <div>Nama: {patient.name}</div>
                        <div>Tanggal Lahir: {patient.birthDate}</div>
                        <div>
                            Usia saat berobat: {patient.usia?.years || 0} tahun,{' '}
                            {patient.usia?.months || 0} bulan, {patient.usia?.days || 0} hari
                        </div>
                        <div>
                            Diagnosa Medis:
                            {Object.values(patient.medical_records || {})
                                .map(record =>
                                    record.diagnosis && record.diagnosis.name
                                        ? record.diagnosis.name
                                        : 'N/A'
                                )
                                .join(', ')}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Kunjungan;
