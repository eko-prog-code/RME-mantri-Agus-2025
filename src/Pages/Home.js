import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaIdCard } from 'react-icons/fa';
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
import FilterEditImg from '../Images/filter&edit.png';
import ExcelKunjunganHarianImg from '../Images/Excel-Kunjungan-Harian.png';
import RevenueImg from '../Images/Revenue.png';
import ListBelanjaObatImg from '../Images/ListBelanjaObatdan Alkes.png';
import SatuSehatImg from '../Images/Satu-Sehat.png';
import KunjunganImg from '../Images/List-Kunjungan.png';
import WaPasienImg from '../Images/Wa-Pasien.png';
import DocImg from '../Images/Doc.png';

const Home = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isNewPatient, setIsNewPatient] = useState(true);
    const [patients, setPatients] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchMethod, setSearchMethod] = useState('name'); // 'name' atau 'mrn'
    const [searchNameKeyword, setSearchNameKeyword] = useState('');
    const [searchMrnKeyword, setSearchMrnKeyword] = useState('');
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
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

    const calculateNextMedicalRecordNumber = (patientData) => {
        if (!patientData || typeof patientData !== 'object') {
            return '000001';
        }
        let maxNumber = 0;
        Object.values(patientData).forEach((patient) => {
            if (!patient) return;
            const mrn = patient.number_medical_records || patient.medicalRecordNumber;
            if (mrn) {
                const cleanStr = String(mrn).trim();
                const parsed = parseInt(cleanStr, 10);
                // Standard 6-digit sequential record numbers (ignore accidental 10+ digit NIK typos)
                if (!isNaN(parsed) && parsed < 1000000 && cleanStr.length <= 8) {
                    if (parsed > maxNumber) {
                        maxNumber = parsed;
                    }
                }
            }
        });
        const nextNumber = maxNumber + 1;
        return String(nextNumber).padStart(6, '0');
    };

    const handleOpenNewPatientModal = async () => {
        setFormVisible(true);
        setIsNewPatient(true);

        // Jika data patients sudah ada di state, langsung set agar pengguna melihat nomor terbaru tanpa delay
        if (patients && Object.keys(patients).length > 0) {
            const nextMrn = calculateNextMedicalRecordNumber(patients);
            setNewPatientData((prev) => ({
                ...prev,
                medicalRecordNumber: nextMrn,
            }));
        }

        // Ambil data terbaru langsung dari Realtime Database Firebase untuk memastikan nilai nomor tertinggi yang paling mutakhir
        try {
            const response = await axios.get(
                'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json'
            );
            if (response.data) {
                setPatients(response.data);
                const freshNextMrn = calculateNextMedicalRecordNumber(response.data);
                setNewPatientData((prev) => ({
                    ...prev,
                    medicalRecordNumber: freshNextMrn,
                }));
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat memuat data pasien terbaru dari Firebase:', error);
        }
    };

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
                    medicalRecordNumber: '', 
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

    // Data pasien yang diformat untuk pencarian cepat dan akurat di memori
    const patientList = useMemo(() => {
        if (!patients || typeof patients !== 'object') return [];
        return Object.entries(patients)
            .filter(([id, p]) => p && typeof p === 'object')
            .map(([id, p]) => {
                const rawMrn = p.number_medical_records || p.medicalRecordNumber || '';
                const cleanMrn = String(rawMrn).trim();
                const numericMrn = parseInt(cleanMrn.replace(/\D/g, ''), 10);
                return {
                    id,
                    name: String(p.name || '').trim(),
                    birthDate: p.birthDate || '',
                    identifier: p.identifier || '',
                    mrn: cleanMrn,
                    numericMrn: isNaN(numericMrn) ? null : numericMrn,
                    address: p.patientAddress || '',
                    whatsapp: p.whatsappNumber || '',
                };
            });
    }, [patients]);

    // Filter cepat dan presisi untuk 2 metode: Nama Pasien & Nomor Rekam Medis
    const filteredPatientsList = useMemo(() => {
        if (searchMethod === 'name') {
            const query = searchNameKeyword.trim().toLowerCase();
            if (!query) return [];
            const terms = query.split(/\s+/).filter(Boolean);
            return patientList.filter((p) => {
                const pName = p.name.toLowerCase();
                return terms.every((term) => pName.includes(term));
            });
        } else {
            // Pencarian berdasarkan Nomor Rekam Medis (medicalRecordNumber)
            const query = searchMrnKeyword.trim();
            if (!query) return [];
            const queryDigits = query.replace(/\D/g, '');
            const queryNum = parseInt(queryDigits, 10);

            return patientList.filter((p) => {
                // 1. Pencocokan langsung teks nomor rekam medis (case-insensitive)
                if (p.mrn.toLowerCase().includes(query.toLowerCase())) {
                    return true;
                }
                // 2. Pencocokan numerik presisi (misal ketik 2740 cocok dengan 002740)
                if (!isNaN(queryNum) && p.numericMrn !== null) {
                    if (p.numericMrn === queryNum) return true;
                    const pDigits = p.mrn.replace(/\D/g, '');
                    if (queryDigits.length >= 2 && pDigits.includes(queryDigits)) {
                        return true;
                    }
                }
                return false;
            });
        }
    }, [patientList, searchMethod, searchNameKeyword, searchMrnKeyword]);

    const activeKeyword = searchMethod === 'name' ? searchNameKeyword.trim() : searchMrnKeyword.trim();

    const handleOpenOldPatientModal = async () => {
        setFormVisible(true);
        setIsNewPatient(false);
        setSearchNameKeyword('');
        setSearchMrnKeyword('');
        setSearchMethod('name');

        // Pastikan data pasien selalu sinkron dan termutakhir
        if (!patients || Object.keys(patients).length === 0) {
            setIsLoadingPatients(true);
        }
        try {
            const response = await axios.get(
                'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json'
            );
            if (response.data) {
                setPatients(response.data);
            }
        } catch (error) {
            console.error('Terjadi kesalahan memuat data pasien:', error);
        } finally {
            setIsLoadingPatients(false);
        }
    };

    const searchPatients = () => {
        // Didukung melalui filteredPatientsList yang cepat dan reaktif
    };

    const closeModal = () => {
        setFormVisible(false);
        setModalOpen(false);
        setSearchNameKeyword('');
        setSearchMrnKeyword('');
        setNewPatientData({ 
            name: '', 
            birthDate: '', 
            identifier: '', 
            medicalRecordNumber: '', 
            patientAddress: '',
            whatsappNumber: '' 
        });
        setSelectedDate(null);
        setSelectedYear('');
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
                    onClick={handleOpenNewPatientModal}
                />

                <img
                    src={PasienLamaImg}
                    alt="Pasien Lama"
                    className="image-button"
                    onClick={handleOpenOldPatientModal}
                />
            </div>

            <MultiMenu />
            <CategoryObat />
            <Booking />
            <div className="image-button-container-ServiceSetting">
                <Link to="/editHistory">
                    <img
                        src={FilterEditImg}
                        alt="EditHistory"
                        className="image-button-ServiceSetting"
                        />
                </Link>
            </div>
                        
            <div className="image-button-container-ServiceSetting">
                <Link to="/excelHarian">
                    <img
                        src={ExcelKunjunganHarianImg}
                        alt="Excel Kunjungan Harian"
                        className="image-button-ServiceSetting"
                        />
                </Link>
            </div>

            <JadwalPraktek />
            <div className="image-button-container-ServiceSetting">
                <Link to="/revenue">
                    <img
                        src={RevenueImg}
                        alt="Service Setting"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-ServiceSetting">
                <img
                    src={DocImg}
                    alt="Service Setting"
                    className="image-button-ServiceSetting"
                    onClick={() => window.open('https://medic-tech-plus.vercel.app/', '_blank')}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            <div className="image-button-container-ServiceSetting">
                <Link to="/list-belanja-obat">
                    <img
                        src={ListBelanjaObatImg}
                        alt="List Belanja Obat"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-SatuSehat">
                <Link to="/satusehat">
                    <img
                        src={SatuSehatImg}
                        alt="Satu Sehat Integrate"
                        className="image-button-SatuSehat"
                    />
                </Link>
            </div>

            <div className="image-button-container-ServiceSetting">
                <Link to="/kunjungan">
                    <img
                        src={KunjunganImg}
                        alt="Kunjungan"
                        className="image-button-ServiceSetting"
                    />
                </Link>
            </div>

            <div className="image-button-container-SatuSehat">
                <Link to="/wa">
                    <img
                        src={WaPasienImg}
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
                            <div className="old-patient-modal-container">
                                <h3 className="old-patient-modal-title">Cari Data Pasien Lama</h3>

                                {/* Pilihan 2 Metode Pencarian */}
                                <div className="old-patient-tabs">
                                    <button
                                        type="button"
                                        className={`old-patient-tab ${searchMethod === 'name' ? 'active' : ''}`}
                                        onClick={() => setSearchMethod('name')}
                                    >
                                        <FaUser style={{ marginRight: '6px' }} />
                                        Nama Pasien
                                    </button>
                                    <button
                                        type="button"
                                        className={`old-patient-tab ${searchMethod === 'mrn' ? 'active' : ''}`}
                                        onClick={() => setSearchMethod('mrn')}
                                    >
                                        <FaIdCard style={{ marginRight: '6px' }} />
                                        No. Rekam Medis
                                    </button>
                                </div>

                                {/* Form Input Berdasarkan Metode Terpilih */}
                                {searchMethod === 'name' ? (
                                    <div className="search-method-section">
                                        <div className="search-input-wrapper">
                                            <input
                                                type="text"
                                                className="search-input-modern"
                                                placeholder="Ketik nama pasien (contoh: Putri, Agus)..."
                                                value={searchNameKeyword}
                                                onChange={(e) => setSearchNameKeyword(e.target.value)}
                                                autoFocus
                                            />
                                            {searchNameKeyword && (
                                                <button
                                                    type="button"
                                                    className="clear-input-btn"
                                                    onClick={() => setSearchNameKeyword('')}
                                                    title="Hapus pencarian"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                        <p className="search-hint-text">
                                            * Pencarian cepat otomatis memfilter nama pasien saat diketik.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="search-method-section">
                                        <div className="search-input-wrapper">
                                            <input
                                                type="text"
                                                className="search-input-modern"
                                                placeholder="Masukkan No. Rekam Medis (contoh: 002740 atau 2740)..."
                                                value={searchMrnKeyword}
                                                onChange={(e) => setSearchMrnKeyword(e.target.value)}
                                                autoFocus
                                            />
                                            {searchMrnKeyword && (
                                                <button
                                                    type="button"
                                                    className="clear-input-btn"
                                                    onClick={() => setSearchMrnKeyword('')}
                                                    title="Hapus input"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                        <p className="search-hint-text">
                                            * Tips: Bisa masukkan format 6 digit (<strong>002740</strong>) atau nomor urutnya saja (<strong>2740</strong>).
                                        </p>
                                    </div>
                                )}

                                {/* Hasil Pencarian Cepat & Akurat */}
                                <div className="search-results-container">
                                    {isLoadingPatients ? (
                                        <div className="search-status-message">
                                            <p>Sedang sinkronisasi data pasien...</p>
                                        </div>
                                    ) : activeKeyword === '' ? (
                                        <div className="search-status-message">
                                            <p className="search-prompt-text">
                                                {searchMethod === 'name'
                                                    ? 'Silakan ketik nama pasien di kolom pencarian di atas.'
                                                    : 'Silakan masukkan nomor rekam medis pasien di kolom di atas.'}
                                            </p>
                                            <span className="search-count-badge">
                                                Total {patientList.length} Pasien Terdaftar
                                            </span>
                                        </div>
                                    ) : filteredPatientsList.length === 0 ? (
                                        <div className="search-status-message no-results">
                                            <p>
                                                Tidak ditemukan pasien dengan {searchMethod === 'name' ? 'nama' : 'nomor rekam medis'}{' '}
                                                "<strong>{activeKeyword}</strong>".
                                            </p>
                                            <p className="search-hint-text" style={{ textAlign: 'center' }}>
                                                Pastikan ejaan nama atau nomor rekam medis sudah sesuai.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="search-result-count-bar">
                                                <span>
                                                    Ditemukan <strong>{filteredPatientsList.length}</strong> pasien
                                                </span>
                                            </div>
                                            <div className="search-patient-cards-list">
                                                {filteredPatientsList.map((p) => (
                                                    <div key={p.id} className="modern-patient-card">
                                                        <div className="patient-card-header">
                                                            <span className="patient-name-title">{p.name || 'Tanpa Nama'}</span>
                                                            {p.mrn && (
                                                                <span className="patient-mrn-tag">RM: {p.mrn}</span>
                                                            )}
                                                        </div>
                                                        <div className="patient-card-details">
                                                            {p.birthDate && (
                                                                <span className="patient-detail-chip">
                                                                    Lahir: {p.birthDate}
                                                                </span>
                                                            )}
                                                            {p.identifier && (
                                                                <span className="patient-detail-chip">
                                                                    NIK: {p.identifier}
                                                                </span>
                                                            )}
                                                            {p.address && (
                                                                <span className="patient-detail-chip">
                                                                    Alamat: {p.address}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn-open-emr"
                                                            onClick={() => {
                                                                closeModal();
                                                                navigate(`/emr/${p.id}`);
                                                            }}
                                                        >
                                                            Buka Rekam Medis (EMR) →
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
