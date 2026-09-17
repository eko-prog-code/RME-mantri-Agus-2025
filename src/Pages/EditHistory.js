import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaEdit } from "react-icons/fa";
import { format, differenceInHours } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format lokal Indonesia
import "./EditHistory.css";

function EditHistory() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // State baru untuk menentukan modal mana yang dibuka
  const [searchTerm, setSearchTerm] = useState("");
  const [modalPatients, setModalPatients] = useState([]);
  const [editPatient, setEditPatient] = useState(null);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    medicalRecordNumber: "",
    whatsappNumber: "",
    birthDate: "",
    identifier: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json"
      );
      if (response.data) {
        const patientsWithId = Object.keys(response.data).map((key) => ({
          id: key,
          ...response.data[key],
        }));
        setPatients(patientsWithId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilter = () => {
    const filtered = patients
      .map((patient) => {
        const medicalRecords = Object.entries(patient.medical_records || {});
        const filteredRecords = medicalRecords.filter(([recordId, record]) => {
          // Konversi timestamp ke waktu lokal dengan timezone yang sesuai
          const localDate = new Date(record.timestamp).toLocaleDateString(
            "id-ID",
            {
              timeZone: "Asia/Jakarta", // Sesuaikan dengan zona waktu Anda
            }
          );
          return (
            localDate ===
            new Date(filterDate).toLocaleDateString("id-ID", {
              timeZone: "Asia/Jakarta",
            })
          );
        });

        if (filteredRecords.length > 0) {
          return {
            ...patient,
            medical_records: Object.fromEntries(filteredRecords),
            usia: calculateAge(patient.birthDate, filterDate),
          };
        } else {
          return null;
        }
      })
      .filter((patient) => patient !== null);

    setFilteredPatients(filtered);
  };

  const handleSearch = () => {
    const results = patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setModalPatients(results);
  };

  const handleEdit = (patient) => {
    setEditPatient(patient);
    setIsModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (editPatient) {
      try {
        await axios.put(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${editPatient.id}.json`,
          editPatient
        );
        setIsModalOpen(false);
        fetchData();
      } catch (error) {
        console.error("Error updating data:", error);
      }
    }
  };

  const calculateNextMedicalRecordNumber = (patientData) => {
    if (!patientData || typeof patientData !== "object") {
      return "000001";
    }
    let maxNumber = 0;
    const list = Array.isArray(patientData) ? patientData : Object.values(patientData);
    list.forEach((patient) => {
      if (!patient) return;
      const mrn = patient.number_medical_records || patient.medicalRecordNumber;
      if (mrn) {
        const cleanStr = String(mrn).trim();
        const parsed = parseInt(cleanStr, 10);
        if (!isNaN(parsed) && parsed < 1000000 && cleanStr.length <= 8) {
          if (parsed > maxNumber) {
            maxNumber = parsed;
          }
        }
      }
    });
    const nextNumber = maxNumber + 1;
    return String(nextNumber).padStart(6, "0");
  };

  const toggleModal = async (type) => {
    setModalType(type);
    setIsModalOpen(true);
    if (type === "register") {
      if (patients && patients.length > 0) {
        setNewPatientData((prev) => ({
          ...prev,
          medicalRecordNumber: calculateNextMedicalRecordNumber(patients),
        }));
      }
      try {
        const response = await axios.get(
          "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json"
        );
        if (response.data) {
          setNewPatientData((prev) => ({
            ...prev,
            medicalRecordNumber: calculateNextMedicalRecordNumber(response.data),
          }));
        }
      } catch (err) {
        console.error("Gagal memuat rekam medis terakhir:", err);
      }
    }
  };

  const submitNewPatient = async () => {
    try {
      // Set waktu ke tengah hari untuk menghindari pergeseran tanggal karena timezone
      if (selectedDate) {
        selectedDate.setHours(12, 0, 0, 0);
      }
      const response = await axios.post(
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json",
        {
          ...newPatientData,
          number_medical_records: newPatientData.medicalRecordNumber,
          birthDate: selectedDate?.toISOString().split("T")[0] || "",
          timestamp: new Date().toISOString(),
        }
      );
      const newPatientId = response.data.name;
      setIsModalOpen(false);
      setNewPatientData({
        name: "",
        medicalRecordNumber: "",
        whatsappNumber: "",
        birthDate: "",
        identifier: "",
      });
      setSelectedDate(null);
      window.location.href = `/emr/${newPatientId}`;
    } catch (error) {
      console.error("Error adding new patient:", error);
    }
  };

  const calculateAge = (dob, filterDate) => {
    const dobDate = new Date(dob);
    const filter = new Date(filterDate);
    let years = filter.getFullYear() - dobDate.getFullYear();
    let months = filter.getMonth() - dobDate.getMonth();
    let days = filter.getDate() - dobDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(filter.getFullYear(), filter.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  };

  return (
    <div className="EditHistory-container">
      {/* Filter Date Section */}
      <div className="EditHistory-input-container">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* Buttons for Modals */}
      <div className="EditHistory-buttons">
        <button
          className="add-patient-button"
          onClick={() => toggleModal("search")}
        >
          +Pasien
        </button>
        <button
          className="register-patient-button"
          onClick={() => toggleModal("register")}
        >
          +Register
        </button>
      </div>

      {/* Modal Section */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-modal-button"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
            {modalType === "search" ? (
              <div>
                <h3>Cari Pasien</h3>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari nama pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Cari</button>
                <div className="patient-cards-container">
                  {modalPatients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                      <div className="patient-info">
                        <p>Nama: {patient.name}</p>
                        <p>Tanggal Lahir: {patient.birthDate}</p>
                      </div>
                      <Link
                        to={`/emr/${patient.id}/tambah-pengobatan`}
                        className="view-emr-button"
                      >
                        Tambah Berobat
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              modalType === "register" && (
                <div>
                  <h3>Register Pasien Baru</h3>
                  <input
                    type="text"
                    className="new-patient-input"
                    placeholder="Nama Pasien"
                    value={newPatientData.name}
                    onChange={(e) =>
                      setNewPatientData({
                        ...newPatientData,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="new-patient-input"
                    placeholder="NIK Pasien Baru"
                    value={newPatientData.identifier}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                      setNewPatientData({
                        ...newPatientData,
                        identifier: numericValue,
                      });
                    }}
                  />
                  <input
                    type="text"
                    className="new-patient-input"
                    placeholder="Nomor Rekam Medis"
                    value={newPatientData.medicalRecordNumber}
                    onChange={(e) =>
                      setNewPatientData({
                        ...newPatientData,
                        medicalRecordNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <input
                    type="tel"
                    className="new-patient-input"
                    placeholder="Nomor WhatsApp"
                    value={newPatientData.whatsappNumber}
                    onChange={(e) =>
                      setNewPatientData({
                        ...newPatientData,
                        whatsappNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <DatePicker
                    className="new-patient-input"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(new Date(date))}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Pilih Tanggal Lahir"
                    locale="id"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={60}
                    showMonthDropdown
                  />
                  <button
                    className="submit-patient-button"
                    onClick={submitNewPatient}
                  >
                    Submit
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Patient List Section */}
      <ul className="EditHistory-patient-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <li key={patient.id} className="EditHistory-patient-item">
              <h3>{patient.name}</h3>
              <p>
                Usia:{" "}
                {`${patient.usia.years} Tahun, ${patient.usia.months} Bulan, ${patient.usia.days} Hari`}
              </p>
              <ul>
                {Object.entries(patient.medical_records || {}).map(
                  ([recordId, record]) => (
                    <li key={recordId}>
                      <Link
                        to={`/update-treatment/${patient.id}/${recordId}`}
                        state={{
                          timestamp: record.timestamp,
                        }}
                      >
                        <FaEdit className="edit-icon" />
                      </Link>

                      <p>
                        Tanggal dan Waktu Berobat:{" "}
                        {format(
                          new Date(record.timestamp),
                          "dd MMMM yyyy HH:mm:ss"
                        )}
                      </p>

                      <p>Keluhan: {record.complaint}</p>
                      <p>
                        Pemeriksaan Fisik:{" "}
                        {record.condition_physical_examination}
                      </p>
                      <p>Diagnosa Medis: {record.diagnosis.name}</p>
                      <p>Terapi Obat: {record.Medication}</p>
                    </li>
                  )
                )}
              </ul>
            </li>
          ))
        ) : (
          <p>No records found for the selected date.</p>
        )}
      </ul>
    </div>
  );
}

export default EditHistory;
