import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Link } from 'react-router-dom';

import styles from './CurrentBookings.module.scss';
import React, { useState, useEffect } from 'react';

import StartBooking from '../../../assets/svg/startBooking';

import Modal from '../../../modals/StartBooking';

const CurrentBookgns = () => {
  const [dataBooking, setDataBooking] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // setIsLoading(true);

      //только если есть токен
      if (token) {
        const { data } = await axios.get(`http://localhost:4444/api/bookings/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDataBooking(data);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      // setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Определяем класс строки в зависимости от статуса и времени
  const getRowClass = (booking) => {
    const classes = [];

    // Будущая/активная бронь (время окончания ещё не наступило)
    if (booking.date && booking.timeEnd) {
      const bookingDate = new Date(booking.date); // дата брони
      if (!isNaN(bookingDate.getTime())) {
        const [hours, minutes] = booking.timeEnd.split(':').map(Number);
        const bookingEnd = new Date(bookingDate);
        bookingEnd.setHours(hours, minutes, 0, 0); // точное время окончания
        if (bookingEnd > new Date()) {
          classes.push(styles.rowFuture);
        }
      }
    }

    // Отменённая бронь – серый текст
    const statusLower = (booking.status || '').toLowerCase();
    if (statusLower.includes('отменено') || statusLower.includes('canceled')) {
      classes.push(styles.rowCanceled);
    }

    return classes.join(' ');
  };

  const handleBookClick = () => {
    setIsModalOpen(true);
  };

  const canStartBooking = (booking) => {
    // Разрешённые статусы, при которых можно запустить сеанс
    const allowedStatuses = ['Оплачено', 'Ожидает оплаты (наличные)', 'Ожидает оплаты (онлайн)'];
    if (!allowedStatuses.includes(booking.status)) return false;

    // Собираем полную дату и время начала
    if (!booking.date || !booking.timeBegin) return false;
    const [hours, minutes] = booking.timeBegin.split(':').map(Number);
    const bookingStart = new Date(booking.date);
    bookingStart.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = bookingStart.getTime() - now.getTime(); // сколько осталось до начала
    const fifteenMinutes = 15 * 60 * 1000;

    // Кнопка видна, если до начала осталось <= 15 минут и бронь ещё не началась (diffMs >= 0)
    // Или если время начала уже прошло, но бронь ещё активна (можно разрешить и после начала)
    return diffMs <= fifteenMinutes && diffMs >= -fifteenMinutes; // например, ±15 минут от начала
  };

  return (
    <>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
      <section className={`${styles.card} ${styles.fullWidth}`}>
        <h3>История бронирований</h3>
        {/* {bookings.length > 0 ? ( */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Номер бронирования</th>
              <th>Дата</th>
              <th>Комната</th>
              <th>Время</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {dataBooking.map((b) => (
              <tr key={b.id} className={getRowClass(b)}>
                <td>{b.id}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>
                  <Link to={`/room/${b.roomId}`}>
                    <span>{b.roomName}</span>
                  </Link>
                </td>
                <td>
                  {b.timeBegin?.slice(0, 5)} - {b.timeEnd?.slice(0, 5)}
                </td>
                <td>
                  <span className={styles[`status${b.status?.replace(/\s/g, '')}`]}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {canStartBooking(b) && (
                    <Link onClick={handleBookClick} title='Начать сеанс'>
                      <StartBooking />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* ) : (
        <p>Нет истории бронирований</p>
      )} */}
      </section>
    </>
  );
};
export default CurrentBookgns;
