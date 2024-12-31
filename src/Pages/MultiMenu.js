import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MultiMenu.css';
import PatientCard from './PatientCard';

const MultiMenu = () => {
  const [patientList, setPatientList] = useState([]);
  const [indexedPatientList, setIndexedPatientList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPatientList();
  }, []);

  useEffect(() => {
    const indexedPatients = Array.isArray(patientList)
      ? patientList.filter((patient) => patient.isIndexed).sort((a, b) => a.index - b.index)
      : [];

    setIndexedPatientList(indexedPatients);
  }, [patientList]);

  const fetchPatientList = async () => {
    try {
      const response = await axios.get(
        'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json'
      );

      if (response.data) {
        const patients = Object.keys(response.data).map((key) => ({
          id: key,
          ...response.data[key],
          isVisible: false,
          isChecked: false,
          StatusPeriksa: response.data[key].StatusPeriksa || false,
        }));

        setPatientList(patients);
      } else {
        setPatientList([]);
      }
    } catch (error) {
      console.error('Error fetching patient list:', error);
      setPatientList([]);
    }
  };

  const toggleCheckStatus = async (patientId) => {
    try {
      const updatedPatients = patientList.map((patient) => {
        if (patient.id === patientId) {
          return {
            ...patient,
            isChecked: !patient.isChecked,
            StatusPeriksa: !patient.StatusPeriksa,
          };
        }
        return patient;
      });

      const selectedPatient = updatedPatients.find((patient) => patient.id === patientId);

      await axios.put(
        `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${patientId}.json`,
        {
          ...selectedPatient,
        }
      );

      setPatientList(updatedPatients);
    } catch (error) {
      console.error('Error toggling check status:', error);
    }
  };

  const handleAddToListClick = async (patientId) => {
    try {
      const currentPatientIndex = await getLastUsedIndex();
      const newPatientIndex = currentPatientIndex + 1;

      const selectedPatient = patientList.find((patient) => patient.id === patientId);

      if (selectedPatient && !selectedPatient.isIndexed) {
        selectedPatient.isIndexed = true;
        selectedPatient.isVisible = true;
        selectedPatient.PatientIndex = newPatientIndex;
        selectedPatient.index = newPatientIndex;
        selectedPatient.StatusPeriksa = false;

        await axios.put(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${patientId}.json`,
          selectedPatient
        );

        await updateLastUsedIndex(newPatientIndex);

        setIndexedPatientList([...indexedPatientList, selectedPatient]);
      }
    } catch (error) {
      console.error('Error adding patient to list:', error);
    }
  };

  const getLastUsedIndex = async () => {
    try {
      const response = await axios.get(
        'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/lastUsedIndex.json'
      );
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching last used index:', error);
      return 0;
    }
  };

  const updateLastUsedIndex = async (newIndex) => {
    try {
      await axios.put(
        'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/lastUsedIndex.json',
        newIndex
      );
    } catch (error) {
      console.error('Error updating last used index:', error);
    }
  };

  const handleDeleteClick = async (patientId) => {
    try {
      // Find the patient to be deleted
      const selectedPatient = patientList.find((patient) => patient.id === patientId);
  
      if (selectedPatient && selectedPatient.isIndexed) {
        // Remove indexed-specific fields
        const { PatientIndex, index, isIndexed, isVisible, StatusPeriksa, isChecked, ...updatedPatient } = selectedPatient;
  
        // Update the patient in Firebase to remove indexed status
        await axios.put(
          `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${patientId}.json`,
          updatedPatient
        );
  
        // Update the state locally
        const updatedPatients = patientList.map((patient) =>
          patient.id === patientId ? updatedPatient : patient
        );
  
        const updatedIndexedPatients = indexedPatientList.filter(
          (patient) => patient.id !== patientId
        );
  
        setPatientList(updatedPatients);
        setIndexedPatientList(updatedIndexedPatients);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };
  

  const deleteAllIndexes = async () => {
    const isConfirmed = window.confirm("Apakah Anda Yakin akan menghapus Data ini?");

    if (isConfirmed) {
      try {
        const updatedPatients = await Promise.all(
          patientList.map(async (patient) => {
            if (patient.isIndexed) {
              const { PatientIndex, index, isIndexed, isVisible, StatusPeriksa, isChecked, ...updatedPatient } = patient;

              await axios.put(
                `https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients/${patient.id}.json`,
                updatedPatient
              );

              return updatedPatient;
            }
            return patient;
          })
        );

        await axios.delete(
          'https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/lastUsedIndex.json'
        );

        setPatientList(updatedPatients);
        setIndexedPatientList([]);
      } catch (error) {
        console.error('Error deleting all indexes:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);

    const filteredPatients = patientList.map((patient) => {
      if (patient.name) {
        return {
          ...patient,
          isVisible:
            searchTerm === '' ||
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
        };
      } else {
        return {
          ...patient,
          isVisible: false,
        };
      }
    });

    setPatientList(filteredPatients);
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <button onClick={toggleModal} className="button-open">
          Buka Antrian Pasien
        </button>
      </div>


      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={toggleModal} style={{ color: 'white', backgroundColor: 'red' }} className="button-close">
              ✖
            </button>
            <button onClick={deleteAllIndexes} className="button-delete-all">
              Hapus semua Antrian
            </button>

            <div className="input-container">
              <input
                type="text"
                placeholder="Cari Pasien..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-modal"
              />
            </div>


            {searchTerm && (
              <div className="filtered-patients">
                <h2>Filter Patients</h2>
                {patientList
                  .filter((patient) => !patient.isIndexed && patient.isVisible)
                  .map((patient) => (
                    <PatientCard
                      key={patient.id}
                      {...patient}
                      onAddClick={() => handleAddToListClick(patient.id)}
                    />
                  ))}
              </div>
            )}

            <div className="indexed-patients">
              <h2>Antrian Patients</h2>
              {indexedPatientList.map((patient, index) => (
                <PatientCard
                  key={patient.id}
                  {...patient}
                  index={index + 1}
                  onCheckClick={() => toggleCheckStatus(patient.id)}
                  onDeleteClick={() => handleDeleteClick(patient.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMenu;