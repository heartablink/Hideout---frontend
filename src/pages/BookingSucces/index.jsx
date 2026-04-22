import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './SuccessPage.module.scss';

const SuccessPage = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Получаем ID брони из URL (
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    let timer;

    const checkStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:4444/api/booking/status/${bookingId}`);

        if (res.data.is_paid) {
          setStatus('success');
          clearInterval(timer); // Останавливаем опрос
        }
      } catch (e) {
        console.error('Ошибка при проверке статуса', e);
      }
    };

    // Опрашиваем бэкенд каждые 2 секунды (т.к. вебхук может задержаться)
    timer = setInterval(checkStatus, 2000);

    // Если через 30 секунд ничего не произошло, пишем ошибку
    const timeout = setTimeout(() => {
      clearInterval(timer);
      if (status === 'loading') setStatus('error');
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [bookingId]);

  return (
    <div className={styles.wrapper}>
      {status === 'loading' && (
        <div className={styles.loader}>
          <h2>Проверяем оплату...</h2>
          <div className={styles.spinner}></div>
        </div>
      )}

      {status === 'success' && (
        <div className={styles.successCard}>
          <div className={styles.checkmarkIcon}>✔</div>
          <h1>Оплачено!</h1>
          <p>Ваше бронирование успешно подтверждено.</p>
          <button onClick={() => navigate('/profile')}>В личный кабинет</button>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorCard}>
          <h1>Что-то пошло не так</h1>
          <p>Мы не получили подтверждение оплаты. Если деньги списались, обратитесь в поддержку.</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
