import React from "react";
import EncounterForm from "../components/EncounterForm";
import { useLocation } from "react-router-dom";

const Encounter = () => {
  const location = useLocation();
  const datas = location.state;

  return (
    <>
      <EncounterForm datas={datas} />
    </>
  );
};

export default Encounter;