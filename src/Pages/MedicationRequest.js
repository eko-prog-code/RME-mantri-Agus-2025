import React from "react";
import MedicationRequestForm from "../components/MedicationRequestForm";
import { useLocation } from "react-router-dom";

const MedicationRequest = () => {
  const location = useLocation();
  const datas = location.state;

  return (
    <>
      <MedicationRequestForm datas={datas} />
    </>
  );
};

export default MedicationRequest;