import React from "react";
import ConditionForm from "../components/ConditionForm";
import { useLocation } from "react-router-dom";

const Condition = () => {
  const location = useLocation();
  const datas = location.state;
  return (
    <>
      <ConditionForm datas={datas} />
    </>
  );
};

export default Condition;
