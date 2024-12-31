import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ConditionForm.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss'

const ObsNadiForm = ({ datas }) => {
  const [encounterId, setEncounterId] = useState("");
  const [date, setDate] = useState("");
  const [participant, setParticipant] = useState([]);
  const [ihsId, setIhsId] = useState("");
  const [patient, setPatient] = useState("");
  const [ihsPatient, setIhsPatient] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedDataString = localStorage.getItem("encounter");

    if (storedDataString) {
      const storedData = JSON.parse(storedDataString);

      setEncounterId(storedData.data.id);
      setDate(storedData.data.period.start);
      setParticipant(storedData.data.participant);
      setIhsId(storedData.data.participant[0].individual.reference);
      setPatient(storedData.data.subject.display);
      setIhsPatient(storedData.data.subject.reference);
      console.log("Retrieved data from local storage:", storedData);
    } else {
      console.error("No data found in local storage.");
    }
  }, []);

  const initialFormData = {
    resourceType: "Observation",
    status: "final",
    category: [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ],
    code: {
        coding: [
            {
                system: "http://loinc.org",
                code: "8867-4",
                display: "Heart rate"
            }
        ]
    },
    subject: {
      reference: ihsPatient,
    },
    performer: [
      {
        reference: ihsId,
      },
    ],
    encounter: {
        reference: `Encounter/${encounterId}`,
        display: `Pemeriksaan Fisik Nadi ${patient} di tanggal ${date}`
      },
    effectiveDateTime: date,
    issued: date,
    valueQuantity: {
        value: datas.nadi,
        unit: "beats/minute",
        system: "http://unitsofmeasure.org",
        code: "/min"
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchTokenFromFirebase()
      .then((res) => saveData(res))
      .catch((err) => console.log(err));
  };

  const [accessToken, setAccessToken] = useState(null);

  const fetchTokenFromFirebase = async () => {
    try {
      const firebaseTokenUrl =
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/token.json";
      const response = await axios.get(firebaseTokenUrl);
      const tokenFromFirebase = response.data.token;

      if (tokenFromFirebase) {
        console.log("Token dari Firebase:", tokenFromFirebase);
        setAccessToken(tokenFromFirebase);
      } else {
        console.error("Token tidak ditemukan dari Firebase.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching access token from Firebase:", error);
      return null;
    }
  };

  const saveData = async () => {
    const postObsNadiEndpoint =
      "http://localhost:5000/forward-request-observation-nadi";

      const nadiValue = parseFloat(datas.nadi);

    const data = {
      resourceType: "Observation",
      status: "final",
      category: [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ],
    code: {
        coding: [
            {
                system: "http://loinc.org",
                code: "8867-4",
                display: "Heart rate"
            }
        ]
    },
    subject: {
      reference: ihsPatient,
    },
    performer: [
      {
        reference: ihsId,
      },
    ],
    encounter: {
        reference: `Encounter/${encounterId}`,
        display: `Pemeriksaan Fisik Nadi ${patient} di tanggal ${date}`
      },
    effectiveDateTime: date,
    issued: date,
    valueQuantity: {
        value: nadiValue,
        unit: "beats/minute",
        system: "http://unitsofmeasure.org",
        code: "/min"
    },
    };

    setLoading(true);
    axios
    .post(postObsNadiEndpoint, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log("data: ", res);
      if (res.data.issue && res.data) {
        const issue = res.data.issue[0];

        Swal.fire({
          icon: 'error',
          title: `Error: ${issue.expression[0]}`,
          text: issue.details?.text || 'An error occurred. Please try again later.',
        });
      } else {
       
        
        Swal.fire({
          icon: 'success',
        
          text: 'success submit data',
        });
        localStorage.setItem("condition", JSON.stringify(data));
      }
      
    })
    .catch((err) => {
      console.log("Gagal mengirim data:", err) 
      Swal.fire({
        icon: 'error',
        title: `error`,
        text: 'Gagal mengirim data ',
      });
    })
    .finally(() => setLoading(false));
};

  return (
    <div className="card-container">
      <div className="glow-card">
        <Link to={"/satusehat"}>
          <button className="back-button">Back</button>
        </Link>
        <h1>Condition Page</h1>
        <p className="info-text">Encounter ID: {encounterId}</p>

        <p className="info-text left-align-text">Patient Name: {patient}</p>
        <p className="info-text left-align-text">Nadi: {datas.nadi}</p>
        <p className="info-text left-align-text">Patient ID: {ihsPatient}</p>
        <p className="info-text left-align-text">Date: {date}</p>

        <ul className="participant-list left-align-text">
          {participant.map((datas, index) => (
            <li key={index}>
              <strong>Name:</strong> {datas.individual.display}
              <br />
              <strong>Reference:</strong> {datas.individual.reference}
              <br />
            </li>
          ))}
        </ul>

        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ObsNadiForm;
