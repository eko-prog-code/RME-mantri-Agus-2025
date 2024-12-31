import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import "./Modal.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss'


const EncounterForm = ({ datas }) => {
  const [ihsId, setIhsId] = useState("");
  const [ihsIdpatient, setIhsIdpatient] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [formData, setFormData] = useState(() => {
    // Function to format the date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      // Mengonversi waktu dari zona waktu setempat ke UTC
      const utcHours = date.getHours() - 7; // Mengurangkan 7 jam untuk WIB (UTC+00 - 7)
      date.setHours(utcHours);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
    };
    // Initialize formData dynamically based on input fields
    const initialFormData = {
      identifierSystem:
        "http://sys-ids.kemkes.go.id/encounter/100479453",
      identifierValue: ihsIdpatient,
      subjectReference: ihsIdpatient,
      subjectDisplay: datas.patient,
      participantReference: ihsId, // Assign ihsId here,
      participantDisplay: datas.participant,
      patientNik: datas.patientNIK,
      doctorNik: datas.doctorNIK,
      periodStart: formatDate(datas.periodeStart),
      statusHistoryStart: formatDate(datas.periodeStart),
      serviceProviderReference:
      "Organization/100479453",
      locationReference: "Location/926f2906-985b-4d5d-94f3-da10858b840d",
      locationDisplay: "Ruang Pemeriksaan Poli Umum, Klinik Mantri Agus Kostaman Achyar",
      // ... (add other form fields)
    };
    return initialFormData;
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleGetIHS(); // Panggil fungsi untuk mendapatkan ihsId saat komponen dimuat
    handleGetIHSpatient();
    fetchTokenFromFirebase();
  }, []);

  useEffect(() => {
    // Update the identifierValue when ihsIdpatient changes
    setFormData((prevData) => ({
      ...prevData,
      identifierValue: ihsIdpatient,
    }));
  }, [ihsIdpatient]);

  const fetchTokenFromFirebase = async () => {
    try {
      const firebaseTokenUrl =
        "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/token.json";
      const response = await axios.get(firebaseTokenUrl);
      const tokenFromFirebase = response.data.token;

      if (tokenFromFirebase) {
        console.log("Token dari Firebase:", tokenFromFirebase);
        setAccessToken(tokenFromFirebase);
        // return tokenFromFirebase
      } else {
        console.error("Token tidak ditemukan dari Firebase.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching access token from Firebase:", error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(() => ({
      // Reset form data here
      // ...
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchTokenFromFirebase()
      .then((res) => saveData(res))
      .catch((err) => console.log(err));
  };
  const saveData = async () => {
    const postEncounterEndpoint = "http://localhost:5000/forward-request"; // Update with your server endpoint
    const data = {
      resourceType: "Encounter",
      status: "arrived",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB",
        display: "ambulatory",
      },
      subject: {
        reference: formData.subjectReference,
        display: formData.subjectDisplay,
      },
      participant: [
        {
          type: [
            {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                  code: "ATND",
                  display: "attender",
                },
              ],
            },
          ],
          individual: {
            reference: formData.participantReference,
            display: formData.participantDisplay,
          },
        },
      ],
      period: {
        start: formData.periodStart,
      },
      location: [
        {
          location: {
            reference: formData.locationReference,
            display: formData.locationDisplay,
          },
        },
      ],
      statusHistory: [
        {
          status: "arrived",
          period: {
            start: formData.statusHistoryStart,
          },
        },
      ],
      serviceProvider: {
        reference: formData.serviceProviderReference,
      },
      identifier: [
        {
          system: formData.identifierSystem,
          value: formData.identifierValue,
        },
      ],
    };

    setLoading(true);
    axios
      .post(postEncounterEndpoint, data, {
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
         
          // const patient = res.data.subject[0];
          Swal.fire({
            icon: 'success',
            // title: `${patient.reference}`,
            text: 'success submit data',
          });
          localStorage.setItem("encounter", JSON.stringify(res));
        }
        resetForm();
      })
      .catch((res) => {
        console.log("Gagal mengirim data:", res.data) 
        Swal.fire({
          icon: 'error',
          title: `error`,
          text: 'Gagal mengirim data:',
        });
      })
      .finally(() => setLoading(false));
  };

  const handleGetIHS = async () => {
    // Pastikan formData.doctorNik memiliki nilai yang valid
    if (!formData.doctorNik) {
      console.error("Error: doctorNik is not defined in formData");
      return;
    }

    try {
      // Ambil access token sebelum membuat permintaan API
      const tokenResponse = await axios.get(
        "http://localhost:5000/getIHS?identifier=" + formData.doctorNik
      );
      const accessToken = tokenResponse.data.accessToken;

      // Sertakan access token dalam header permintaan
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Ganti YOUR_ACCESS_TOKEN dengan token aktual
      };

      // Bangun URL lengkap termasuk URL dasar dan identifier
      const apiUrl = `http://localhost:5000/getIHS?identifier=${formData.doctorNik}`;

      const response = await axios.get(apiUrl, { headers });
      const data = response.data;

      if (data.success) {
        setIhsId(data.ihsId);
        const formattedParticipantReference = `Practitioner/${data.ihsId}`;
        setFormData((prevData) => ({
          ...prevData,
          participantReference: formattedParticipantReference,
        }));
      } else {
        console.error("Error getting IHS Participant:", data.error);
      }
    } catch (error) {
      console.error("Error getting IHS Participant:", error);
    }
  };

  const handleGetIHSpatient = async () => {
    // Make sure formData.patientNik has a valid value
    if (!formData.patientNik) {
      console.error("Error: patientNik is not defined in formData");
      return;
    }

    try {
      // Get the access token before making the API request
      const tokenResponse = await axios.get(
        "http://localhost:5000/getIHSpatient?identifier=" +
          formData.patientNik
      );
      const accessToken = tokenResponse.data.accessToken;

      // Include the access token in the request header
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      // Build the complete URL including the base URL and identifier
      const apiUrl = `http://localhost:5000/getIHSpatient?identifier=${formData.patientNik}`;

      const response = await axios.get(apiUrl, { headers });
      const data = response.data;

      if (data.success) {
        setIhsIdpatient(data.ihsIdpatient);
        const formattedsubjectReference = `Patient/${data.ihsIdpatient}`;
        setFormData((prevData) => ({
          ...prevData,
          subjectReference: formattedsubjectReference,
        }));
      } else {
        console.error("Error getting IHS Patient:", data.error);
      }
    } catch (error) {
      console.error("Error getting IHS Patient:", error);
    }
  };

  return (
    <>
      <section className=" py-1 bg-blueGray-50">
        <div className="w-full lg:w-8/12 px-4 mx-auto mt-6">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-gray-700 text-xl font-bold">Encounter</h6>
                <Link to={"/satusehat"}>
                  <Button
                    className=" text-white bg-[#2196F3] border-0 rounded-md py-2 px-5 focus:outline-none hover:bg-2196F3 text-sm"
                    type="submit"
                  >
                    Back
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Patient Information
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Identifier System:
                      </label>
                      <input
                        name="identifierSystem"
                        value={formData.identifierSystem}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Identifier Value:
                      </label>
                      <input
                        name="identifierValue"
                        value={formData.identifierValue}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Subject Reference:
                      </label>
                      <input
                        name="subjectReference"
                        value={formData.subjectReference}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Subject Display:
                      </label>
                      <input
                        disabled
                        type="text"
                        className="border-blue-gray-400 text-blue-gray-700 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 disabled:bg-blue-gray-50 peer h-full w-full rounded-[7px] border border-t-transparent px-3 py-2.5 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0"
                        value={formData.subjectDisplay}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Participant Reference:
                      </label>
                      <input
                        type="text"
                        name="participantReference"
                        value={formData.participantReference}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Participant Display:
                      </label>
                      <input
                        disabled
                        name="participantDisplay"
                        value={formData.participantDisplay}
                        onChange={handleChange}
                        type="text"
                        className="border-blue-gray-400 text-blue-gray-700 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 disabled:bg-blue-gray-50 peer h-full w-full rounded-[7px] border border-t-transparent px-3 py-2.5 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Period Start:
                      </label>
                      <input
                        disabled
                        name="periodStart"
                        value={formData.periodStart}
                        onChange={handleChange}
                        type="text"
                        className="border-blue-gray-400 text-blue-gray-700 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 disabled:bg-blue-gray-50 peer h-full w-full rounded-[7px] border border-t-transparent px-3 py-2.5 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Status History Start:
                      </label>
                      <input
                        disabled
                        name="statusHistoryStart"
                        value={formData.statusHistoryStart}
                        onChange={handleChange}
                        type="text"
                        className="border-blue-gray-400 text-blue-gray-700 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 disabled:bg-blue-gray-50 peer h-full w-full rounded-[7px] border border-t-transparent px-3 py-2.5 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Service Provider Reference:
                      </label>
                      <input
                        name="serviceProviderReference"
                        value={formData.serviceProviderReference}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Location Reference:
                      </label>
                      <input
                        name="locationReference"
                        value={formData.locationReference}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlfor="grid-password"
                      >
                        Location Display:
                      </label>
                      <input
                        name="locationDisplay"
                        value={formData.locationDisplay}
                        onChange={handleChange}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="inline-flex ml-2 mt-2  text-white bg-[#2196F3] border-0 rounded-md py-3 px-5 focus:outline-none hover:bg-2196F3 text-sm"
                >
                  {loading ? "Loading..." : "Kirim Data"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EncounterForm;