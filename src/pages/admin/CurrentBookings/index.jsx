import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Link } from 'react-router-dom';

import styles from './CurrentBookings.module.scss';
import React, { useState, useEffect } from 'react';

import StartBooking from '../../../assets/svg/startBooking';

import Loading from '../../../assets/images/loading.gif';

import Modal from '../../../modals/StartBooking';

const CurrentBookgns = () => {
  const [dataBooking, setDataBooking] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalMode, setModalMode] = useState('start'); // 'start' | 'complete'

  const fetchData = async (showLoader = false) => {
    try {
      const token = localStorage.getItem('token');
      if (showLoader) setIsLoading(true); // показываем только если явно попросили
      // setIsLoading(true);

      //только если есть токен
      if (token) {
        const { data } = await axios.get(`http://localhost:4444/api/bookings/today`, {
          headers: { Authorization: `Bearer ${token}` },
          'Cache-Control': 'no-cache', // запретить кэширование
        });
        setDataBooking(data);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;

    const fetchDataWithDelay = async () => {
      await fetchData(true); // дожидаемся завершения запроса
      if (isMounted) {
        // после ответа планируем следующий запрос через 1 минуту
        setTimeout(fetchDataWithDelay, 60000);
      }
    };

    fetchDataWithDelay();

    return () => {
      isMounted = false;
    };
  }, []);

  // Определяем класс строки в зависимости от статуса и времени
  const getRowClass = (booking) => {
    const classes = [];

    // Будущая/активная бронь (время окончания ещё не наступило)
    if (booking.date && booking.timeEnd) {
      const bookingDate = new Date(booking.date); // дата брони
      const statusLower = (booking.status || '').toLowerCase();
      if (!statusLower.includes('завершено')) {
        if (!isNaN(bookingDate.getTime())) {
          const [hours, minutes] = booking.timeEnd.split(':').map(Number);
          const bookingEnd = new Date(bookingDate);
          bookingEnd.setHours(hours, minutes, 0, 0); // точное время окончания
          if (bookingEnd > new Date()) {
            classes.push(styles.rowFuture);
          }
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

  const handleBookClick = (booking) => {
    setSelectedBooking(booking);
    setModalMode('start');
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
    const fifteenMinutes = 30 * 60 * 1000;

    // Кнопка видна, если до начала осталось <= 15 минут и бронь ещё не началась (diffMs >= 0)
    // Или если время начала уже прошло, но бронь ещё активна (можно разрешить и после начала)
    return diffMs <= fifteenMinutes && diffMs >= -fifteenMinutes; // например, ±15 минут от начала
  };

  // Проверяем, заканчивается ли бронь через 5 минут
  const isEndingSoon = (booking) => {
    const allowedStatuses = ['Выполняется'];
    if (!allowedStatuses.includes(booking.status)) return false;

    if (!booking.date || !booking.timeEnd) return false;

    const [hours, minutes] = booking.timeEnd.split(':').map(Number);
    const bookingEnd = new Date(booking.date);
    bookingEnd.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = bookingEnd.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    // Бронь заканчивается через 5 минут или уже заканчивается
    return diffMs >= 0 && diffMs <= fiveMinutes;
  };

  const isOverdue = (booking) => {
    if (booking.status !== 'Выполняется') return false;
    if (!booking.date || !booking.timeEnd) return false;

    const [hours, minutes] = booking.timeEnd.split(':').map(Number);
    const bookingEnd = new Date(booking.date);
    bookingEnd.setHours(hours, minutes, 0, 0);

    return new Date() > bookingEnd; // время уже вышло
  };

  const handleCompleteBooking = async (booking) => {
    // try {
    //   const token = localStorage.getItem('token');
    //   await axios.post(
    //     `http://localhost:4444/api/bookings/${bookingId}/complete`,
    //     {},
    //     { headers: { Authorization: `Bearer ${token}` } },
    //   );
    //   fetchData(); // обновляем список
    // } catch (err) {
    //   console.error('Ошибка завершения:', err.response?.data?.message);
    // }
    setSelectedBooking(booking);
    setModalMode('complete');
    setIsModalOpen(true);
  };

  const refresh = () => {
    fetchData(true);
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          booking={selectedBooking}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchData()} // обновить список после закрытия
        />
      )}
      <section className={`${styles.card} ${styles.fullWidth}`}>
        <h3>Бронирования на сегодня</h3>
        <div className={styles.header}>
          <div className={styles.rowHeader}>
            <button className={styles.reBtn} onClick={() => refresh()}>
              Обновить
            </button>
            <p>Всего бронирований: {dataBooking.length}</p>
          </div>
          {dataBooking.length > 0 && (
            <p className={styles.branchAddress}>
              📍 Филиал: <strong>{dataBooking[0].branchAddress}</strong>
            </p>
          )}
        </div>
        {isLoading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.spinner} />
            <p className={styles.loading}>Загрузка бронирований...</p>
          </div>
        ) : (
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
                  <td className={styles.actionsCell}>
                    {canStartBooking(b) && (
                      <Link onClick={() => handleBookClick(b)} title='Начать сеанс'>
                        <StartBooking />
                      </Link>
                    )}
                    {isOverdue(b) && (
                      <div className={styles.warningWrapper}>
                        <span className={styles.overdueIcon}>🔴</span>
                        <div className={styles.tooltip}>
                          Время сеанса истекло!
                          <br />
                          Проверьте комнату и завершите бронирование.
                          <br />
                          Через 15 минут оно завершится автоматически
                        </div>
                      </div>
                    )}
                    {b.status === 'Выполняется' && (
                      <button
                        className={styles.completeBtn}
                        onClick={() => handleCompleteBooking(b)}
                        title='Завершить сеанс'
                      >
                        Завершить ✓
                      </button>
                    )}
                    {isEndingSoon(b) && (
                      <div className={styles.warningWrapper}>
                        <span
                          className={styles.warningIcon}
                          title='Бронирование заканчивается через 5 минут — проверьте, что гости готовятся к выходу'
                        >
                          ⚠
                        </span>
                        <div className={styles.tooltip}>
                          Бронирование закончится менее чем через 5 мин!
                          <br />
                          Проверьте, что гости готовятся к выходу
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* ) : (
        <p>Нет истории бронирований</p>
      )} */}
      </section>
    </>
  );
};
export default CurrentBookgns;
