import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import "./Delegasi.css";

const Delegasi = () => {
  const { id } = useParams();
  const [patientName, setPatientName] = useState("Loading...");
  const [patientAge, setPatientAge] = useState("");
  const [patientDiagnosis, setPatientDiagnosis] = useState("");
  const [actions, setActions] = useState(["", "", "", "", ""]);
  const [savedDelegationData, setSavedDelegationData] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Signature refs
  const doctorSignatureRef = useRef(null);
  const nurseSignatureRef = useRef(null);
  const letterRef = useRef(null);

  // Doctor information (hardcoded based on document)
  const doctorInfo = {
    name: "dr. Audri Rizky Utami",
    workplace: "Rs. Immanuel Bandung",
    position: "dr Umum",
    licenseNumber: "0014/IPFK-DU-HERR/VI/2025/DPMPTSP"
  };

  // Nurse information (hardcoded based on document)
  const nurseInfo = {
    name: "Agus Kostaman Achyar, S.Kep., Ners.C.Sk",
    workplace: "Kp. Ciburial Rt 003 Rw 013 Desa Cibogo Lembang",
    position: "Perawat level 7 ( Ners )",
    licenseNumber: "446/8/SIPP.M/DPMPTSP/VI/2023",
    email: "aguscostaman@gmail.com",
    phone: "082117855853"
  };

  useEffect(() => {
    fetchPatientData();
    setCurrentDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const response = await axios.get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
      );
      const patientData = response.data;
      if (patientData && patientData.name) {
        setPatientName(patientData.name);
        
        // Calculate age from birthDate if available
        if (patientData.birthDate) {
          const birthDate = new Date(patientData.birthDate);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          setPatientAge(age + " tahun");
        }
      } else {
        setPatientName("Nama tidak tersedia");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setPatientName("Gagal memuat nama");
    }
  };

  const fetchDelegationData = async () => {
    try {
      const response = await axios.get(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Delegation.json`
      );
      if (response.data) {
        const dataArray = Object.entries(response.data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setSavedDelegationData(dataArray);
      } else {
        setSavedDelegationData([]); // Reset jika tidak ada data
      }
    } catch (error) {
      console.error("Error fetching delegation data:", error);
      setSavedDelegationData([]); // Reset jika error
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchDelegationData();
  }, [id]);

  const handleActionChange = (index, value) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  const handleDownloadLetter = async (data) => {
    if (!letterRef.current) {
      alert("Gagal menemukan elemen untuk diunduh.");
      return;
    }

    try {
      const dataUrl = await toPng(letterRef.current, {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Surat_Pelimpahan_Wewenang_${data.patientName}_${new Date(
        data.dateTime
      ).toLocaleDateString('id-ID')}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Terjadi kesalahan saat mengunduh gambar.");
    }
  };

  const handleViewLetter = (data) => {
    setSelectedDelegation(data);
    setShowModal(true);
  };

  const handleDeleteDelegation = async (delegationId) => {
    const isConfirmed = window.confirm("Apakah Anda yakin akan menghapus surat pelimpahan wewenang ini?");
    if (!isConfirmed) return;

    // Set loading state untuk card yang dihapus
    setIsDeleting(delegationId);

    try {
      // Hapus dari Firebase
      await axios.delete(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Delegation/${delegationId}.json`
      );

      // Update state lokal - filter out item yang dihapus
      setSavedDelegationData(prevData => 
        prevData.filter(item => item.id !== delegationId)
      );

      alert("Surat pelimpahan wewenang berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting delegation data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      // Reset loading state
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty actions
    const filteredActions = actions.filter(action => action.trim() !== "");

    // Validasi: minimal ada 1 tindakan
    if (filteredActions.length === 0) {
      alert("Harap isi minimal satu tindakan yang dilimpahkan.");
      return;
    }

    // Validasi: tanda tangan harus ada
    if (!doctorSignatureRef.current?.isEmpty() === false || !nurseSignatureRef.current?.isEmpty() === false) {
      alert("Harap berikan tanda tangan dokter dan perawat.");
      return;
    }

    const delegationData = {
      patientName,
      patientAge,
      patientDiagnosis,
      actions: filteredActions,
      doctorSignatureData: doctorSignatureRef.current?.toDataURL(),
      nurseSignatureData: nurseSignatureRef.current?.toDataURL(),
      dateTime: new Date().toISOString(),
    };

    try {
      await axios.post(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/Delegation.json`,
        delegationData
      );

      // Update state dengan new data
      await fetchDelegationData(); // Refresh data dari Firebase

      alert("Surat pelimpahan wewenang berhasil disimpan.");
      
      // Reset form
      setActions(["", "", "", "", ""]);
      setPatientDiagnosis("");
      clearSignature(doctorSignatureRef);
      clearSignature(nurseSignatureRef);
      setShowForm(false);
      
    } catch (error) {
      console.error("Error submitting delegation data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const clearSignature = (ref) => {
    ref.current?.clear();
  };

  const ProfessionalLetter = ({ data }) => (
    <div ref={letterRef} className="professional-letter">
      {/* Kop Surat dengan Logo */}
      <div className="letter-header">
        <div className="header-logos">
          <img 
            src="/ppni.png" 
            alt="PPNI" 
            className="logo left-logo"
          />
          <div className="header-center">
            <h2>PRAKTEK KEPERAWATAN MANDIRI</h2>
            <h3>AGUS KOSTAMAN ACHYAR, S.Kep., Ners.C.Sk</h3>
            <p>Nomor : 446/8/SIPP.M/DPMPTSP/VI/2023</p>
            <p>Kp.Ciburial Rt 003 Rw 013 Desa Cibogo Lembang</p>
            <p>Email : aguscostaman@gmail.com Tlp.082117855853</p>
          </div>
          <img 
            src="/logoAgusRME.png" 
            alt="Logo Agus RME" 
            className="logo right-logo"
          />
        </div>
      </div>

      {/* Judul Surat */}
      <div className="letter-title">
        <h2>SURAT PELIMPAHAN WEWENANG DELEGATIF</h2>
        <h3>KEPADA PERAWAT</h3>
      </div>

      <div className="letter-content">
        <p className="opening">Yang bertanda tangan dibawah ini,</p>
        
        <div className="doctor-info">
          <p><strong>Nama</strong> : {doctorInfo.name}</p>
          <p><strong>Tempat praktek</strong> : {doctorInfo.workplace}</p>
          <p><strong>Jabatan</strong> : {doctorInfo.position}</p>
        </div>

        <p className="delegation-statement">
          Pada hari ini, <strong>{currentDate.split(',')[0]}</strong> tanggal{" "}
          <strong>{currentDate.split(',')[1]}</strong>. Kepada perawat :
        </p>

        <div className="nurse-info">
          <p><strong>Nama</strong> : {nurseInfo.name}</p>
          <p><strong>Tempat praktek</strong> : {nurseInfo.workplace}</p>
          <p><strong>Jabatan</strong> : {nurseInfo.position}</p>
        </div>

        <p className="delegation-action">
          Melimpahkan wewenang dalam hal tindakan berupa :
        </p>

        <div className="actions-list">
          {data.actions.map((action, index) => (
            <p key={index} className="action-item">
              {index + 1}. {action}
            </p>
          ))}
        </div>

        <p className="patient-info-title">
          Untuk dilakukan /diberikan kepada pasien/klien :
        </p>

        <div className="patient-info">
          <p><strong>Nama</strong> : {data.patientName}</p>
          <p><strong>Usia</strong> : {data.patientAge}</p>
          <p><strong>Diagnosa</strong> : {data.patientDiagnosis}</p>
        </div>

        <p className="closing">
          Demikian atas perhatiannya saya ucapkan terima kasih.
        </p>

        <div className="signatures">
          <div className="signature-column">
            <div className="signature-box">
              {data.nurseSignatureData && (
                <img 
                  src={data.nurseSignatureData} 
                  alt="Nurse Signature" 
                  className="signature-image-letter"
                />
              )}
            </div>
            <p className="signature-name">{nurseInfo.name}</p>
            <p className="signature-number">No : {nurseInfo.licenseNumber}</p>
          </div>

          <div className="signature-column">
            <div className="signature-box">
              {data.doctorSignatureData && (
                <img 
                  src={data.doctorSignatureData} 
                  alt="Doctor Signature" 
                  className="signature-image-letter"
                />
              )}
            </div>
            <p className="signature-name">{doctorInfo.name}</p>
            <p className="signature-number">No: {doctorInfo.licenseNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="delegasi-container">
      <h2>Surat Pelimpahan Wewenang Delegatif</h2>
      
      {/* Dropdown Toggle */}
      <div className="dropdown-section">
        <button 
          className="dropdown-toggle"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "▲ Sembunyikan Form" : "▼ Tampilkan Form Surat Pelimpahan Wewenang"}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="delegation-form">
          {/* Doctor Information */}
          <div className="form-section">
            <h3>Informasi Dokter Pemberi Wewenang</h3>
            <div className="info-display">
              <p><strong>Nama:</strong> {doctorInfo.name}</p>
              <p><strong>Tempat Praktek:</strong> {doctorInfo.workplace}</p>
              <p><strong>Jabatan:</strong> {doctorInfo.position}</p>
            </div>
          </div>

          {/* Nurse Information */}
          <div className="form-section">
            <h3>Informasi Perawat Penerima Wewenang</h3>
            <div className="info-display">
              <p><strong>Nama:</strong> {nurseInfo.name}</p>
              <p><strong>Tempat Praktek:</strong> {nurseInfo.workplace}</p>
              <p><strong>Jabatan:</strong> {nurseInfo.position}</p>
            </div>
          </div>

          {/* Patient Information */}
          <div className="form-section">
            <h3>Informasi Pasien/Klien</h3>
            <div className="input-group">
              <label>Nama Pasien:</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Usia:</label>
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Diagnosa:</label>
              <input
                type="text"
                value={patientDiagnosis}
                onChange={(e) => setPatientDiagnosis(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Actions List */}
          <div className="form-section">
            <h3>Pelimpahan Wewenang Tindakan</h3>
            {actions.map((action, index) => (
              <div key={index} className="input-group">
                <label>Tindakan {index + 1}:</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => handleActionChange(index, e.target.value)}
                  placeholder={`Masukkan tindakan ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div className="signature-section">
            <div className="signature-group">
              <label>Tanda Tangan Digital Dokter:</label>
              <SignatureCanvas
                ref={doctorSignatureRef}
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
                onClick={() => clearSignature(doctorSignatureRef)}
              >
                Hapus Tanda Tangan Dokter
              </button>
            </div>

            <div className="signature-group">
              <label>Tanda Tangan Digital Perawat:</label>
              <SignatureCanvas
                ref={nurseSignatureRef}
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
                onClick={() => clearSignature(nurseSignatureRef)}
              >
                Hapus Tanda Tangan Perawat
              </button>
            </div>
          </div>

          <button className="submit-delegation-btn" type="submit">
            Simpan Surat Pelimpahan Wewenang
          </button>
        </form>
      )}

      {/* Saved Delegation Data */}
      <h3>Data Surat Pelimpahan Wewenang Tersimpan</h3>
      {savedDelegationData.length > 0 ? (
        <div className="delegation-cards">
          {savedDelegationData.map((data) => (
            <div 
              key={data.id} 
              className={`delegation-card ${isDeleting === data.id ? 'deleting' : ''}`}
            >
              <div className="card-header">
                <h4>Surat Pelimpahan Wewenang</h4>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteDelegation(data.id)}
                  title="Hapus surat"
                  disabled={isDeleting === data.id}
                >
                  {isDeleting === data.id ? '⏳' : '🗑️'}
                </button>
              </div>
              <div className="card-content">
                <div className="card-row">
                  <span className="card-label">Nama Pasien:</span>
                  <span className="card-value">{data.patientName}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Tanggal:</span>
                  <span className="card-value">
                    {new Date(data.dateTime).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Jam:</span>
                  <span className="card-value">
                    {new Date(data.dateTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewLetter(data)}
                  disabled={isDeleting === data.id}
                >
                  {isDeleting === data.id ? '⏳ Loading...' : '👁️ View Surat'}
                </button>
              </div>
              {isDeleting === data.id && (
                <div className="deleting-overlay">
                  <div className="deleting-spinner"></div>
                  <span>Menghapus...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">Belum ada data surat pelimpahan wewenang.</p>
      )}

      {/* Modal for Professional Letter View */}
      {showModal && selectedDelegation && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Surat Pelimpahan Wewenang</h3>
              <button 
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ProfessionalLetter data={selectedDelegation} />
              <div className="modal-actions">
                <button 
                  className="download-letter-btn"
                  onClick={() => handleDownloadLetter(selectedDelegation)}
                >
                  📥 Download Surat (PNG)
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delegasi;