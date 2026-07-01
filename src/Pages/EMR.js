import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaPlus, FaUserMd } from "react-icons/fa";
import { format, differenceInHours } from "date-fns";
import { Tabs, Tab } from "@mui/material";
import "./EMR.css";
import EditIconImg from '../Images/TRUE LETTER.png';

const EMR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(undefined);
  const location = useLocation();
  const { updatedCost } = location.state || {};

  const [patientDetails, setPatientDetails] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [allergies, setAllergies] = useState("");
  const [healthHistory, setHealthHistory] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);

  const isEditable = (timestamp) => {
    const hoursDifference = differenceInHours(new Date(), new Date(timestamp));
    return hoursDifference <= 24;
  };

  const handleNavigate = () => {
    navigate("/edithistory");
  };

  // Fungsi untuk mendapatkan warna berdasarkan kategori IMT
  const getIMTColor = (category) => {
    switch(category) {
      case 'Normal': return '#28a745';
      case 'Kurus': return '#ffc107';
      case 'Gemuk': return '#ff9800';
      case 'Obesitas': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Atur tab berdasarkan path URL saat halaman dimuat
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.includes("assesment")) setValue(0);
    else if (currentPath.includes("soap")) setValue(1);
    else if (currentPath.includes("cppt")) setValue(2);
    else if (currentPath.includes("education")) setValue(3);
    else if (currentPath.includes("delegasi")) setValue(5);
    else setValue(undefined);
  }, []);

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate(`/emr/${id}/assesment`);
        break;
      case 1:
        navigate(`/emr/${id}/soap`);
        break;
      case 2:
        navigate(`/emr/${id}/eduInfus`);
        break;
      case 3:
        navigate(`/emr/${id}/eduSunat`);
        break;
      case 4:
        navigate(`/emr/${id}/refusal`);
        break;
      case 5:
        navigate(`/emr/${id}/delegasi`);
        break;
      default:
        console.warn("Tab tidak valid");
    }
    setValue(newValue);
  };

  useEffect(() => {
    // Mengambil data pasien
    axios
      .get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
      )
      .then((response) => {
        setPatientDetails(response.data);

        if (response.data) {
          setAllergies(response.data.Allergies || "");
          setHealthHistory(response.data.HealthHistory || "");
        }
      })
      .catch((error) => {
        console.error("Terjadi kesalahan:", error);
      });

    // Mengambil data riwayat pengobatan
    axios
      .get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records.json`
      )
      .then((response) => {
        const treatmentsArray = Object.keys(response.data).map((recordId) => ({
          id: recordId,
          ...response.data[recordId],
        }));
        setTreatments(treatmentsArray.reverse());
      })
      .catch((error) => {
        console.error("Terjadi kesalahan:", error);
      });
  }, [id]);

  const confirmDelete = (treatmentId) => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin akan menghapus data ini?"
    );
    if (isConfirmed) {
      deleteTreatmentRecord(treatmentId);
    }
  };

  const confirmDeletePatient = () => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin akan menghapus data pasien ini secara permanent?"
    );
    if (isConfirmed) {
      deletePatient();
    }
  };

  const deletePatient = () => {
    axios
      .delete(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
      )
      .then((response) => {
        console.log("Data pasien berhasil dihapus");
        navigate("/home");
      })
      .catch((error) => {
        console.error("Terjadi kesalahan:", error);
      });
  };

  const deleteTreatmentRecord = (treatmentId) => {
    axios
      .delete(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}.json`
      )
      .then((response) => {
        console.log("Riwayat pengobatan berhasil dihapus");
        const updatedTreatments = treatments.filter(
          (treatment) => treatment.id !== treatmentId
        );
        setTreatments(updatedTreatments);
      })
      .catch((error) => {
        console.error("Terjadi kesalahan:", error);
      });
  };

  return (
    <div>
      <Link to="/home" className="home-link">
        <img src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/images__14_-removebg-preview.png?alt=media&token=dac5fd74-4670-4ce9-a490-4f01637c2f22" alt="Home" />
      </Link>

      <h2 className="title">Electronic Medical Records (EMR)</h2>
      <div className="emr-container">
        <div className="patient-details">
          {patientDetails && (
            <div className="biodata-card">
              <div className="biodata-content">
                <div className="emotion-icon">😊</div>
                <div className="edit-bio-wrapper">
                  <Link to={`/emr/${id}/edit-bio`}>
                    <img
                      src={EditIconImg}
                      alt="Edit Bio"
                      className="EditBio-unix23288"
                    />
                  </Link>
                </div>
                <p><span className="label">Nama :</span> {patientDetails.name}</p>
                <p><span className="label">Tanggal Lahir :</span> {patientDetails.birthDate}</p>
                <p><span className="label">No KTP :</span> {patientDetails.identifier}</p>
                <p><span className="label">No Rekam Medis :</span> {patientDetails.number_medical_records}</p>
                <p><span className="label">Alamat :</span> {patientDetails.patientAddress}</p>
                <p><span className="label">No Wa :</span> {patientDetails.whatsappNumber}</p>
                <p><span className="label">Alergi :</span> {allergies}</p>
                <p><span className="label">Riwayat Kesehatan :</span> {healthHistory}</p>
                <div className="button-wrapper">
                  <Link to={`/emr/${id}/edit-health`} className="purple-button">
                    Alergi & Riwayat Kesehatan
                  </Link>
                </div>
                <div className="button-wrapper">
                  <button className="red-button" onClick={confirmDeletePatient}>
                    Delete Pasien Permanent
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="treatments">
          <div className="tabs-wrapper">
            <Tabs
              value={value !== undefined ? value : false}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Responsive Tabs"
              className="responsive-tabs"
            >
              <Tab label="Assesment Awal" className="responsive-tab" />
              <Tab label="CPPT ~ SOAP" className="responsive-tab" />
              <Tab
                label="Edukasi Pemasangan Infus"
                className="responsive-tab"
              />
              <Tab label="Persetujuan Sunat" className="responsive-tab" />
              <Tab
                label="Penolakan Tindakan Medis"
                className="responsive-tab"
              />
              <Tab label="Surat Delegasi" className="responsive-tab" />
            </Tabs>
          </div>

          {/* Button/Icon Tambah Pengobatan - Style Baru */}
          <div className="tambah-pengobatan-wrapper">
            <Link to={`/emr/${id}/tambah-pengobatan`} className="tambah-pengobatan-link">
              <div className="tambah-pengobatan-button">
                <FaPlus className="plus-icon" />
                <span className="button-text">Tambah Pengobatan</span>
                <FaUserMd className="user-icon" />
              </div>
            </Link>
          </div>

          <h3 className="treatment-history">Riwayat Pengobatan</h3>

          {treatments
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((treatment) => (
              <div className="treatment-card" key={treatment.id}>
                <img
                  src="/trash.png"
                  alt="Delete"
                  className="delete-treatment-icon"
                  onClick={() => confirmDelete(treatment.id)}
                />

                <Link 
                  to={`/emr/${id}/update-treatment/${treatment.id}`}
                  state={{
                    timestamp: treatment.timestamp,
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#007BFF",
                      color: "#FFFFFF",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ✨ Edit Treatment ✍️
                  </button>
                </Link>

                <p>
                  Tanggal dan Waktu:{" "}
                  {format(
                    new Date(treatment.timestamp),
                    "dd MMMM yyyy HH:mm:ss"
                  )}
                </p>
                <div className="animated-payment-card">
                  <div className="card-content">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/HomeButton%2F1ux4tcviQH-AvUM6ziy_sQ-removebg-preview.png?alt=media&token=e38bf7eb-dd73-4665-b532-725c6c2cb536"
                      alt="Icon"
                      style={{
                        width: "40px",
                        height: "40px",
                        marginRight: "10px",
                      }}
                    />
                    <p>
                      History Payment: Rp.{" "}
                      {treatment.treatmentCost
                        ? treatment.treatmentCost.toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/payment-detail/${id}/${treatment.id}`}
                  state={{
                    treatmentCost: treatment.treatmentCost,
                    treatmentDate: format(
                      new Date(treatment.timestamp),
                      "dd MMMM yyyy"
                    ),
                    treatmentTime: format(
                      new Date(treatment.timestamp),
                      "HH:mm:ss"
                    ),
                  }}
                  style={{ textDecoration: "none" }}
                >
                  <button
                    style={{
                      backgroundColor: "#28a745",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      marginBottom: "10px",
                    }}
                  >
                    🧾 Detail Payment
                  </button>
                </Link>

                <p>Keluhan: {treatment.complaint}</p>
                <p>
                  Pemeriksaan Fisik: {treatment.condition_physical_examination}
                </p>
                <p>Tanda-Tanda Vital:</p>
                <p>Systolic Blood Pressure: {treatment.systolicBloodPressure}</p>
                <p>
                  Diastolic Blood Pressure: {treatment.diastolicBloodPressure}
                </p>
                <p>Heart Rate: {treatment.heartRate}</p>
                <p>Body Temperature: {treatment.bodyTemperature}</p>
                <p>Respiratory Rate: {treatment.respiratoryRate}</p>
                <p>Body Weight: {treatment.bodyWeight}</p>
                <p>Body Height: {treatment.bodyHeight || 'Tidak diisi'}</p>
                
                {treatment.imt && treatment.imt.value && (
                  <div className="imt-treatment-display" style={{
                    marginTop: '5px',
                    padding: '8px',
                    borderRadius: '5px',
                    backgroundColor: '#e9ecef'
                  }}>
                    <p style={{ margin: '0' }}>
                      IMT: <strong>{treatment.imt.value}</strong> - 
                      <span style={{ 
                        color: getIMTColor(treatment.imt.category),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {treatment.imt.category}
                      </span>
                    </p>
                  </div>
                )}
                
                <p>Terapi Obat: {treatment.Medication}</p>
                <p>
                  Diagnosis Medis: {treatment.diagnosis.code} -{" "}
                  {treatment.diagnosis.name}
                </p>
                <p>DPJP (Participant): {treatment.participant}</p>
                {treatment.images && treatment.images.length > 0 && (
                  <img
                    src={treatment.images[0]}
                    alt={`Treatment ${treatment.id}`}
                    className="treatment-image"
                    onClick={() => setZoomedImage(treatment.images[0])}
                  />
                )}
              </div>
            ))}
        </div>

        <img
          src="https://firebasestorage.googleapis.com/v0/b/emr-q-b0576.appspot.com/o/IconPatient%2FBtnBack.png?alt=media&token=f35b649d-da7d-4895-a9c7-25a219bf3f32"
          alt="Back to Edit History"
          className="fixed-bottom-left"
          onClick={handleNavigate}
        />

        {zoomedImage && (
          <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
            <img
              src={zoomedImage}
              alt="Zoomed Image"
              className="zoomed-image"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EMR;
