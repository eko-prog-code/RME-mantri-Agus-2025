import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { format, differenceInHours } from "date-fns";
import { Tabs, Tab } from "@mui/material";
import "./EMR.css";

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
  const [latestIMT, setLatestIMT] = useState(null);

  const isEditable = (timestamp) => {
    const hoursDifference = differenceInHours(new Date(), new Date(timestamp));
    return hoursDifference <= 24;
  };

  const handleNavigate = () => {
    navigate("/edithistory");
  };

  const getLatestIMT = (treatmentsData) => {
    if (!treatmentsData || treatmentsData.length === 0) return null;
    
    const treatmentsWithIMT = treatmentsData.filter(t => t.imt && t.imt.value);
    if (treatmentsWithIMT.length === 0) return null;
    
    const sorted = treatmentsWithIMT.sort((a, b) => b.timestamp - a.timestamp);
    return sorted[0].imt;
  };

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

  const getIMTColor = (category) => {
    switch(category) {
      case 'Normal': return '#28a745';
      case 'Kurus': return '#ffc107';
      case 'Gemuk': return '#ff9800';
      case 'Obesitas': return '#dc3545';
      default: return '#6c757d';
    }
  };

  useEffect(() => {
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
        
        const latestIMTData = getLatestIMT(treatmentsArray);
        setLatestIMT(latestIMTData);
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
        
        const latestIMTData = getLatestIMT(updatedTreatments);
        setLatestIMT(latestIMTData);
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
            <div class="biodata-card">
              <div class="emotion-icon">😊</div>
              <div className="edit-bio-wrapper">
                <Link to={`/emr/${id}/edit-bio`}>
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/emr-q-b0576.appspot.com/o/edit-icon.png?alt=media&token=be7db1f8-4aea-4417-a312-9ee84b74654a"
                    alt="Edit Bio"
                    className="EditBio-unix23288"
                  />
                </Link>
              </div>
              <p>Nama : {patientDetails.name}</p>
              <p>Tanggal Lahir: {patientDetails.birthDate}</p>
              <p>No KTP: {patientDetails.identifier}</p>
              <p>No Rekam Medis: {patientDetails.number_medical_records}</p>
              <p>Alamat: {patientDetails.patientAddress}</p>
              <p>No Wa: {patientDetails.whatsappNumber}</p>
              <p>Alergi: {allergies}</p>
              <p>Riwayat Kesehatan: {healthHistory}</p>
              
              {latestIMT && latestIMT.value && (
                <div className="imt-latest-display" style={{
                  marginTop: '6px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  borderLeft: `3px solid ${getIMTColor(latestIMT.category)}`,
                  fontSize: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '12px' }}>📊</span>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>IMT:</span>
                    <strong style={{ fontSize: '13px' }}>{latestIMT.value}</strong>
                    <span style={{ 
                      color: getIMTColor(latestIMT.category),
                      fontWeight: 'bold',
                      padding: '0px 8px',
                      borderRadius: '10px',
                      backgroundColor: `${getIMTColor(latestIMT.category)}20`,
                      fontSize: '10px'
                    }}>
                      {latestIMT.category}
                    </span>
                    <span style={{ 
                      fontSize: '9px', 
                      color: '#6c757d',
                      marginLeft: 'auto'
                    }}>
                      terbaru
                    </span>
                  </div>
                </div>
              )}

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
              <Tab label="Edukasi Pemasangan Infus" className="responsive-tab" />
              <Tab label="Persetujuan Sunat" className="responsive-tab" />
              <Tab label="Penolakan Tindakan Medis" className="responsive-tab" />
              <Tab label="Surat Delegasi" className="responsive-tab" />
            </Tabs>
          </div>
          <Link to={`/emr/${id}/tambah-pengobatan`}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/HomeButton%2Fberobat-plus.webp?alt=media&token=fa0a53ac-85e0-4a5c-bd65-5df65de7b6f6"
              alt="Tambah Pengobatan"
              className="tambah-button"
            />
            <h3 className="treatment-history">Riwayat Pengobatan</h3>
          </Link>

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

                <Link to={`/emr/${id}/update-treatment/${treatment.id}`}
                state={{
                  timestamp: treatment.timestamp,
                }}>
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
                <p>SystolicBloodPressure: {treatment.systolicBloodPressure}</p>
                <p>DiastolicBloodPressure: {treatment.diastolicBloodPressure}</p>
                <p>HeartRate: {treatment.heartRate}</p>
                <p>BodyTemperature: {treatment.bodyTemperature}</p>
                <p>RespiratoryRate: {treatment.respiratoryRate}</p>
                <p>Body Weight: {treatment.bodyWeight}</p>
                <p>Body Height: {treatment.bodyHeight || 'Tidak diisi'}</p>
                
                {treatment.imt && treatment.imt.value && (
                  <div className="imt-treatment-display" style={{
                    marginTop: '4px',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    backgroundColor: '#e9ecef',
                    fontSize: '11px',
                    display: 'inline-block'
                  }}>
                    <span style={{ marginRight: '4px' }}>📊</span>
                    IMT: <strong>{treatment.imt.value}</strong>
                    <span style={{ 
                      color: getIMTColor(treatment.imt.category),
                      fontWeight: 'bold',
                      marginLeft: '4px',
                      fontSize: '10px'
                    }}>
                      {treatment.imt.category}
                    </span>
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
