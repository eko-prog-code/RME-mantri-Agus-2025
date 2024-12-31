import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './WaFunnel.css';

const Wa = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [showPatients, setShowPatients] = useState(false); // Menyembunyikan data pasien pada awalnya

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json');
        const data = response.data;
        const filteredPatients = Object.values(data).filter(patient => {
          if (selectedDiagnosis === 'Tension-type headache') {
            return (
              patient.medical_records &&
              patient.medical_records[Object.keys(patient.medical_records)[0]] &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis.code === 'G44.2'
            ); // G44.2 is the code for Tension-type headache
          } else if (selectedDiagnosis === 'Non-insulin-dependent diabetes mellitus') {
            return (
              patient.medical_records &&
              patient.medical_records[Object.keys(patient.medical_records)[0]] &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis.code === 'E11'
            ); // E11 is the code for Non-insulin-dependent diabetes mellitus
          } else if (selectedDiagnosis === 'Essential (primary) hypertension') {
            return (
              patient.medical_records &&
              patient.medical_records[Object.keys(patient.medical_records)[0]] &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis &&
              patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis.code === 'I10'
            ); // I10 is the code for Essential (primary) hypertension
          }  else if (selectedDiagnosis === 'Secondary hypertension') {
              return (
                patient.medical_records &&
                patient.medical_records[Object.keys(patient.medical_records)[0]] &&
                patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis &&
                patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis.code === 'I15'
              ); // I15 is the code for Secondary hypertension
          } else {
            return true; // If no diagnosis selected, show all patients
          }
        });
        setPatients(filteredPatients);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, [selectedDiagnosis]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(patients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'Patients');
    XLSX.writeFile(wb, 'filtered_patients.xlsx');
  };

  // Fungsi untuk menampilkan data pasien saat tombol filter ditekan
  const handleFilter = () => {
    setShowPatients(true);
  };

  return (
    <div>
      <h1>List Pasien</h1>
      <label htmlFor="diagnosis">Pilih Diagnosis:</label>
      <select id="diagnosis" onChange={(e) => setSelectedDiagnosis(e.target.value)}>
        <option value="">Semua</option>
        <option value="Non-insulin-dependent diabetes mellitus">Non-insulin-dependent diabetes mellitus</option>
        <option value="Tension-type headache">Tension-type headache</option>
        <option value="Essential (primary) hypertension">Essential (primary) hypertension</option>
        <option value="Secondary hypertension">Secondary hypertension</option>
      </select>
      <div className='gapButton'>
      <button onClick={handleFilter}>Filter</button> {/* Tombol untuk menampilkan data pasien */}
      <button onClick={exportToExcel}>Export to Excel</button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className={showPatients ? 'show-patients' : ''}>
          {patients.map(patient => (
            <li key={patient.id} className="patient-card">
              {patient.name && <p>Nama Pasien: {patient.name}</p>}
              {patient.whatsappNumber && <p>No. WhatsApp: {patient.whatsappNumber}</p>}
              {patient.medical_records &&
                patient.medical_records[Object.keys(patient.medical_records)[0]] &&
                patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis && (
                  <p>Diagnosis: {patient.medical_records[Object.keys(patient.medical_records)[0]].diagnosis.name}</p>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Wa;
