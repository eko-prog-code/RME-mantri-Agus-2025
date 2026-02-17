import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import "./Revenue.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Revenue = () => {
  const [patients, setPatients] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function convertToNumeric(cost) {
    if (typeof cost === "number") return cost;
    if (!cost || typeof cost !== "string") return 0;
    const numericString = cost.replace(/[^0-9]/g, "");
    return parseInt(numericString, 10) || 0;
  }

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/patients.json"
        );
        setPatients(response.data ? Object.values(response.data) : []);
        setLoading(false);
      } catch (error) {
        setError("Error fetching patient data");
        setLoading(false);
        console.error("Error fetching patient data:", error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const generateChartData = () => {
      const monthlyIncome = Array(12).fill(0);

      patients.forEach((patient) => {
        if (patient?.medical_records) {
          Object.values(patient.medical_records).forEach((record) => {
            const date = record?.Encounter_period_start
              ? new Date(record.Encounter_period_start)
              : null;
            if (date) {
              const year = date.getFullYear();
              const month = date.getMonth();
              const cost = convertToNumeric(record?.treatmentCost);
              if (year === parseInt(selectedYear, 10)) {
                monthlyIncome[month] += cost;
              }
            }
          });
        }
      });

      setChartData({
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        datasets: [
          {
            label: `Total Revenue in ${selectedYear}`,
            data: monthlyIncome,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    };

    generateChartData();
  }, [patients, selectedYear]);

  const handleChangeYear = (e) => {
    setSelectedYear(e.target.value || new Date().getFullYear());
  };

  const handleChangeMonth = (e) => {
    setSelectedMonth(e.target.value);
  };

  const downloadToExcel = () => {
    const filteredData = patients
      .filter((patient) => {
        return (
          selectedMonth &&
          Object.values(patient?.medical_records || {}).some((record) => {
            const date = record?.Encounter_period_start
              ? new Date(record.Encounter_period_start)
              : null;
            return (
              date &&
              date.getFullYear() === parseInt(selectedYear, 10) &&
              date.getMonth() === parseInt(selectedMonth, 10)
            );
          })
        );
      })
      .map((patient) => {
        return {
          Name: patient.name || "Unknown",
          TreatmentCost: Object.values(patient?.medical_records || {}).reduce(
            (acc, record) => {
              const date = record?.Encounter_period_start
                ? new Date(record.Encounter_period_start)
                : null;
              if (
                date &&
                date.getFullYear() === parseInt(selectedYear, 10) &&
                date.getMonth() === parseInt(selectedMonth, 10)
              ) {
                return acc + convertToNumeric(record?.treatmentCost);
              }
              return acc;
            },
            0
          ),
        };
      });

    const totalRevenue = filteredData.reduce(
      (acc, row) => acc + row.TreatmentCost,
      0
    );
    filteredData.push({
      Name: "Total",
      TreatmentCost: totalRevenue,
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue");

    const fileName = `Rekap_${chartData.labels[selectedMonth]}_${selectedYear}_revenue.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredPatients = patients.filter((patient) => {
    return (
      selectedMonth &&
      Object.values(patient?.medical_records || {}).some((record) => {
        const date = record?.Encounter_period_start
          ? new Date(record.Encounter_period_start)
          : null;
        return (
          date &&
          date.getFullYear() === parseInt(selectedYear, 10) &&
          date.getMonth() === parseInt(selectedMonth, 10)
        );
      })
    );
  });

  const totalRevenue = filteredPatients.reduce((acc, patient) => {
    return (
      acc +
      Object.values(patient?.medical_records || {}).reduce(
        (accInner, record) => {
          const date = record?.Encounter_period_start
            ? new Date(record.Encounter_period_start)
            : null;
          if (
            date &&
            date.getFullYear() === parseInt(selectedYear, 10) &&
            date.getMonth() === parseInt(selectedMonth, 10)
          ) {
            return accInner + convertToNumeric(record?.treatmentCost);
          }
          return accInner;
        },
        0
      )
    );
  }, 0);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

  return (
    <div className="revenue-container">
      <h1 className="revenue-title">Revenue Dashboard</h1>
      <p style={{textAlign: "center", fontStyle: "italic", fontSize: "14px"}}>Penghasilan FASKES <br /> Mantri Agus Kostaman Achyar, S.Kep., Ners.C.SK</p>
      <div className="filters">
        <label>
          Select Year:
          <select
            value={selectedYear}
            onChange={handleChangeYear}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="chart-wrapper">
        <div className="chart-container">
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="patient-list">
        <h2>
          Patient Details for {selectedYear}{" "}
          {selectedMonth !== "" ? chartData.labels[selectedMonth] : ""}
        </h2>
        <div className="filters">
          <label>
            Select Month:
            <select value={selectedMonth} onChange={handleChangeMonth}>
              <option value="">All Months</option>
              {chartData.labels &&
                chartData.labels.map((label, index) => (
                  <option key={index} value={index}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <button onClick={downloadToExcel}>Download Excel</button>
        </div>
        <p className="total-revenue">
          <strong>Total Revenue:</strong>{" "}
          {totalRevenue.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </p>
        <ul className="patient-list-ul">
          {filteredPatients.map((patient) => (
            <li key={patient.id} className="patient-list-item">
              <span className="patient-name">Name:</span>
              <p style={{ color: "blue", fontSize: "14px" }}>
                {patient.name || "Unknown"}
              </p>
              <span className="treatment-cost">
                <strong>Fee:</strong>{" "}
                {Object.values(patient?.medical_records || {})
                  .reduce((acc, record) => {
                    const date = record?.Encounter_period_start
                      ? new Date(record.Encounter_period_start)
                      : null;
                    if (
                      date &&
                      date.getFullYear() === parseInt(selectedYear, 10) &&
                      date.getMonth() === parseInt(selectedMonth, 10)
                    ) {
                      return (
                        acc + convertToNumeric(record?.treatmentCost || "0")
                      );
                    }
                    return acc;
                  }, 0)
                  .toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Revenue;
