import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ConditionForm.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss'

const MedicationRequestForm = ({ datas }) => {
  const [encounterId, setEncounterId] = useState("");
  const [date, setDate] = useState("");
  const [participant, setParticipant] = useState([]);
  const [ihsId, setIhsId] = useState("");
  const [patient, setPatient] = useState("");
  const [ihsPatient, setIhsPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    console.log("Data received in component:", datas);
  }, [datas]);
  

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Medication data being submitted:", datas.Medication); // Debugging
    fetchTokenFromFirebase()
      .then((res) => saveData(res))
      .catch((err) => console.log(err));
  };
  

  const fetchTokenFromFirebase = async () => {
    try {
      const firebaseTokenUrl =
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/token.json";
      const response = await axios.get(firebaseTokenUrl);
      const tokenFromFirebase = response.data.token;

      if (tokenFromFirebase) {
        console.log("Token dari Firebase:", tokenFromFirebase);
        setAccessToken(tokenFromFirebase);
        return tokenFromFirebase;
      } else {
        console.error("Token tidak ditemukan dari Firebase.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching access token from Firebase:", error);
      return null;
    }
  };

  const saveData = async (token) => {
    const postMedicationRequestEndpoint =
      "http://localhost:5000/forward-request-MedicationRequest";

      const medicationValue = parseFloat(datas.Medication);

      const data = {
        resourceType: "MedicationRequest",
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/prescription/100479453`,
            use: "official",
            value: "123456788"
          },
          {
            system: `http://sys-ids.kemkes.go.id/prescription-item/100479453`,
            use: "official",
            value: "123456788-1"
          }
        ],
        status: "completed",
        intent: "order",
        category: [{
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
              code: "outpatient",
              display: "outpatient"
            }
          ]
        }],
        priority: "routine",
        medicationReference: {
          reference: `Medication/8f299a19-5887-4b8e-90a2-c2c15ecbe1d1`,
          display: datas.Medication,
        },
        subject: {
          reference: ihsPatient,
          display: patient
        },
        encounter: {
          reference: `Encounter/${encounterId}`,
          display: `Edukasi Medication ${patient} di tanggal ${date}`
        },
        authoredOn: `${date}`,
        requester: {
          reference: ihsId,
          display: participant[0]?.individual?.display || ""
        },
        reasonCode: [{
          coding: [
            {
              system: "http://hl7.org/fhir/sid/icd-10",
              code: datas.codeICD,
              display: datas.dx
            }
          ]
        }],
        dispenseRequest: {
          performer: {
            reference: "Organization/100015593"
          }
        },
      };
      

    setLoading(true);

    try {
      const response = await axios.post(postMedicationRequestEndpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response data:", response.data);

      if (response.data.issue && response.data.issue.length > 0) {
        const issue = response.data.issue[0];
        Swal.fire({
          icon: 'error',
          title: `Error: ${issue.expression[0]}`,
          text: issue.details?.text || 'An error occurred. Please try again later.',
        });
      } else {
        Swal.fire({
          icon: 'success',
          text: 'Data submitted successfully',
        });
        localStorage.setItem("resumeMedication", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to send data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-container">
      <div className="glow-card">
        <Link to={"/satusehat"}>
          <button className="back-button">Back</button>
        </Link>
        <h1>Resume Medication</h1>
        <p className="info-text">Encounter ID: {encounterId}</p>
        <p className="info-text left-align-text">Patient Name: {patient}</p>
        <p className="info-text left-align-text">Resep Obat: {datas.Medication}</p>
        <p className="info-text left-align-text">Patient ID: {ihsPatient}</p>
        <p className="info-text left-align-text">Date: {date}</p>

        <ul className="participant-list left-align-text">
          {participant.map((data, index) => (
            <li key={index}>
              <strong>Name:</strong> {data.individual.display}
              <br />
              <strong>Reference:</strong> {data.individual.reference}
              <br />
            </li>
          ))}
        </ul>

        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default MedicationRequestForm;