import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JadwalPraktek.css"; // Import file CSS

const JadwalPraktek = () => {
  const [jadwal, setJadwal] = useState({
    Senin: "",
    Selasa: "",
    Rabu: "",
    Kamis: "",
    Jumat: "",
    Sabtu: "",
    Minggu: "",
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(""); // Hari yang sedang diubah
  const [modalInput, setModalInput] = useState(""); // Input di modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/JadwalPraktek.json"
      );

      if (response.data) {
        setJadwal(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (day, value) => {
    setJadwal((prevJadwal) => ({
      ...prevJadwal,
      [day]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/JadwalPraktek.json",
        jadwal
      );

      console.log("Jadwal berhasil disimpan");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const openModal = (day) => {
    setActiveDay(day);
    setModalInput(jadwal[day] || ""); // Isi modal dengan nilai saat ini
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveDay("");
    setModalInput("");
  };

  const handleModalSave = () => {
    handleInputChange(activeDay, modalInput);
    closeModal();
  };

  const weekdays = ["Senin", "Selasa", "Rabu", "Kamis"];
  const weekends = ["Jumat", "Sabtu", "Minggu"];

  return (
    <div className="jadwal-praktek-24-flex-container">
      <h5 className="jadwal-praktek-24-title">Atur Jadwal Anda secara Real-Time</h5>
      <form className="jadwal-praktek-24-new-form-container">
        {/* Input untuk hari kerja */}
        {weekdays.map((day) => (
          <div key={day} className="jadwal-praktek-24-input-container">
            <label className="jadwal-praktek-24-label">{day}</label>
            <input
              type="text"
              value={jadwal[day]}
              onClick={() => openModal(day)} // Buka modal saat input diklik
              className="jadwal-praktek-24-input-field"
              readOnly // Input hanya bisa diubah lewat modal
            />
          </div>
        ))}
        {/* Input untuk akhir pekan */}
        {weekends.map((day) => (
          <div key={day} className="jadwal-praktek-24-input-container">
            <label className="jadwal-praktek-24-label">{day}</label>
            <input
              type="text"
              value={jadwal[day]}
              onClick={() => openModal(day)} // Buka modal saat input diklik
              className="jadwal-praktek-24-input-field"
              readOnly // Input hanya bisa diubah lewat modal
            />
          </div>
        ))}
      </form>
      <button className="jadwal-praktek-24-button" onClick={handleSave}>
        Simpan Jadwal
      </button>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="jadwal-praktek-24-modal-container">
          <div className="jadwal-praktek-24-modal-content">
            <p className="jadwal-praktek-24-modal-title">
              Isi jadwal untuk {activeDay}
            </p>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="jadwal-praktek-24-modal-input"
            />
            <button
              className="jadwal-praktek-24-modal-button"
              onClick={handleModalSave}
            >
              Tambahkan
            </button>
            <button
              className="jadwal-praktek-24-modal-button-close"
              onClick={closeModal}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalPraktek;