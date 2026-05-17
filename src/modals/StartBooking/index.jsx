import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './StartBooking.module.scss';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom'; // Для перехода на логин
import Cookies from 'js-cookie';

const BookingModal = ({ roomId, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = Cookies.get('token');
        const token = localStorage.getItem('token');
        console.log(token);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  return (
    <div className={styles.modaloverlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.confirmWrapper}>
          <h2>Подтверждение начала сеанса</h2>
          <p>
            Вы действительно хотите подтвердить начало сеанса? <br></br>
            <br></br>Если бронирование еще не было оплачено, необходимо будет принять наличные у
            клиента
          </p>
          <div className={styles.confirmDetails}></div>

          <div className={styles.confirmActions}>
            {/* <Button onClick={handleBooking}>Да, подтверждаю</Button> */}
            {/* <button className={styles.backButton} onClick={() => setIsConfirming(false)}>
            Назад к выбору
          </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
