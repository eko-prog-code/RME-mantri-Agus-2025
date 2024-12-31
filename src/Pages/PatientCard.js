import React from 'react';
import { Link } from 'react-router-dom';
import './PatientCard.css';

const PatientCard = ({ id, index, name, birthDate, isIndexed, emrData, onAddClick, onCheckClick, onDeleteClick, StatusPeriksa }) => {
  return (
    <div className="patient-list">
      <div className="patient-info">
        <p>No: {index}</p>
        <p>Name: {name}</p>
        <p>Birth Date: {birthDate}</p>
        {isIndexed && (
          <div className="button-container">
            <Link to={`/emr/${id}`} className="link-wrapper">
              <button className="common-button emr-button">EMR</button>
            </Link>
            <button
              onClick={onCheckClick}
              className={`common-button ${StatusPeriksa ? 'check-button-checked' : 'check-button'}`}
            >
              {StatusPeriksa ? 'Telah Diperiksa' : 'Periksa'}
            </button>
            <button
              onClick={() => onDeleteClick(id)}
              className="common-button delete-button"
            >
              Delete
            </button>
          </div>
        )}
        {emrData && <p>EMR Data: {emrData}</p>}
        {!isIndexed && (
           <button
           onClick={() => onAddClick(id)}
           className="add-to-list-button"
         >
           ✨ Add to List
         </button>
        )}
      </div>
    </div>
  );
};

export default PatientCard;