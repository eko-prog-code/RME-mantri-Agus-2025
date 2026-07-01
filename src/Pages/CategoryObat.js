import React from 'react';
import './CategoryObat.css';
import { Link } from 'react-router-dom';

// Import gambar dari lokal
import MedicTechSearchEngineImg from '../Images/MedicTechSearchEngine.png';
import DentalImg from '../Images/Dental.png';
import InternisImg from '../Images/Internis.png';
import PediatricImg from '../Images/Pediatric.png';
import DermaImg from '../Images/Derma.png';

const CategoryObat = () => {
  return (
    <div className="category-obat">
      <img
        src={MedicTechSearchEngineImg}
        alt="Service Setting"
        className="image-button-ServiceSetting"
        style={{ width: "700px", height: "150px" }}
      />
      <p>Otomatisasi resep obat mempertimbangkan diagnosa medis dan berat badan pasien
        untuk pengobatan yang tepat.</p>
      <div className="image-group">
        <Link to="/tooth-drug">
          <img
            src={DentalImg}
            alt="Dental"
          />
        </Link>
        <Link to="/internis">
          <img
            src={InternisImg}
            alt="Internis"
          />
        </Link>
      </div>
      <div className="image-group">
        <Link to="/pediatric">
          <img
            src={PediatricImg}
            alt="Pediatric"
          />
        </Link>
        <Link to="/derma-drug">
          <img
            src={DermaImg}
            alt="Derma"
          />
        </Link>
      </div>
    </div>
  );
};

export default CategoryObat;
