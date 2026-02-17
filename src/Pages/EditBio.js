import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EditBio.css';

const EditBio = () => {
    const { id } = useParams();

    const [patientDetails, setPatientDetails] = useState({
        name: '',
        birthDate: '',
        identifier: '',
        number_medical_records: '',
        patientAddress: '',
        whatsappNumber: ''
    });

    // Fetch data pasien berdasarkan ID
    useEffect(() => {
        axios
            .get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`)
            .then((response) => {
                if (response.data) {
                    setPatientDetails({
                        name: response.data.name || '',
                        birthDate: response.data.birthDate || '',
                        identifier: response.data.identifier || '',
                        number_medical_records: response.data.number_medical_records || '',
                        patientAddress: response.data.patientAddress || '',
                        whatsappNumber: response.data.whatsappNumber || ''
                    });
                }
            })
            .catch((error) => {
                console.error('Terjadi kesalahan:', error);
            });
    }, [id]);

    // Handle perubahan input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    // Simpan data pasien yang diperbarui
    const savePatientDetails = () => {
        // Ambil data pasien yang ada dari database
        axios
            .get(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`)
            .then((response) => {
                if (!response.data) {
                    console.error('Data pasien tidak ditemukan.');
                    return;
                }

                // Gabungkan data baru dengan data lama
                const updatedDetails = {
                    ...response.data, // Data lama tetap utuh
                    name: patientDetails.name,
                    birthDate: patientDetails.birthDate,
                    identifier: patientDetails.identifier,
                    number_medical_records: patientDetails.number_medical_records,
                    patientAddress: patientDetails.patientAddress,
                    whatsappNumber: patientDetails.whatsappNumber
                };

                // Simpan data yang sudah diperbarui
                axios
                    .put(`https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`, updatedDetails)
                    .then(() => {
                        console.log('Data pasien berhasil diperbarui.');
                        window.location.href = `/emr/${id}`; // Redirect ke halaman EMR
                    })
                    .catch((error) => {
                        console.error('Terjadi kesalahan saat menyimpan data:', error);
                    });
            })
            .catch((error) => {
                console.error('Terjadi kesalahan saat mengambil data pasien:', error);
            });
    };

    return (
        <div className="edit-bio-container">
            <h2>Edit Biodata Pasien</h2>
            <div className="form-container">
                <div className="form-group">
                    <label>Nama:</label>
                    <input
                        type="text"
                        name="name"
                        value={patientDetails.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Tanggal Lahir:</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={patientDetails.birthDate}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>No KTP:</label>
                        <input
                            type="text"
                            name="identifier"
                            value={patientDetails.identifier}
                            onChange={handleInputChange}
                            placeholder="Masukkan No KTP"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>No Rekam Medis:</label>
                        <input
                            type="text"
                            name="number_medical_records"
                            value={patientDetails.number_medical_records}
                            onChange={handleInputChange}
                            placeholder="Masukkan No RM"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>No Whatsapp:</label>
                        <input
                            type="text"
                            name="whatsappNumber"
                            value={patientDetails.whatsappNumber}
                            onChange={handleInputChange}
                            placeholder="Contoh: 08123456789"
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Alamat:</label>
                    <textarea
                        name="patientAddress"
                        value={patientDetails.patientAddress}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi)"
                    />
                </div>

                <div className="button-group">
                    <button className="save-button" onClick={savePatientDetails}>
                        Simpan Perubahan
                    </button>
                    <button 
                        className="cancel-button" 
                        onClick={() => window.location.href = `/emr/${id}`}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditBio;
