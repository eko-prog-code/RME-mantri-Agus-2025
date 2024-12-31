import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import "./EduInfus.css";

const EduInfus = () => {
  const { id } = useParams();
  const [patientName, setPatientName] = useState("Loading...");
  const [relation, setRelation] = useState("");
  const [savedSignatureData, setSavedSignatureData] = useState(null);
  const [giverName, setGiverName] = useState("");
  const [consentData, setConsentData] = useState([]);
  const signatureRef = useRef(null);
  const canvasWrapperRef = useRef(null);

  // Fungsi untuk mendownload row sebagai gambar PNG
  const handleDownload = async (data, index) => {
    const element = document.getElementById(`consent-row-${index}`);
    if (!element) {
      alert("Gagal menemukan elemen untuk diunduh.");
      return;
    }

    try {
      const dataUrl = await toPng(element);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Surat_Persetujuan_${data.patientName}_${new Date(
        data.dateTime
      ).toLocaleDateString()}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Terjadi kesalahan saat mengunduh gambar.");
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  // Fungsi untuk mengambil data pasien
  const fetchPatientData = async () => {
    try {
      const response = await axios.get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
      );
      const patientData = response.data;
      if (patientData && patientData.name) {
        setPatientName(patientData.name);
      } else {
        setPatientName("Nama tidak tersedia");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setPatientName("Gagal memuat nama");
    }
  };

  // Fungsi untuk mengambil data persetujuan edukasi
  const fetchConsentData = async () => {
    try {
      const response = await axios.get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduInfus.json`
      );
      if (response.data) {
        const dataArray = Object.values(response.data).sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
        setConsentData(dataArray);
      }
    } catch (error) {
      console.error("Error fetching consent data:", error);
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchConsentData();
  }, [id]);

  const suratPersetujuan = {
    tujuan: [
      "Memastikan kebutuhan cairan tubuh tercukupi.",
      "Pemberian obat-obatan atau nutrisi secara langsung ke pembuluh darah.",
      "Mempercepat proses pemulihan kesehatan.",
    ],
    risiko: [
      "Bengkak atau pembengkakan pada area pemasangan.",
      "Infeksi pada area pemasangan.",
      "Iritasi atau reaksi alergi terhadap cairan infus.",
      "Hematoma (penumpukan darah di bawah kulit).",
    ],
    kegagalan: [
      "Pembuluh darah sulit ditemukan (terutama pada pasien dengan pembuluh darah kecil atau rapuh).",
      "Gerakan pasien yang menyebabkan jarum infus keluar dari pembuluh darah.",
      "Ketidakstabilan kondisi pasien saat pemasangan.",
    ],
    approve: [
      "Dengan menandatangani surat ini, saya menyatakan bahwa:",
      "Saya telah mendapatkan penjelasan yang cukup dari tenaga medis mengenai prosedur, manfaat, risiko, serta kemungkinan kegagalan pemasangan infus.",
      "Saya memahami bahwa tenaga medis akan berupaya semaksimal mungkin untuk melakukan prosedur ini sesuai standar medis.",
      "Saya memberikan persetujuan tanpa paksaan dari pihak mana pun.",
      "Demikian surat persetujuan ini saya buat dengan sebenar-benarnya",
    ],
  };

  useEffect(() => {
    const fetchConsentData = async () => {
      try {
        const response = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduInfus.json`
        );
        if (response.data) {
          const dataArray = Object.values(response.data).sort(
            (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
          );
          setConsentData(dataArray);
        }
      } catch (error) {
        console.error("Error fetching consent data:", error);
      }
    };
    fetchConsentData();
  }, [id]);

  useEffect(() => {
    // Adjust canvas for device pixel ratio
    const adjustCanvasForDPR = () => {
      const canvas = signatureRef.current?.getCanvas();
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;

        // Scale canvas for higher resolution
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
      }
    };

    adjustCanvasForDPR();
    window.addEventListener("resize", adjustCanvasForDPR);

    return () => {
      window.removeEventListener("resize", adjustCanvasForDPR);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const consent = {
      patientName,
      relation,
      giverName,
      signatureData: signatureRef.current?.toDataURL(),
      dateTime: new Date().toISOString(),
    };

    try {
      await axios.post(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduInfus.json`,
        consent
      );

      // Update state consentData dengan data baru
      setConsentData((prevData) => [consent, ...prevData]);

      alert("Data berhasil disimpan.");
    } catch (error) {
      console.error("Error submitting consent data:", error);
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="eduinfus-container">
      <h2>Form Persetujuan Pemasangan Infus</h2>
      <h4>Edukasi Pemasangan Infus Pasien: {patientName}</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nama Pasien:</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nama Pemberi Persetujuan:</label>
          <input
            type="text"
            value={giverName}
            onChange={(e) => setGiverName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hubungan dengan Pasien:</label>
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            required
          >
            <option value="">Pilih Hubungan</option>
            <option value="Diri Sendiri">Diri Sendiri</option>
            <option value="Anak Saya">Anak Saya</option>
            <option value="Orang Tua Saya">Orang Tua Saya</option>
            <option value="Saudara Kandung">Saudara Kandung</option>
          </select>
        </div>
        <div ref={canvasWrapperRef}>
          <label>Tanda Tangan Digital:</label>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "signature-canvas",
            }}
          />
          <button type="button-acc" onClick={clearSignature}>
            Hapus Tanda Tangan
          </button>
        </div>
        <button type="submit-acc">Kirim Persetujuan</button>
      </form>

      <h3>Data Persetujuan</h3>
      {consentData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Edukasi Infus</th>
              <th>Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {consentData.map((data, index) => (
              <tr key={index} id={`consent-row-${index}`}>
                <td>{new Date(data.dateTime).toLocaleString()} <br />
                <button
                onClick={() => handleDownload(data, index)}
                className="download-button"
              >
                Download
              </button></td>
                <td>
                  <strong>Nama Pasien:</strong> {data.patientName} <br />
                  <strong>Nama Pemberi Persetujuan:</strong> {data.giverName}{" "}
                  <br />
                  <strong>Hubungan:</strong> {data.relation} <br />
                  <br />
                  <strong>Tujuan pemberian terapi infus:</strong>
                  <ul>
                    {suratPersetujuan.tujuan.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Risiko pemasangan infus:</strong>
                  <ul>
                    {suratPersetujuan.risiko.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Faktor-faktor kegagalan pemasangan infus:</strong>
                  <ul>
                    {suratPersetujuan.kegagalan.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Approve:</strong>
                  <ul>
                    {suratPersetujuan.approve.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <img
                    src={data.signatureData}
                    alt="Tanda Tangan"
                    style={{ width: "150px", height: "100px" }}
                  />
                  <br />
                  <strong>{data.giverName}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Belum ada data persetujuan.</p>
      )}
    </div>
  );
};

export default EduInfus;
