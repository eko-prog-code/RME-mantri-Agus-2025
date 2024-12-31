import React from 'react';
import './CategoryObat.css';
import { Link } from 'react-router-dom';

const CategoryObat = () => {
  return (
    <div className="category-obat">
      <img
        src="https://firebasestorage.googleapis.com/v0/b/medictech-since-2022.appspot.com/o/MedicTechSearchEngine.webp?alt=media&token=3972f864-73ec-4ae1-9185-11e6512e5e00"
        alt="Service Setting"
        className="image-button-ServiceSetting"
        style={{ width: "700px", height: "150px" }}
      />
      <p>Otomatisasi resep obat mempertimbangkan diagnosa medis dan berat badan pasien
        untuk pengobatan yang tepat.</p>
      <div className="image-group">
        <Link to="/tooth-drug">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/Dental.png?alt=media&token=0acb96b2-7947-4cdb-94ed-f694db7f3ae0"
            alt="Dental"
          />
        </Link>
        <Link to="/internis"> {/* Add Link to Internis page */}
          <img
            src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/Internis.png?alt=media&token=52d616ae-df99-4815-8b36-9cbef9178dba"
            alt="Internis"
          />
        </Link>
      </div>
      <div className="image-group">
        <Link to="/pediatric">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/Pediatric.png?alt=media&token=f146b95b-cff3-46c7-bd93-acc69eee0f90"
            alt="Pediatric"
          />
        </Link>
        <Link to="/derma-drug">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/Derma.png?alt=media&token=5ecd91eb-6b3d-4535-b8cc-bf829cc478f3"
            alt="Derma"
          />
        </Link>
      </div>
    </div>
  );
};

export default CategoryObat;
