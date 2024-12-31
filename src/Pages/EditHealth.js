import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EditHealth.css';

const EditHealth = () => {
    const { id } = useParams();

    const [patientDetails, setPatientDetails] = useState({
        name: '',
        birthDate: '',
        Allergies: '', // Perubahan: Huruf besar pada awal kata
        HealthHistory: '' // Perubahan: Huruf besar pada awal kata
    });

    useEffect(() => {
        axios.get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`)
            .then(response => {
                if (response.data) {
                    setPatientDetails({
                        name: response.data.name || '',
                        birthDate: response.data.birthDate || '',
                        Allergies: response.data.Allergies || '', // Perubahan: Huruf besar pada awal kata
                        HealthHistory: response.data.HealthHistory || '' // Perubahan: Huruf besar pada awal kata
                    });
                }
            })
            .catch(error => {
                console.error('Terjadi kesalahan:', error);
            });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const saveHealthDetails = () => {
        const updatedDetails = {
            Allergies: patientDetails.Allergies, // Perubahan: Huruf besar pada awal kata
            HealthHistory: patientDetails.HealthHistory // Perubahan: Huruf besar pada awal kata
        };

        axios.get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`)
            .then(response => {
                const existingData = response.data;
                const newData = { ...existingData, ...updatedDetails };

                axios.put(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`, newData)
                    .then(response => {
                        console.log('Data kesehatan pasien berhasil disimpan');
                        window.location.href = `/emr/${id}`;
                    })
                    .catch(error => {
                        console.error('Terjadi kesalahan:', error);
                    });
            })
            .catch(error => {
                console.error('Terjadi kesalahan:', error);
            });
    };

    return (
        <div className="edit-health-container">
            <h2>Alergi & Riwayat Kesehatan Pasien</h2>
            <p>Nama: {patientDetails.name}</p>
            <p>Tanggal Lahir: {patientDetails.birthDate}</p>
            <div className="form-group">
                <label>Alergi:</label>
                <input type="text" name="Allergies" value={patientDetails.Allergies} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>Riwayat Kesehatan:</label>
                <input type="text" name="HealthHistory" value={patientDetails.HealthHistory} onChange={handleInputChange} />
            </div>
            <button className="save-button" onClick={saveHealthDetails}>Simpan</button>
        </div>
    );
};

export default EditHealth;