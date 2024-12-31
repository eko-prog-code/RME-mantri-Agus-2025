import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import "./EduInfus.css";

const EduSunat = () => {
  const { id } = useParams();
  const [patientName, setPatientName] = useState("Loading...");
  const [relation, setRelation] = useState("");
  const [savedSignatureData, setSavedSignatureData] = useState(null);
  const [giverName, setGiverName] = useState("");
  const [consentData, setConsentData] = useState([]);
  const signatureRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const [metodeSunat, setMetodeSunat] = useState("");
  const [kelainanOrgan, setKelainanOrgan] = useState("");
  const [prosedur, setProsedur] = useState("");
  const [diseaseHistory, setDiseaseHistory] = useState("");
  const [imunisasi, setImunisasi] = useState("");
  const [perdarahan, setPerdarahan] = useState("");

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
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduSunat.json`
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
      "Mencegah infeksi alat kelamin akibat kotoran di area preputium.",
      "Mengurangi risiko infeksi pada pasangan.",
      "Menjaga kesehatan pria secara umum.",
    ],
    risks: [
        "Pendarahan akibat pembuluh darah yang tidak tertutup sempurna.",
        "Infeksi pada luka bekas sunat jika tidak dirawat dengan baik.",
        "Nyeri atau ketidaknyamanan setelah prosedur.",
        "Pembengkakan di area sekitar luka.",
        "Alergi terhadap anestesi yang digunakan.",
        "Adhesi atau penempelan kulit di sekitar luka.",
        "Perdarahan berlebihan pada pasien dengan gangguan pembekuan darah.",
        "Kerusakan jaringan akibat prosedur yang kurang hati-hati.",
        "Masalah estetika pada hasil akhir sunat.",
        "Stenosis meatus akibat jaringan parut setelah sunat.",
        "Trauma psikologis, terutama pada anak tanpa persiapan mental yang memadai.",
      ],
    approve: [
      "Dengan ini, saya menyatakan memberikan persetujuan tindakan medis berupa khitan/sunat kepada anak kami.",
      "Saya memahami manfaat dan pentingnya tindakan sunat, termasuk risiko serta komplikasi yang telah dijelaskan kepada saya. Saya juga bersedia untuk tidak mengajukan tuntutan atau gugatan kepada operator tindakan akibat risiko yang mungkin timbul.",
      "Demikian surat persetujuan ini saya/kami tandatangani dengan penuh kesadaran dan tanpa adanya paksaan dari pihak mana pun.",
    ],
  };
  

  useEffect(() => {
    const fetchConsentData = async () => {
      try {
        const response = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduSunat.json`
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
      metodeSunat,
      kelainanOrgan,
      prosedur,
      diseaseHistory,
      imunisasi,
      perdarahan,
      signatureData: signatureRef.current?.toDataURL(),
      dateTime: new Date().toISOString(),
    };

    try {
      await axios.post(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/EduSunat.json`,
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
      <h2>Form Persetujuan Sunat</h2>
      <h4>Edukasi Sunat Pasien: {patientName}</h4>
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
          <label>Metode Sunat:</label>
          <select
            value={metodeSunat}
            onChange={(e) => setMetodeSunat(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="Konvensional">Konvensional</option>
            <option value="Cauter">Cauter</option>
            <option value="Klamp">Klamp</option>
            <option value="Ring">Ring</option>
            <option value="Stapler">Stapler</option>
          </select>
        </div>

        <div>
          <label>Kelainan pada Organ Vital (di isi oleh tenaga medis):</label>
          <select
            value={kelainanOrgan}
            onChange={(e) => setKelainanOrgan(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="Ada">ADA</option>
            <option value="TIDAK">TIDAK</option>
          </select>
        </div>

        <div>
          <label>Prosedur:</label>
          <select
            value={prosedur}
            onChange={(e) => setProsedur(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="SUDAH">SUDAH</option>
            <option value="BELUM">BELUM</option>
          </select>
        </div>

        <div>
          <label>Riwayat Penyakit seperti Asma, Autisme, dll:</label>
          <select
            value={diseaseHistory}
            onChange={(e) => setDiseaseHistory(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="YA">YA</option>
            <option value="TIDAK">TIDAK</option>
          </select>
        </div>

        <div>
          <label>Imunisasi:</label>
          <select
            value={imunisasi}
            onChange={(e) => setImunisasi(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="LENGKAP">LENGKAP</option>
            <option value="TIDAK LENGKAP">TIDAK LENGKAP</option>
            <option value="TIDAK TAU">TIDAK TAU</option>
          </select>
        </div>

        <div>
          <label>Riwayat Perdarahan Lama:</label>
          <select
            value={perdarahan}
            onChange={(e) => setPerdarahan(e.target.value)}
            required
          >
            <option value="">Pilih</option>
            <option value="YA">YA</option>
            <option value="TIDAK">TIDAK</option>
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
              <th>Edukasi Sunat</th>
              <th>Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {consentData.map((data, index) => (
              <tr key={index} id={`consent-row-${index}`}>
                <td>
                  {new Date(data.dateTime).toLocaleString()} <br />
                  <button
                    onClick={() => handleDownload(data, index)}
                    className="download-button"
                  >
                    Download
                  </button>
                </td>
                <td>
                  <strong>Nama Pasien:</strong> {data.patientName} <br />
                  <strong>Nama Pemberi Persetujuan:</strong> {data.giverName}{" "}
                  <br />
                  <strong>Hubungan:</strong> {data.relation} <br />
                  <br />
                  <strong>Tujuan Sunat:</strong>
                  <ul>
                    {suratPersetujuan.tujuan.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Resiko:</strong>
                  <ul>
                    {suratPersetujuan.risks.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Approve:</strong>
                  <ul>
                    {suratPersetujuan.approve.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <strong>Metode Sunat:</strong> {data.metodeSunat} <br />
                  <strong>Kelainan Organ (di isi oleh tenaga medis):</strong> {data.kelainanOrgan} <br />
                  <strong>Prosedur:</strong> {data.prosedur} <br />
                  <strong>Riwayat Penyakit:</strong> {data.diseaseHistory}{" "}
                  <br />
                  <strong>Riwayat Imunisasi:</strong> {data.imunisasi} <br />
                  <strong>Riwayat Perdarahan Lama:</strong> {data.perdarahan} <br />
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

export default EduSunat;
