import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./Wa.css";

const ExcelHarian = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(""); // Kosong untuk menampilkan semua data awal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json"
        );

        if (response.data) {
          const allRecords = [];
          Object.entries(response.data).forEach(([patientId, patientData]) => {
            if (patientData.medical_records) {
              Object.entries(patientData.medical_records).forEach(
                ([recordId, recordData]) => {
                  allRecords.push({
                    patient_name: patientData.name || "N/A",
                    patient_whatsapp: patientData.whatsappNumber || "N/A",
                    patient_birthdate: patientData.birthDate || "N/A",
                    ktp: patientData.identifier || "N/A",
                    diagnosa_medis: recordData.diagnosis?.name || "N/A",
                    keluhan: recordData.complaint || "N/A",
                    pemeriksaan_fisik:
                      recordData.condition_physical_examination || "N/A",
                    terapi_obat: recordData.Medication || "N/A",
                    ttv: {
                      systolicBloodPressure:
                        recordData.systolicBloodPressure || "N/A",
                      diastolicBloodPressure:
                        recordData.diastolicBloodPressure || "N/A",
                      heartRate: recordData.heartRate || "N/A",
                      bodyTemperature: recordData.bodyTemperature || "N/A",
                      respiratoryRate: recordData.respiratoryRate || "N/A",
                      bodyWeight: recordData.bodyWeight || "N/A",
                    },
                    timestamp: recordData.timestamp
                      ? new Date(recordData.timestamp)
                      : null,
                  });
                }
              );
            }
          });

          // Sort data berdasarkan timestamp (terbaru di atas)
          allRecords.sort((a, b) => {
            if (!a.timestamp) return 1; // Jika tidak ada timestamp, taruh di bawah
            if (!b.timestamp) return -1;
            return b.timestamp - a.timestamp; // Terbaru ke terlama
          });

          setRecords(allRecords);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const exportToExcel = () => {
    // Flatten the records, separating the TTV data into its own columns
    const flattenedRecords = filteredRecords.map((record) => {
      return {
        ...record,
        systolicBloodPressure: record.ttv?.systolicBloodPressure || "N/A",
        diastolicBloodPressure: record.ttv?.diastolicBloodPressure || "N/A",
        heartRate: record.ttv?.heartRate || "N/A",
        bodyTemperature: record.ttv?.bodyTemperature || "N/A",
        respiratoryRate: record.ttv?.respiratoryRate || "N/A",
        bodyWeight: record.ttv?.bodyWeight || "N/A",
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(flattenedRecords); // Use the flattened data
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medical Records");
  
    // Format nama file
    const fileName = `${filterDate || "All"}_DataPasien.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  

  // Filter data berdasarkan tanggal (jika ada filter)
  const filteredRecords = filterDate
    ? records.filter((record) => {
        if (!record.timestamp) return false; // Skip data tanpa timestamp
        const recordDate = record.timestamp.toISOString().split("T")[0];
        return recordDate === filterDate;
      })
    : records; // Jika tidak ada filter, tampilkan semua data

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="wa-container">
      <h1>Medical Records</h1>
      <label>
        Filter Tanggal:
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="wa-date-input"
          placeholder="Pilih tanggal..."
        />
      </label>
      <button onClick={exportToExcel} className="wa-export-button">
        Download Excel
      </button>
      <div className="wa-table-wrapper">
        <table className="wa-data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pasien</th>
              <th>Diagnosa Medis</th>
              <th>Keluhan</th>
              <th>Pemeriksaan Fisik</th>
              <th>TTV</th>
              <th>Terapi Obat</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <strong>{record.patient_name}</strong>
                  <br />
                  <a
                    href={`https://wa.me/${record.patient_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.patient_whatsapp}
                  </a>
                  <br />
                  <span>
                    Tanggal Lahir: <br />
                    {record.patient_birthdate}
                  </span>
                  <br />
                  <span>NIK: {record.ktp}</span>
                </td>
                <td>{record.diagnosa_medis}</td> {/* Kolom diperbaiki */}
                <td>{record.keluhan}</td>
                <td>{record.pemeriksaan_fisik}</td>
                <td className="wa-ttv-column">
                  <p>
                    <span className="wa-ttv-label">TD:</span>
                    <br />
                    <span className="wa-ttv-data">
                      {record.ttv?.systolicBloodPressure || "N/A"} /{" "}
                      {record.ttv?.diastolicBloodPressure || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="wa-ttv-label">Nadi:</span>
                    <span className="wa-ttv-data">
                      {record.ttv?.heartRate || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="wa-ttv-label">SB:</span>
                    <span className="wa-ttv-data">
                      {record.ttv?.bodyTemperature || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="wa-ttv-label">RR:</span>
                    <span className="wa-ttv-data">
                      {record.ttv?.respiratoryRate || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="wa-ttv-label">BB:</span>
                    <span className="wa-ttv-data">
                      {record.ttv?.bodyWeight || "N/A"}
                    </span>
                  </p>
                </td>
                <td>{record.terapi_obat}</td>
                <td>{record.timestamp?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelHarian;
