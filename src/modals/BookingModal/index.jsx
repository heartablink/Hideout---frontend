import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './BookingModal.module.scss';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom'; // Для перехода на логин
import Cookies from 'js-cookie';

const BookingModal = ({ roomId, onClose }) => {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);

  //если да, то рендерится окно подтверждения бронирования
  const [isConfirming, setIsConfirming] = useState(false);

  // Добавляем состояние для данных пользователя и комнаты
  const [roomInfo, setRoomInfo] = useState(null);
  const [userInfo, setUserInfo] = useState({ balance: 0, discount: 0 });
  const [paymentMethod, setPaymentMethod] = useState('deposit'); // 'deposit' | 'external'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = Cookies.get('token');
        const token = localStorage.getItem('token');
        console.log(token);

        // Получаем расписание, данные комнаты и профиль пользователя параллельно
        const [slotsRes, roomRes, userRes] = await Promise.all([
          axios.get(`http://localhost:4444/api/room/${roomId}/slots`),
          axios.get(`http://localhost:4444/api/room/${roomId}`), // Нужен эндпоинт с ценой комнаты
        ]);

        setSchedule(slotsRes.data);
        setRoomInfo(roomRes.data);

        // 2. Данные юзера грузим только если есть токен
        if (token) {
          try {
            const userRes = await axios.get(`http://localhost:4444/api/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserInfo({
              balance: userRes.data.current_balance || 0,
              discount: userRes.data.discount || 0,
            });
          } catch (e) {
            console.log('Пользователь не авторизован или токен просрочен');
            Cookies.remove('token'); // Чистим битый токен
          }

          console.log('скидка: ', userInfo.discount);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  // Расчет стоимости
  const hoursCount = selectedSlots.length;
  const basePrice = hoursCount * (roomInfo?.price || 0);
  const currentDiscount = paymentMethod === 'deposit' ? userInfo.discount : 0;
  const discountAmount = basePrice * currentDiscount;
  // Итоговая цена
  const totalPrice = basePrice - discountAmount;

  const handleMainAction = () => {
    // const token = Cookies.get('token');
    const token = localStorage.getItem('token');
    console.log('токен', token);

    const cookie = Cookies.get('token');

    // Если не залогинен — отправляем на вход
    if (!cookie) {
      // Можно передать в state текущий URL, чтобы вернуться после логина
      navigate('/auth', { state: { from: window.location.pathname } });
      return;
    }

    //не бронируем сразу, а показываем вопрос о подтверждении
    setIsConfirming(true);

    // // Если залогинен — запускаем логику бронирования
    // handleBooking();
  };

  //следит за ценой чтобы сразу включаить радио по карте если не хвататет средст на счету
  useEffect(() => {
    if (userInfo.balance < totalPrice && paymentMethod === 'deposit' && totalPrice > 0) {
      setPaymentMethod('external');
    }
  }, [totalPrice, userInfo.balance, paymentMethod]);

  const handleBooking = async () => {
    if (hoursCount === 0) return alert('Выберите время');

    try {
      const url =
        paymentMethod === 'deposit'
          ? 'http://localhost:4444/api/bookings/create-deposit'
          : 'http://localhost:4444/api/bookings/create-external';

      const response = await axios.post(
        url,
        {
          roomId,
          date: schedule[selectedDayIndex].date,
          slots: selectedSlots,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );

      alert('Бронирование успешно!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при бронировании');
    }
  };

  const handleSlotClick = (time) => {
    const hour = parseInt(time);

    setSelectedSlots((prev) => {
      if (prev.includes(time)) return prev.filter((t) => t !== time);

      if (prev.length > 0) {
        const hours = prev.map((t) => parseInt(t));
        const min = Math.min(...hours);
        const max = Math.max(...hours);

        // Проверяем, является ли выбранный час соседним к уже выбранным
        if (hour !== min - 1 && hour !== max + 1) {
          alert('Пожалуйста, выбирайте время подряд');
          return prev;
        }
        console.log(basePrice, userInfo.discount, totalPrice);
      }
      return [...prev, time].sort();
    });
  };

  if (loading) return <div className={styles.loader}>Загрузка...</div>;

  const currentDayData = schedule[selectedDayIndex];
  console.log(Cookies.get('token'));

  return (
    <div className={styles.modaloverlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {!isConfirming ? (
          <>
            <h2>Бронирование комнаты</h2>

            {/* 1. ПАНЕЛЬ ВЫБОРА ДАТЫ */}
            <div className={styles.datePicker}>
              {schedule.map((day, index) => (
                <button
                  key={day.date}
                  className={`${styles.dateTab} ${index === selectedDayIndex ? styles.activeTab : ''}`}
                  onClick={() => setSelectedDayIndex(index)}
                >
                  <span className={styles.dayName}>
                    {format(new Date(day.date), 'eeeeee', { locale: ru })}
                  </span>
                  <span className={styles.dayNumber}>{format(new Date(day.date), 'd')}</span>
                </button>
              ))}
            </div>

            {/* 2. СЕТКА СЛОТОВ */}
            <div className={styles.slotsGrid}>
              {currentDayData?.slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.isAvailable}
                  className={`${styles.slotBtn} ${!slot.isAvailable ? styles.disabled : ''} ${selectedSlots.includes(slot.time) ? styles.selected : ''}`}
                  onClick={() => handleSlotClick(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            <hr className={styles.divider} />

            {/* ИТОГО (Цена видна всем, баланс — только своим) */}
            {hoursCount > 0 && (
              <div className={styles.summary}>
                <div className={styles.priceRow}>
                  <span>
                    Выбрано: <strong>{hoursCount} ч.</strong>
                  </span>
                  <span>
                    Общая цена: <strong className={styles.total}>{basePrice} ₽</strong>
                  </span>
                </div>

                {userInfo ? (
                  <div className={styles.paymentMethods}>
                    <h4>
                      Ваш баланс: <strong>{userInfo.balance} ₽</strong>
                    </h4>
                    <div className={styles.options}>
                      {/* радио кнопки выбора метода оплаты */}
                      <div className={styles.paymentOptions}>
                        <label
                          className={`${styles.radioLabel} ${userInfo.balance < totalPrice ? styles.disabled : ''}`}
                        >
                          <input
                            type='radio'
                            name='payment'
                            value='deposit'
                            disabled={userInfo.balance < totalPrice} // Блокируем, если мало денег
                            checked={paymentMethod === 'deposit'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span className={styles.radioText}>
                            Списать с депозита{' '}
                            {userInfo.balance < totalPrice && (
                              <span style={{ color: 'red' }}>(Недостаточно средств на счету)</span>
                            )}
                          </span>
                        </label>

                        <label className={styles.radioLabel}>
                          <input
                            type='radio'
                            name='payment'
                            value='external'
                            checked={paymentMethod === 'external'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span className={styles.radioText}>Оплата картой онлайн</span>
                        </label>
                        <span>ИТОГО:</span>
                        <span>
                          С учетом скидки: <strong className={styles.total}>{totalPrice} ₽</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={styles.loginHint}>
                    Войдите в аккаунт, чтобы использовать бонусы и оплатить с депозита.
                  </p>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <Button onClick={handleMainAction} disabled={hoursCount === 0}>
                {Cookies.get('token') ? 'Забронировать' : 'Войти и забронировать'}
              </Button>
              {Cookies.get('token') && (
                <Button onClick={handleMainAction}>Купить пакет коинсов</Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.confirmWrapper}>
              <h2>Подтверждение заказа</h2>
              <p>Вы действительно хотите забронировать время?</p>
              <div className={styles.confirmDetails}>
                <p>
                  <strong>Дата:</strong>{' '}
                  {format(new Date(currentDayData.date), 'd MMMM', { locale: ru })}
                </p>
                <p>
                  <strong>Время:</strong> {selectedSlots.join(', ')}
                </p>
                <p>
                  <strong>Сумма:</strong> {totalPrice} ₽
                </p>
              </div>

              <div className={styles.confirmActions}>
                <Button onClick={handleBooking}>Да, подтверждаю</Button>
                <button className={styles.backButton} onClick={() => setIsConfirming(false)}>
                  Назад к выбору
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
