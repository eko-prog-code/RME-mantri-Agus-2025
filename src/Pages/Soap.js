import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import './Soap.css';

const Soap = () => {
    const { id } = useParams();
    const [dateTime, setDateTime] = useState(new Date());
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [medicalStaff, setMedicalStaff] = useState('');
    const [soapNotes, setSoapNotes] = useState([]);
    const [patientName, setPatientName] = useState('Loading...');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Fetch patient details to get the patient name
                const patientResponse = await axios.get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`);
                const patientData = patientResponse.data;
                if (patientData) {
                    setPatientName(patientData.name || 'No name available');
                } else {
                    setPatientName('No name available');
                }
            } catch (error) {
                console.error('Error fetching patient data:', error);
                setPatientName('Error loading name');
            }
        };

        const fetchSoapNotes = async () => {
            try {
                const response = await axios.get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Soap.json`);
                const data = response.data;
                if (data) {
                    const notesArray = Object.keys(data).map(key => {
                        const note = data[key];
                        return {
                            id: key,
                            ...note,
                            dateTime: new Date(note.dateTime) // Ensure dateTime is a Date object
                        };
                    });
                    notesArray.sort((a, b) => b.dateTime - a.dateTime); // Newest first
                    setSoapNotes(notesArray);
                } else {
                    setSoapNotes([]);
                }
            } catch (error) {
                console.error('Error fetching SOAP notes:', error);
                setSoapNotes([]);
            }
        };

        fetchPatientData();
        fetchSoapNotes();
    }, [id]);

    const handleDateTimeChange = (event) => {
        setDateTime(new Date(event.target.value));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const dataToSend = {
            dateTime: dateTime.toISOString(),
            subjective,
            objective,
            assessment,
            plan,
            medicalStaff
        };

        try {
            await axios.post(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Soap.json`, dataToSend);
            // Refresh the list after submitting
            const response = await axios.get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Soap.json`);
            const data = response.data;
            if (data) {
                const notesArray = Object.keys(data).map(key => {
                    const note = data[key];
                    return {
                        id: key,
                        ...note,
                        dateTime: new Date(note.dateTime) // Ensure dateTime is a Date object
                    };
                });
                notesArray.sort((a, b) => b.dateTime - a.dateTime);
                setSoapNotes(notesArray);
            }
            setSubjective('');
            setObjective('');
            setAssessment('');
            setPlan('');
            setMedicalStaff('');
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const toggleForm = () => {
        setShowForm(prev => !prev);
    };

    const formatDateTime = (dateTime) => {
        try {
            return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    return (
        <div className="soap-container">
            <h2>SOAP Notes for {patientName}</h2>
            <button onClick={toggleForm} className="toggle-form-button">
                {showForm ? 'Tutup Form' : 'Buat SOAP'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="soap-form">
                    <div>
                        <label>Tanggal dan Waktu:</label>
                        <input
                            type="datetime-local"
                            value={format(dateTime, "yyyy-MM-dd'T'HH:mm")}
                            onChange={handleDateTimeChange}
                        />
                        <p>Waktu Lokal: {formatDateTime(dateTime)}</p>
                    </div>
                    <div>
                        <label>Subjective:</label>
                        <textarea
                            value={subjective}
                            onChange={(e) => setSubjective(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Objective:</label>
                        <textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Assessment:</label>
                        <textarea
                            value={assessment}
                            onChange={(e) => setAssessment(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Plan:</label>
                        <textarea
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Nama Petugas Medis:</label>
                        <select
                            value={medicalStaff}
                            onChange={(e) => setMedicalStaff(e.target.value)}
                            required
                        >
                            <option value="">Pilih Tenaga Medis</option>
                            <option value="Ns. Agus kostaman achyar">Ns. Agus kostaman achyar</option>
                        </select>
                    </div>
                    <button type="submit">Simpan</button>
                </form>
            )}

            <h2 className="pasien">Pasien: {patientName}</h2>
            <table className="soap-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>SOAP</th>
                        <th>Petugas Medis</th>
                    </tr>
                </thead>
                <tbody>
                    {soapNotes.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>Tidak ada catatan SOAP yang tersedia.</td>
                        </tr>
                    ) : (
                        soapNotes.map(note => (
                            <tr key={note.id}>
                                <td>{formatDateTime(note.dateTime)}</td>
                                <td className="soap-details">
                                    <div><strong>S:</strong> {note.subjective}</div>
                                    <div><strong>O:</strong> {note.objective}</div>
                                    <div><strong>A:</strong> {note.assessment}</div>
                                    <div><strong>P:</strong> {note.plan}</div>
                                </td>
                                <td>{note.medicalStaff}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Soap;