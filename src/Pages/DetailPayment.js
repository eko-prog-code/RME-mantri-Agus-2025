import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./DetailPayment.css"; // Styling sesuai kebutuhan

const DetailPayment = () => {
  const { id, treatmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    treatmentCost: initialCost,
    treatmentDate,
    treatmentTime,
  } = location.state || {};

  const [details, setDetails] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [treatment, setTreatment] = useState({
    treatmentCost: initialCost || 0, // Menggunakan biaya awal dari parameter
  });

  const [patientDetails, setPatientDetails] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
        );
        const data = response.data;
        setPatientDetails({ name: data.name });
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchPatientDetails();
  }, [id]);

  // State untuk menampilkan form tambah/kurang biaya
  const [isAdding, setIsAdding] = useState(false);
  const [isSubtracting, setIsSubtracting] = useState(false);

  // Fungsi untuk mengonversi string menjadi angka
  const formatToNumber = (value) => {
    if (typeof value === "string") {
      return parseFloat(value.replace(/\./g, ""));
    }
    return value; // Jika sudah berupa angka, kembalikan apa adanya
  };

  // Fungsi untuk memformat nomor dengan tanda titik setiap 3 digit
  const formatNumber = (value) => {
    // Menghilangkan karakter selain angka
    const formattedValue = value.replace(/\D/g, "");
    // Menambahkan titik setiap 3 digit dari kanan
    return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Fungsi untuk meng-handle perubahan nilai pada input nominal
  const handleNominalBlur = (e) => {
    // Ambil nilai input dan format dengan tanda titik
    const formattedValue = formatNumber(e.target.value);
    // Set nilai input dengan format baru
    setFormData({ ...formData, price: formattedValue });
  };

  // Fetch data dari Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data detail
        const response = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}/details.json`
        );
        const data = response.data;

        // Format detail biaya
        const formattedDetails = Object.keys(data || {}).map((key) => ({
          id: key, // Tambahkan ID unik dari Firebase
          ...data[key],
          price: formatToNumber(data[key].price),
        }));

        setDetails(formattedDetails);

        // Ambil biaya awal treatment
        const treatmentResponse = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}.json`
        );
        const treatmentData = treatmentResponse.data;

        setTreatment((prevTreatment) => ({
          ...prevTreatment,
          treatmentCost: formatToNumber(treatmentData.treatmentCost),
        }));
        // Fetch patient details (name, treatment date, treatment time)
        const patientResponse = await axios.get(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}.json`
        );
        const patientData = patientResponse.data;

        setPatientDetails({
          name: patientData.name || "Unknown Patient",
          treatmentDate: treatmentData.treatmentDate || "N/A",
          treatmentTime: treatmentData.treatmentTime || "N/A",
        });
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, [id, treatmentId]);

  // Fungsi untuk menambahkan biaya
  const handleAddDetail = async () => {
    if (formData.name && formData.price) {
      const newDetail = {
        name: formData.name,
        price: parseFloat(formData.price.replace(/\./g, "")),
        type: "add",
      };
      setDetails([...details, newDetail]);
      setFormData({ name: "", price: "" });

      // Update treatment cost secara langsung berdasarkan biaya baru yang ditambahkan
      setTreatment((prevTreatment) => ({
        ...prevTreatment,
        treatmentCost: prevTreatment.treatmentCost + newDetail.price,
      }));

      // Simpan ke Firebase
      try {
        await axios.post(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}/details.json`,
          newDetail
        );
        console.log("Biaya tambahan berhasil disimpan.");
      } catch (error) {
        console.error("Gagal menyimpan biaya tambahan:", error);
      }
    }
  };

  // Fungsi untuk mengurangi biaya
  const handleSubtractDetail = async () => {
    if (formData.name && formData.price) {
      const newDetail = {
        name: formData.name,
        price: parseFloat(formData.price.replace(/\./g, "")),
        type: "subtract",
      };
      setDetails([...details, newDetail]);
      setFormData({ name: "", price: "" });

      // Update treatment cost secara langsung berdasarkan biaya baru yang dikurangi
      setTreatment((prevTreatment) => ({
        ...prevTreatment,
        treatmentCost: prevTreatment.treatmentCost - newDetail.price,
      }));

      // Simpan ke Firebase
      try {
        await axios.post(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}/details.json`,
          newDetail
        );
        console.log("Biaya pengurangan berhasil disimpan.");
      } catch (error) {
        console.error("Gagal menyimpan biaya pengurangan:", error);
      }
    }
  };

  // Fungsi untuk menghapus biaya dan update total
  const handleDeleteDetail = async (index) => {
    // Ambil detail yang akan dihapus
    const deletedDetail = details[index];

    if (!deletedDetail || !deletedDetail.id) {
      console.error("Detail tidak memiliki ID yang valid.");
      return;
    }

    // Hapus detail dari state
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);

    // Hitung ulang biaya treatment
    const updatedTreatmentCost =
      deletedDetail.type === "add"
        ? treatment.treatmentCost - deletedDetail.price
        : treatment.treatmentCost + deletedDetail.price;

    setTreatment((prevTreatment) => ({
      ...prevTreatment,
      treatmentCost: updatedTreatmentCost,
    }));

    // Hapus detail dari Firebase
    try {
      await axios.delete(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}/details/${deletedDetail.id}.json`
      );
      console.log("Detail berhasil dihapus dari Firebase.");
    } catch (error) {
      console.error("Gagal menghapus detail dari Firebase:", error);
    }
  };

  // Fungsi untuk menyimpan total biaya ke Firebase
  const handleSave = async () => {
    try {
      await axios.patch(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${id}/medical_records/${treatmentId}.json`,
        { treatmentCost: treatment.treatmentCost }
      );
      console.log("Total biaya berhasil diperbarui di Firebase.");
      navigate(`/emr/${id}`, {
        state: { updatedCost: treatment.treatmentCost },
      });
    } catch (error) {
      console.error("Gagal menyimpan total biaya:", error);
    }
  };

  return (
    <div className="detail-payment-container">
      <h2>Detail Payment</h2>
      <p>Pasien: {patientDetails.name}</p>
      <p>
        Tanggal Berobat: <br /> {treatmentDate}
      </p>
      <p>Waktu: {treatmentTime}</p>

      <div>
        <h4>
          SubTotal Biaya Awal: <br />
          Rp{" "}
          {treatment.treatmentCost
            ? treatment.treatmentCost.toLocaleString()
            : "0"}
        </h4>
      </div>

      <div className="buttons">
        <button
          className="add-button"
          onClick={() => {
            setIsAdding(true);
            setIsSubtracting(false);
          }}
        >
          + Tambah Biaya
        </button>
        <button
          className="subtract-button"
          onClick={() => {
            setIsSubtracting(true);
            setIsAdding(false);
          }}
        >
          - Kurangi Biaya
        </button>
      </div>

      {isAdding && (
        <div className="form">
          <h3>Tambah Biaya</h3>
          <input
            type="text"
            placeholder="Nama Biaya"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Harga"
            value={formData.price}
            onBlur={handleNominalBlur} // Menambahkan onBlur untuk format harga
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
          <button onClick={handleAddDetail}>Simpan</button>
        </div>
      )}

      {isSubtracting && (
        <div className="form">
          <h3>Kurangi Biaya</h3>
          <input
            type="text"
            placeholder="Nama Potongan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Harga"
            value={formData.price}
            onBlur={handleNominalBlur} // Menambahkan onBlur untuk format harga
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
          <button onClick={handleSubtractDetail}>Simpan</button>
        </div>
      )}

      <div className="details-list">
        {details.map((detail, index) => (
          <div key={index} className="detail-card">
            <span>{detail.name}</span> - Rp{" "}
            {formatNumber(detail.price.toString())}
            <button onClick={() => handleDeleteDetail(index)}>X</button>
          </div>
        ))}
      </div>

      <div>
        <button className="save-button" onClick={handleSave}>
          Simpan Total Biaya
        </button>
      </div>
    </div>
  );
};

export default DetailPayment;
