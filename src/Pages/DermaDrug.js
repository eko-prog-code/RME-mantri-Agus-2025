import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DermaDrug.css'; // Change the CSS file name accordingly

const DermaDrug = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the new Firebase endpoint for DermaDrug
    axios
      .get('https://medictech-since-2022-default-rtdb.asia-southeast1.firebasedatabase.app/DermaDrug.json')
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle search and filter when the user enters a keyword
  useEffect(() => {
    const filtered = data.filter((item) =>
      item.title.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchKeyword, data]);

  return (
    <div className="derma-drug">
      <h2>Derma Drug</h2>
      <div className="search">
      <input
          type="text"
          className="search-input border border-blue-500 rounded-md p-2"
          placeholder="Cari Resep Obat berdasarkan Diagnosa Medis..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="loading-container flex justify-center items-center h-screen">
          {/* Adjust the image source and dimensions as needed */}
          <img src="/Animation.gif" alt="Loading Animation" style={{ width: '100px', height: '100px' }} />
        </div>
      ) : (
        <div className="card-container-drug">
          {filteredData.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.title}</h3>
              <ul>
                {/* Adjust the list items based on the desired data structure */}
                <li>{item.senin}</li>
                <li>{item.selasa}</li>
                <li>{item.rabu}</li>
                <li>{item.kamis}</li>
                <li>{item.jumat}</li>
                <li>{item.sabtu}</li>
                <li>{item.minggu}</li>
                <li>{item.siji}</li>
                <li>{item.loro}</li>
                <li>{item.telu}</li>
                <li>{item.papat}</li>
                <li>{item.limo}</li>
                <li>{item.enem}</li>
                <li>{item.pitu}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DermaDrug;
