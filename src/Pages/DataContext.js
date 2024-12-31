// DataContext.js
import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientData, setSelectedPatientData] = useState(null);

  const setPatientId = (id, data) => {
    setSelectedPatientId(id);
    setSelectedPatientData(data);
  };

  return (
    <DataContext.Provider value={{ selectedPatientId, selectedPatientData, setPatientId }}>
      {children}
    </DataContext.Provider>
  );
};
