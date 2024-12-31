import React from "react";
import ObsNadiForm from "../components/ObsNadiForm";
import { useLocation } from "react-router-dom";

const ObsNadi = () => {
  const location = useLocation();
  const datas = location.state;
  return (
    <>
      <ObsNadiForm datas={datas} />
    </>
  );
};

export default ObsNadi;
