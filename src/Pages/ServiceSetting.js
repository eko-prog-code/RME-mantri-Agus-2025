import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceSetting.css'; // Import file CSS untuk styling

const ServiceSetting = () => {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [newOptions, setNewOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/layanan/kategoriLayanan.json');
      setServiceOptions(response.data.options);
      setNewOptions(response.data.options.map(option => ({ ...option })));
    } catch (error) {
      console.error('Error fetching service options', error);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index][field] = value;
    setNewOptions(updatedOptions);
  };

  const handleUpdate = async () => {
    try {
      await axios.put('https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app/layanan/kategoriLayanan.json', {
        options: newOptions,
      });
      alert('Data berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating service options', error);
    }
  };

  return (
    <div className="service-setting-container">
      <h1 className="service-setting-title">Service Setting</h1>
      <form>
        {serviceOptions.map((option, index) => (
          <div key={index} className="service-option">
            <label htmlFor={`value-${index}`} className="block text-sm font-medium text-gray-600">Value</label>
            <input
              type="text"
              id={`value-${index}`}
              value={newOptions[index].value}
              onChange={(e) => handleInputChange(index, 'value', e.target.value)}
              className="input"
            />
            <label htmlFor={`label-${index}`} className="block text-sm font-medium text-gray-600">Label</label>
            <input
              type="text"
              id={`label-${index}`}
              value={newOptions[index].label}
              onChange={(e) => handleInputChange(index, 'label', e.target.value)}
              className="input"
            />
          </div>
        ))}
        <button type="button" onClick={handleUpdate} className="button">Update Data</button>
      </form>
    </div>
  );
};

export default ServiceSetting;
