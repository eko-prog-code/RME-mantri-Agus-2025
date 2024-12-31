import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ListBelanjaObat.css'; // Import file CSS

// Define the component
const ListBelanjaObat = () => {
  // State variables
  const [namaBarang, setNamaBarang] = useState('');
  const [qty, setQty] = useState('');
  const [daftarBelanja, setDaftarBelanja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tampilkanForm, setTampilkanForm] = useState(false);
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      const response = await axios.get(
        'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/Obat%26Alkes.json'
      );
      const data = response.data;
      if (data) {
        const daftarBelanjaArray = Object.keys(data).map((key) => ({
          id: key,
          nama: data[key].nama,
          qty: data[key].qty,
        }));
        setDaftarBelanja(daftarBelanjaArray);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Post data to Firebase
      const response = await axios.post(
        'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/Obat%26Alkes.json',
        {
          nama: namaBarang,
          qty: qty,
        }
      );

      const newDaftarBelanja = [
        ...daftarBelanja,
        {
          id: response.data.name,
          nama: namaBarang,
          qty: qty,
        },
      ];
      setDaftarBelanja(newDaftarBelanja);
      setNamaBarang('');
      setQty('');
      setTampilkanForm(false); // Setelah submit, sembunyikan form
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  // Handle deleting an item
  const handleHapusItem = async (id) => {
    try {
      // Delete data from Firebase
      await axios.delete(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/Obat%26Alkes/${id}.json`
      );

      // Filter out the item with the specified id
      const updatedDaftarBelanja = daftarBelanja.filter((item) => item.id !== id);
      setDaftarBelanja(updatedDaftarBelanja);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleKirimWhatsapp = () => {
    // Implementasi pengiriman data ke Whatsapp
    // Gunakan nomorWhatsapp dan daftarBelanja untuk mengonstruksi pesan
    const pesanWhatsapp = `List Belanja Obat & Alkes:\n${daftarBelanja
  .map((item, index) => `- Item ${index + 1}: Nama: ${item.nama}, Qty: ${item.qty}`)
  .join('\n')}`;

    const whatsappLink = `https://wa.me/${nomorWhatsapp}?text=${encodeURIComponent(pesanWhatsapp)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="ListBuy-container">
      <h2 className="ListBuy-title">List Belanja Obat & Alkes di Apotek</h2>
      <button className="ListBuy-button-New" onClick={() => setTampilkanForm(true)}>
        Tambah Daftar Belanja
      </button>
      {tampilkanForm && (
        <div className="ListBuy-form">
          <label className="ListBuy-label">Nama Barang/Nama Obat:</label>
          <input
            type="text"
            value={namaBarang}
            onChange={(e) => setNamaBarang(e.target.value)}
            className="ListBuy-input"
          />
          <label className="ListBuy-label">Qty (Jumlah Barang/obat yang akan di beli):</label>
          <input
            type="text"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="ListBuy-input"
          />
          <button className="ListBuy-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
     <div className="ListBuy-list">
        <h3 className="ListBuy-subtitle">Daftar Belanja</h3>
  {loading ? (
    <p className="ListBuy-loading">Loading...</p>
  ) : (
    <ul className="ListBuy-ul">
      {daftarBelanja.map((item, index) => (
        <li key={item.id} className="ListBuy-li">
          <div className="ListBuy-item-container">
            <div className="ListBuy-item-details">
              <span>{`Item ${index + 1}: Nama: ${item.nama}, Qty: ${item.qty}`}</span>
            </div>
            {/* Ganti ikon "X" dengan teks "X" warna merah */}
            <div className="ListBuy-delete-button" onClick={() => handleHapusItem(item.id)}>
              X
            </div>
          </div>
        </li>
      ))}
    </ul>
        )}
      </div>
      <div className="ListBuy-whatsapp-form">
        <label className="ListBuy-label">Masukkan Nomor Whatsapp Apotek:</label>
        <input
          type="text"
          value={nomorWhatsapp}
          onChange={(e) => setNomorWhatsapp(e.target.value)}
          className="ListBuy-input"
          placeholder="Contoh: +628xxxx"
        />
        <button className="ListBuy-button" onClick={handleKirimWhatsapp}>
          Send to Whatsapp
        </button>
      </div>
    </div>
  );
};

// Export the component
export default ListBelanjaObat;

