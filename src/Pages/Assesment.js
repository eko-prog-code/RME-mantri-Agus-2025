import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import "./Soap.css";

const Assesment = () => {
  const { id } = useParams();
  const [dateTime, setDateTime] = useState(new Date());
  const [keluhan, setKeluhan] = useState("");
  const [familyHistoryOfDisease, setFamilyHistoryOfDisease] = useState("");
  const [resikoJatuh, setResikoJatuh] = useState("");
  const [painScale, setPainScale] = useState("");
  const [medicalStaff, setMedicalStaff] = useState("");
  const [weight, setWeight] = useState(""); // Berat badan (kg)
  const [height, setHeight] = useState(""); // Tinggi badan (cm)
  const [IMT, setIMT] = useState(null); // Indeks Massa Tubuh
  const [dependency, setDependency] = useState("");
  const [psychologicalHistory, setPsychologicalHistory] = useState("");
  const [socialStatus, setSocialStatus] = useState("");
  const [nursingAction, setNursingAction] = useState("");
  const [assNotes, setAssNotes] = useState([]);
  const [patientName, setPatientName] = useState("Loading...");
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Fetch patient details to get the patient name
        const patientResponse = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
        );
        const patientData = patientResponse.data;
        if (patientData) {
          setPatientName(patientData.name || "No name available");
        } else {
          setPatientName("No name available");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setPatientName("Error loading name");
      }
    };

    const fetchAssNotes = async () => {
      try {
        const response = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Assesment.json`
        );
        const data = response.data;
        if (data) {
          const notesArray = Object.keys(data).map((key) => {
            const note = data[key];
            return {
              id: key,
              ...note,
              dateTime: new Date(note.dateTime), // Ensure dateTime is a Date object
            };
          });
          notesArray.sort((a, b) => b.dateTime - a.dateTime); // Newest first
          setAssNotes(notesArray);
        } else {
          setAssNotes([]);
        }
      } catch (error) {
        console.error("Error fetching SOAP notes:", error);
        setAssNotes([]);
      }
    };

    fetchPatientData();
    fetchAssNotes();
  }, [id]);

  const handleDateTimeChange = (event) => {
    setDateTime(new Date(event.target.value));
  };

  const handleIMTCalculation = () => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const imtResult = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      setIMT({ value: imtResult, category: getIMTCategory(imtResult) });
    } else {
      setIMT(null);
    }
  };

  useEffect(() => {
    handleIMTCalculation();
  }, [weight, height]);

  const getIMTCategory = (imt) => {
    if (imt < 18.5) return "Berat Badan Kurang";
    if (imt >= 18.5 && imt < 24.9) return "Berat Badan Normal";
    if (imt >= 25 && imt < 27) return "Kelebihan Berat Badan";
    if (imt >= 27 && imt < 30) return "Beresiko Menjadi Obesitas";
    if (imt >= 30 && imt < 35) return "Obesitas I";
    if (imt >= 35) return "Obesitas II";
    return "Tidak Valid";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      dateTime: dateTime.toISOString(),
      keluhan,
      familyHistoryOfDisease,
      resikoJatuh,
      painScale,
      weight,
      height,
      IMT,
      dependency,
      psychologicalHistory,
      socialStatus,
      nursingAction,
      medicalStaff,
    };

    try {
      await axios.post(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Assesment.json`,
        dataToSend
      );
      // Refresh the list after submitting
      const response = await axios.get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Assesment.json`
      );
      const data = response.data;
      if (data) {
        const notesArray = Object.keys(data).map((key) => {
          const note = data[key];
          return {
            id: key,
            ...note,
            dateTime: new Date(note.dateTime), // Ensure dateTime is a Date object
          };
        });
        notesArray.sort((a, b) => b.dateTime - a.dateTime);
        setAssNotes(notesArray);
      }
      setKeluhan("");
      setFamilyHistoryOfDisease("");
      setResikoJatuh("");
      setPainScale("");
      setWeight("");
      setHeight("");
      setIMT(null);
      setDependency("");
      setPsychologicalHistory("");
      setSocialStatus("");
      setNursingAction("");
      setMedicalStaff("");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const formatDateTime = (dateTime) => {
    try {
      return format(dateTime, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return (
    <div className="soap-container">
      <h2>Assesment Notes for {patientName}</h2>
      <button onClick={toggleForm} className="toggle-form-button">
        {showForm ? "Tutup Form" : "Buat Assesment"}
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
            <label>Keluhan:</label>
            <textarea
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Riwayat Penyakit Keluarga:</label>
            <textarea
              value={familyHistoryOfDisease}
              onChange={(e) => setFamilyHistoryOfDisease(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Resiko Jatuh:</label>
            <select
              value={resikoJatuh}
              onChange={(e) => setResikoJatuh(e.target.value)}
              required
            >
              <option value="">Pilih Resiko Jatuh</option>
              <option value="Tidak Beresiko, Skor: 0">
                Tidak Beresiko - Skor: 0
              </option>
              <option value="Resiko Rendah, Skor: 1">
                Resiko Rendah - Skor: 1
              </option>
              <option value="Resiko Tinggi, Skor: 2">
                Resiko Tinggi - Skor: 2
              </option>
            </select>
          </div>
          <div>
            <label>Skala Nyeri:</label>
            <select
              value={painScale}
              onChange={(e) => setPainScale(e.target.value)}
              required
            >
              <option value="">Pilih Skala Nyeri</option>
              <option value="Nyeri Ringan, Skor: 1-3">
                Nyeri Ringan - Skor: 1-3
              </option>
              <option value="Nyeri Sedang, Skor: 4-7">
                Nyeri Sedang - Skor: 4-7
              </option>
              <option value="Nyeri Berat, Skor: 8-10">
                Nyeri Berat - Skor: 8-10
              </option>
            </select>
          </div>

          <div>
            <label>Berat Badan (kg):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label>Tinggi Badan (cm):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          {IMT && (
            <div>
              <strong>Hasil IMT:</strong> {IMT.value} ({IMT.category})
            </div>
          )}

          <div>
            <label>Ketergantungan:</label>
            <select
              value={dependency}
              onChange={(e) => setDependency(e.target.value)}
              required
            >
              <option value="">Pilih Ketergantungan</option>
              <option value="Tidak ada">Tidak ada</option>
              <option value="Obat-obatan">Obat-obatan</option>
              <option value="Rokok">Rokok</option>
              <option value="Alkohol">Alkohol</option>
            </select>
          </div>

          <div>
            <label>Riwayat Psikologi:</label>
            <select
              value={psychologicalHistory}
              onChange={(e) => setPsychologicalHistory(e.target.value)}
              required
            >
              <option value="">Pilih Riwayat Psikologi</option>
              <option value="Cemas">Cemas</option>
              <option value="Takut">Takut</option>
              <option value="Sedih">Sedih</option>
            </select>
          </div>

          <div>
            <label>Status Sosial:</label>
            <select
              value={socialStatus}
              onChange={(e) => setSocialStatus(e.target.value)}
              required
            >
              <option value="">Pilih Status Sosial</option>
              <option value="Tidak Baik">Tidak Baik</option>
              <option value="Baik kepada Kerabat">Baik kepada Kerabat</option>
            </select>
          </div>

          <div>
            <label>Tindakan Keperawatan:</label>
            <select
              value={nursingAction}
              onChange={(e) => setNursingAction(e.target.value)}
              required
            >
              <option value="">Pilih Tindakan Keperawatan</option>
              <option value="Diagnosa Management Penyakit">
                Diagnosa Management Penyakit
              </option>
              <option value="Terapi">Terapi</option>
              <option value="Diet Nutrisi">Diet Nutrisi</option>
              <option value="Tindakan Keperawatan">Tindakan Keperawatan</option>
              <option value="Rehabilitasi">Rehabilitasi</option>
              <option value="Management Nyeri">Management Nyeri</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label>Nama Petugas Medis:</label>
            <select
              value={medicalStaff}
              onChange={(e) => setMedicalStaff(e.target.value)}
              required
            >
              <option value="">Pilih Tenaga Medis</option>
              <option value="Ns. Agus kostaman achyar">
                Ns. Agus kostaman achyar
              </option>
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
            <th>Assesment Awal</th>
            <th>Petugas Medis</th>
          </tr>
        </thead>
        <tbody>
          {assNotes.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                Tidak ada catatan Assesment yang tersedia.
              </td>
            </tr>
          ) : (
            assNotes.map((note) => (
              <tr key={note.id}>
                <td>{formatDateTime(note.dateTime)}</td>
                <td className="soap-details">
                  <div>
                    <strong>Keluhan:</strong> {note.keluhan}
                  </div>
                  <div>
                    <strong>Riwayat Penyakit Keluarga:</strong>{" "}
                    {note.familyHistoryOfDisease}
                  </div>
                  <div>
                    <strong>Resiko Jatuh:</strong> {note.resikoJatuh}
                  </div>
                  <div>
                    <strong>Skala Nyeri:</strong> {note.painScale}
                  </div>
                  <div>
                    <strong>Berat Badan:</strong> {note.weight} kg
                  </div>
                  <div>
                    <strong>Tinggi Badan:</strong> {note.height} cm
                  </div>
                  <div>
                    <strong>IMT:</strong> {note.IMT?.value} (
                    {note.IMT?.category})
                  </div>
                  <div>
                    <strong>Ketergantungan pada:</strong> {note.dependency}
                  </div>
                  <div>
                    <strong>Riwayat Psikologi:</strong>{" "}
                    {note.psychologicalHistory}
                  </div>
                  <div>
                    <strong>Status Sosial:</strong>{" "}
                    <span
                      style={{
                        color:
                          note.socialStatus === "Tidak Baik"
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {note.socialStatus}
                    </span>
                  </div>
                  <div>
                    <strong>Nursing Action:</strong> {note.nursingAction}
                  </div>
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

export default Assesment;
