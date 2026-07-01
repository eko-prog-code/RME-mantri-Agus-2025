import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import MultiMenu from './MultiMenu';
import CategoryObat from './CategoryObat';
import Booking from './Booking';
import JadwalPraktek from './JadwalPraktek';
import ServiceSetting from './ServiceSetting';
import ListBelanjaObat from './ListBelanjaObat';
import './Home.css';

// Import gambar dari lokal
import PasienBaruImg from '../Images/PasienBaru.png';
import PasienLamaImg from '../Images/PasienLama.png';

const Home = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isNewPatient, setIsNewPatient] = useState(true);
    const [patients, setPatients] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [newPatientData, setNewPatientData] = useState({
        name: '',
        birthDate: '',
        identifier: '',
        medicalRecordNumber: '',
        patientAddress: '',
        whatsappNumber: '',
    });

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');

    const [isFormVisible, setFormVisible] = useState(false);
    const [showFilteredPatients, setShowFilteredPatients] = useState(false);

    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, index) => 1950 + index).reverse();

    const submitNewPatient = () => {
        const newPatient = {
            name: newPatientData.name,
            birthDate: dayjs(selectedDate).format('YYYY-MM-DD'),
            identifier: newPatientData.identifier,
            number_medical_records: newPatientData.medicalRecordNumber,
            patientAddress: newPatientData.patientAddress,
            whatsappNumber: newPatientData.whatsappNumber,
            timestamp: new Date().toISOString(), // Add timestamp field
        };

        axios
            .post('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json', newPatient)
            .then((response) => {
                console.log('Data pasien baru terkirim:', response.data);
                setNewPatientData({ 
                    name: '', 
                    birthDate: '', 
                    identifier: '', 
                    number_medical_records: '', 
                    patientAddress: '',
                    whatsappNumber: '' 
                });
                setSelectedDate(null);
                setSelectedYear('');
                closeModal();

                navigate(`/emr/${response.data.name}`);
            })
            .catch((error) => {
                console.error('Terjadi kesalahan:', error);
            });
    };

    const searchPatients = () => {
        axios
            .get('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json')
            .then((response) => {
                const patientData = response.data;

                const filteredPatients = Object.keys(patientData).filter((patientId) =>
                    patientData[patientId].name.toLowerCase().includes(searchKeyword.toLowerCase())
                );

                const filteredPatientData = filteredPatients.reduce((filteredData, patientId) => {
                    filteredData[patientId] = patientData[patientId];
                    return filteredData;
                }, {});

                setPatients(filteredPatientData);
                setShowFilteredPatients(filteredPatients.length > 0);
            })
            .catch((error) => {
                console.error('Terjadi kesalahan:', error);
            });
    };

    const closeModal = () => {
        setFormVisible(false);
        setModalOpen(false);
    };

    useEffect(() => {
        axios
            .get('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json')
            .then((response) => {
                setPatients(response.data);
            })
            .catch((error) => {
                console.error('Terjadi kesalahan:', error);
            });
    }, []);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setModalOpen(false);
    };

    const renderDatePicker = () => {
        return (
            <DatePicker
                inline
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Pilih Tanggal Lahir"
                locale="id"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={80}
                showMonthDropdown
                monthDropdownItemNumber={12}
            />
        );
    };

    return (
        <div>
            <h2>Rekam Medis Pasien</h2>
            <div className="image-button-container">
                <img
                    src={PasienBaruImg}
                    alt="Pasien Baru"
                    className="image-button"
                    onClick={() => {
                        setFormVisible(true);
                        setIsNewPatient(true);
                    }}
                />

                <img
                    src={PasienLamaImg}
                    alt="Pasien Lama"
                    className="image-button"
                    onClick={() => {
                        setFormVisible(true);
                        setIsNewPatient(false);
                    }}
                />
            </div>

            <MultiMenu />
            <CategoryObat />
            <Booking />
            <div className="image-button-container-ServiceSetting">
                <Link to="/editHistory">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/praktek-mandiri-mantri-agus.appspot.com/o/IconPatient%60s%2Ffilter%26edit.png?alt=media&token=797cb1bf-0912-466e-8fb2-c1100ab16a60"
                        alt="EditHistory"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>
            <div className="image-button-container-ServiceSetting">
                <Link to="/excelHarian">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/praktek-mandiri-mantri-agus.appspot.com/o/IconPatient%60s%2FExcel-Kunungan-Harian.png?alt=media&token=217eaba3-0330-4232-8432-e23fd45afdb0"
                        alt="Excel Kunjungan Harian"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <JadwalPraktek />
            <div className="image-button-container-ServiceSetting">
                <Link to="/revenue">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/praktek-mandiri-mantri-agus.appspot.com/o/IconPatient%60s%2FRevenue.png?alt=media&token=469d6f41-60fe-4cb8-b0f4-4b2659567378"
                        alt="Service Setting"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-ServiceSetting">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/praktek-mandiri-mantri-agus.appspot.com/o/IconPatient%60s%2FDoc.png?alt=media&token=6d09a803-e326-4daf-8d80-8fa436af78b2"
                    alt="Service Setting"
                    className="image-button-ServiceSetting"
                    onClick={() => window.open('https://medic-tech-plus.vercel.app/', '_blank')}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            <div className="image-button-container-ServiceSetting">
                <Link to="/list-belanja-obat">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/emr-q-b0576.appspot.com/o/ListBelanjaObatdan%20Alkes.png?alt=media&token=3c1f8fa1-dc86-4727-8f38-2c585eb53ebc"
                        alt="List Belanja Obat"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-SatuSehat">
                <Link to="/satusehat">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/HomeButton%2FIntegrasi%20Satu%20Sehat.png?alt=media&token=50da787c-5b95-482b-a6ff-33ef99ab9215"
                        alt="Satu Sehat Integrate"
                        className="image-button-SatuSehat"
                    />
                </Link>
            </div>

            <div className="image-button-container-ServiceSetting">
                <Link to="/kunjungan">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/praktek-mandiri-mantri-agus.appspot.com/o/IconPatient%60s%2FKunjungan.png?alt=media&token=5ab0b7ac-0217-4006-b356-5132399b9ff4"
                        alt="Kunjungan"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-SatuSehat">
                <Link to="/wa">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/HomeButton%2FExport%20Contact%20Pasien.png?alt=media&token=dd696862-78b6-49bf-a401-02425a1d489d"
                        alt="wa blast"
                        className="image-button-SatuSehat"
                    />
                </Link>
            </div>

            {isFormVisible && (
                <div className="modal-background" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeModal}>
                            <FaTimes />
                        </span>
                        {isNewPatient ? (
                            <div className="modal-content">
                                <div>
                                    <input
                                        type="text"
                                        className="new-patient-input"
                                        placeholder="NIK Pasien Baru"
                                        value={newPatientData.identifier}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            setNewPatientData({ ...newPatientData, identifier: numericValue });
                                        }}
                                    />

                                    <input
                                        type="text"
                                        className="new-patient-input"
                                        placeholder="Nama Pasien Baru"
                                        value={newPatientData.name}
                                        onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                                    />
                                    
                                    <input
                                        type="text"
                                        className="new-patient-input"
                                        placeholder="Nomor Rekam Medis"
                                        value={newPatientData.medicalRecordNumber}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            setNewPatientData({ ...newPatientData, medicalRecordNumber: numericValue });
                                        }}
                                    />
                                    
                                    {/* Form Alamat dengan style sama persis dengan input nama */}
                                    <input
                                        type="text"
                                        className="new-patient-input"
                                        placeholder="Alamat Pasien"
                                        value={newPatientData.patientAddress}
                                        onChange={(e) => setNewPatientData({ ...newPatientData, patientAddress: e.target.value })}
                                    />
                                    
                                    <input
                                        type="tel"
                                        className="new-patient-input"
                                        placeholder="Nomor WhatsApp"
                                        value={newPatientData.whatsappNumber}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            setNewPatientData({ ...newPatientData, whatsappNumber: numericValue });
                                        }}
                                    />

                                    <DatePicker
                                        className="new-patient-input"
                                        selected={selectedDate}
                                        onChange={(date) => setSelectedDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Pilih Tanggal Lahir"
                                        locale="id"
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={60}
                                        showMonthDropdown
                                        monthDropdownItemNumber={12}
                                    />
                                </div>
                                <button className="new-patient-button" onClick={submitNewPatient}>
                                    Submit
                                </button>
                            </div>
                        ) : (
                            <div className="modal-content">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Cari Nama Pasien"
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        searchPatients();
                                    }}
                                />
                                <button className="search-button" onClick={searchPatients}>
                                    Cari
                                </button>

                                {showFilteredPatients && (
                                    <div className="name-filter">
                                        <ul>
                                            {Object.keys(patients).map((patientId) => (
                                                <li key={patientId} className="patient-list-item">
                                                    <div className="patient-info">
                                                        {patients[patientId].name} - {patients[patientId].birthDate}
                                                    </div>
                                                    <button
                                                        className="view-emr-button"
                                                        onClick={() => navigate(`/emr/${patientId}`)}
                                                    >
                                                        View EMR
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ul>
                {patients && !showFilteredPatients && Object.keys(patients).map((patientId) => (
                    <li key={patientId}>
                        <Link to={`/emr/${patientId}`}>
                            <div className="patient-info">
                                <span className="patient-name">{patients[patientId].name}</span>
                                <span className="patient-dob">{patients[patientId].birthDate}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
