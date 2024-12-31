// Booking.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Booking.css'; // Import the CSS file

const Booking = () => {
  const [bookingList, setBookingList] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        'https://rme-mantri-agus-satusehat-default-rtdb.firebaseio.com/Appointment.json'
      );https://praktek-mandiri-mantri-agus-default-rtdb.asia-southeast1.firebasedatabase.app

      if (response.data) {
        console.log('Fetched data:', response.data);

        const today = new Date().toISOString().split('T')[0];
        const todayBookings = Object.values(response.data).filter(
          (booking) => booking.arrivalPlanDate === today
        );

        console.log('Today\'s bookings:', todayBookings);

        setBookingList(todayBookings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get(
        'https://rme-mantri-agus-satusehat-default-rtdb.firebaseio.com/Appointment.json'
      );

      if (response.data) {
        console.log('Fetched all data:', response.data);

        const allBookings = Object.values(response.data);
        const sortedBookings = allBookings.sort((a, b) => {
          const dateComparison = new Date(b.arrivalPlanDate) - new Date(a.arrivalPlanDate);
          if (dateComparison === 0) {
            const timeA = parseInt(a.arrivalPlanTime.replace(':', ''));
            const timeB = parseInt(b.arrivalPlanTime.replace(':', ''));
            return timeB - timeA;
          }
          return dateComparison;
        });

        setBookingList(sortedBookings);
      }
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  const showModal = () => {
    fetchAllBookings();
    setShowAllBookings(true);
  };

  const closeModal = () => {
    setShowAllBookings(false);
  };

  return (
    <div className="booking-container">
      <button
        onClick={showModal}
        className="button-primary"
      >
        Tampilkan Booking List Pasien
      </button>

      {showAllBookings && (
        <Modal bookings={bookingList} onClose={closeModal} />
      )}
    </div>
  );
};

const Modal = ({ bookings, onClose }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Semua Booking List</h2>
        <p className="real-time-info">
          Real-time: {currentDateTime.toLocaleString('id-ID')}
        </p>
        <button onClick={onClose} className="button-primary">
          Tutup Modal
        </button>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="card">
              {isSameDate(currentDateTime, new Date(booking.arrivalPlanDate)) && (
                <Card booking={booking} />
              )}
            </div>
          ))
        ) : (
          <p className="text-blue-500">
            Belum Ada Pasien Booking di hari ini !!
          </p>
        )}
      </div>
    </div>
  );
};

const Card = ({ booking }) => {
  return (
    <div>
      <p className="text-gray-700">Nama Pasien: {booking.name}</p>
      <p className="text-gray-700">Tanggal Kedatangan: {booking.arrivalPlanDate}</p>
      <p className="text-gray-700">Waktu Kedatangan: {booking.arrivalPlanTime}</p>
      <p className="text-gray-700">Tanggal Lahir: {booking.birthdate}</p>
      <p className="text-gray-700">Nomor Telepon: {booking.phoneNumber}</p>
      <p className="text-gray-700">Opsi Layanan: {booking.serviceOption}</p>
      <p className="text-gray-700">Gejala: {booking.symptoms}</p>
      <p className="text-gray-700">Berat Badan: {booking.weight}</p>
    </div>
  );
};

export default Booking;
