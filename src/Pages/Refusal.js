import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import "./Refusal.css";

const Refusal = () => {
  const { id } = useParams();
  const [patientName, setPatientName] = useState("Loading...");
  const [relation, setRelation] = useState("");
  const [savedSignatureData, setSavedSignatureData] = useState(null);
  const [giverName, setGiverName] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [consentData, setConsentData] = useState([]);
  const signatureRef = useRef(null);
  const witnessSignatureRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const [reasonRefusal, setReasonRefusal] = useState("");
  const [kondisiPasien, setKondisiPasien] = useState("");

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
      link.download = `Surat_Penolakan_Medis_${data.patientName}_${new Date(
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
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Refusal.json`
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

  const suratPenolakan = {
    refusal: [
      "Dengan ini, saya menyatakan menolak tindakan medis berupa perawatan lebih lanjut kepada pasien.",
      "Saya memahami perlunya tindakan medis dan perawatan lanjutan, yang telah dijelaskan oleh tenaga medis, termasuk risiko yang mungkin terjadi. Namun, kami tetap menolak.",
      "Saya tidak akan menuntut atau menggugat tenaga medis atas tindakan dan risiko yang mungkin ditimbulkan akibat keputusan ini.",
      "Demikian surat penolakan ini saya/kami tandatangani dengan penuh kesadaran dan tanpa adanya paksaan dari pihak mana pun.",
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const consent = {
      patientName,
      relation,
      giverName,
      witnessName,
      reasonRefusal,
      kondisiPasien,
      witnessSignatureData: witnessSignatureRef.current?.toDataURL(), // Add witness signature data
      signatureData: signatureRef.current?.toDataURL(),
      dateTime: new Date().toISOString(),
    };

    try {
      await axios.post(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Refusal.json`,
        consent
      );

      // Update state consentData dengan data baru
      setConsentData((prevData) => [consent, ...prevData]);

      alert("Data berhasil disimpan.");
    } catch (error) {
      console.error("Error submitting consent data:", error);
    }
  };

  const clearSignature = (ref) => {
    ref.current?.clear();
  };

  return (
    <div className="eduinfus-container">
      <h2>Form Penolakan Tindakan Medis</h2>
      <h4>Penolakan Tindakan Medis Pasien: {patientName}</h4>
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
       
        <div>
          <label>Alasan Penolakan:</label>
          <input
            type="text"
            value={reasonRefusal}
            onChange={(e) => setReasonRefusal(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Nama Saksi:</label>
          <input
            type="text"
            value={witnessName}
            onChange={(e) => setWitnessName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Kondisi Pasien:</label>
          <select
            value={kondisiPasien}
            onChange={(e) => setKondisiPasien(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="Penurunan Kesadaran">Penurunan Kesadaran</option>
            <option value="Riwayat Kejang">Riwayat Kejang</option>
            <option value="Membutuhkan pemeriksaan penunjang medis yang lengkap">
              Membutuhkan pemeriksaan penunjang medis yang lengkap
            </option>
            <option value="Kondisi Darurat Medis">Kondisi Darurat Medis</option>
            <option value="Infeksi Berat">Infeksi Berat</option>
            <option value="Gangguan Pernapasan">Gangguan Pernapasan</option>
            <option value="Perdarahan Berat">Perdarahan Berat</option>
            <option value="Kondisi Kronis yang Memburuk">
              Kondisi Kronis yang Memburuk
            </option>
            <option value="Nyeri yang Tak Tertahankan">
              Nyeri yang Tak Tertahankan
            </option>
            <option value="Tanda-tanda Vital Tidak Stabil">
              Tanda-tanda Vital Tidak Stabil
            </option>
            <option value="Reaksi Alergi Berat">Reaksi Alergi Berat</option>
            <option value="Gangguan Mental Akut">Gangguan Mental Akut</option>
            <option value="Kecelakaan atau Cedera">
              Kecelakaan atau Cedera
            </option>
            <option value="Dehidrasi">Dehidrasi</option>
            <option value="Ketidakseimbangan Elektrolit">
              Ketidakseimbangan Elektrolit
            </option>
            <option value="Pasca Operasi">Pasca Operasi</option>
            <option value="Syok Hipovolemik">Syok Hipovolemik</option>
            <option value="Penanganan Keracunan">Penanganan Keracunan</option>
            <option value="Malnutrisi">Malnutrisi</option>
            {/* Other options... */}
          </select>
        </div>
        <div ref={canvasWrapperRef}>
          <label>Tanda Tangan Digital Pemberi Persetujuan:</label>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "signature-canvas",
            }}
          />
          <button
            className="clear-signature-btn"
            type="button"
            onClick={() => clearSignature(signatureRef)}
          >
            Hapus Tanda Tangan
          </button>
        </div>

        {/* Witness Signature Section */}
        <div ref={canvasWrapperRef}>
          <label>Tanda Tangan Digital Saksi:</label>
          <SignatureCanvas
            ref={witnessSignatureRef}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "signature-canvas",
            }}
          />
          <button
            className="clear-signature-btn"
            type="button"
            onClick={() => clearSignature(witnessSignatureRef)}
          >
            Hapus Tanda Tangan
          </button>
        </div>

        <button class="kirim-penolakan-btn" type="submit">
          Kirim Penolakan Medis
        </button>
      </form>

      <h3>Data Penolakan Medis</h3>
      {consentData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Pernyataan Penolakan Medis</th>
              <th>Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {consentData.map((data, index) => (
              <tr key={index} id={`consent-row-${index}`}>
                <td>
                  {new Date(data.dateTime).toLocaleString()} <br />
                  <button onClick={() => handleDownload(data, index)}>
                    Download
                  </button>
                </td>
                <strong>Nama Pasien:</strong> {data.patientName} <br />
                <strong>Nama Pemberi Persetujuan:</strong> {data.giverName}{" "}
                <br />
                <strong>Hubungan:</strong> {data.relation} <br />
                <strong>Nama Saksi:</strong> {data.witnessName} <br />
                <br />
                <strong>Pernyataan Penolakan:</strong>
                <ul>
                  {suratPenolakan.refusal.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <strong>Alasan Menolak:</strong> {data.reasonRefusal} <br />
                <strong>Kondisi Pasien:</strong> {data.kondisiPasien} <br />
                <td>
                  <img
                    src={data.signatureData}
                    alt="Signature"
                    style={{ maxWidth: "200px", maxHeight: "100px" }}
                  />
                  <br />
                  <strong>{data.giverName}</strong>
                  <br />
                  <br />
                  <img
                    src={data.witnessSignatureData}
                    alt="Witness Signature"
                    style={{ maxWidth: "200px", maxHeight: "100px" }}
                  />
                  <br />
                  <strong>{data.witnessName}</strong>{" "}
                  {/* Display witness signature */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default Refusal;
