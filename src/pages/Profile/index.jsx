import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Link } from 'react-router-dom';

import styles from './Profile.module.scss';
import { useState, useEffect } from 'react';

import ConfirmModal from '../../modals/ConfirmAction';
import NotificationModal from '../../modals/NotificationModal';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [levelLoyalty, setLevelLoyalty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]); // история бронирований
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [cancelBookingInfo, setCancelBookingInfo] = useState(null); // для текста модалки
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      // Сбрасываем стейт, чтобы сработал скелетон при смене ID
      setUser(null);

      //только если есть токен
      if (token) {
        const { data } = await axios.get(`http://localhost:4444/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } else {
        navigate('/Auth');
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка истории бронирований
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:4444/api/bookings/getUserBookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(data);
    } catch (err) {
      console.error('Ошибка загрузки истории бронирований:', err);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    fetchClientData();
  }, []);

  // Как только user получен, загружаем историю бронирований
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleLogoutClick = () => {
    onLogout(); // Вызываем функцию из App.js
    navigate('/'); // Опционально: редирект на главную после выхода
  };

  const handleCancelClick = async (booking) => {
    setCancelBooking(booking.id);
    setCancelBookingInfo({
      date: booking.date,
      timeBegin: booking.timeBegin,
      timeEnd: booking.timeEnd,
    });
    setIsCancelModalOpen(true);
  };

  const cancelMessage = cancelBookingInfo
    ? `Вы действительно хотите отменить бронирование на ${new Date(cancelBookingInfo.date).toLocaleDateString()} с ${cancelBookingInfo.timeBegin?.slice(0, 5)} до ${cancelBookingInfo.timeEnd?.slice(0, 5)}?`
    : 'Вы действительно хотите отменить бронирование?';

  const handleCancelConfirm = async () => {
    try {
      setIsCancelLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4444/api/bookings/${cancelBooking}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showNotification('success', 'Готово', 'Бронирование успешно отменено');
      fetchBookings(); // обновить список бронирований
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error('Ошибка отмены:', err);
      showNotification('error', 'Ошибка', 'Не удалось отменить бронирование');
    } finally {
      setIsCancelLoading(false);
    }
  };

  //для красивого вывода номера телефона ЗАТЕМ ВЫНЕСТИ В ОТДЕЛЬНУЮ ФУНКЦИЮ
  const formatPhone = (phone) => {
    // если phone — null, undefined или пустая строка — вернём прочерк или пусто
    if (!phone && phone !== 0) return '';

    // приводим к строке (на случай, если пришло число) и удаляем всё нецифровое
    const cleaned = String(phone).replace(/\D/g, '');

    // ожидаем 11 цифр, первая — 7 (или 8)
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }

    // если длина не 11, возвращаем без изменений (или как есть)
    return phone;
  };

  const formatHours = (n) => {
    const abs = Math.abs(n) % 100;
    const lastTwo = abs % 10;
    if (abs >= 11 && abs <= 19) return `${n} часов`;
    if (lastTwo === 1) return `${n} час`;
    if (lastTwo >= 2 && lastTwo <= 4) return `${n} часа`;
    return `${n} часов`;
  };

  // Загрузка или отсутствие пользователя
  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <p className={styles.loading}>Загрузка профиля...</p>
      </div>
    );
  }

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => setNotification({ isOpen: false });

  if (user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Личный кабинет</h1>

        <div className={styles.profileGrid}>
          {/* Левая колонка */}
          <div className={styles.column}>
            <section className={`${styles.card} ${styles.userInfo}`}>
              <h3>Личные данные</h3>
              <div className={styles.infoRow}>
                <span>Имя:</span> <strong>{user.user_info.name}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Телефон:</span> <strong>{formatPhone(user.phone)}</strong>
              </div>
            </section>

            <section className={`${styles.card} ${styles.balance}`}>
              <h3>Ваш депозит</h3>
              <div className={styles.amount}>{user.current_balance}₽</div>
              <button className={styles.topUpBtn}>Пополнить баланс</button>
            </section>
          </div>

          {/* Центральная колонка (уровень лояльности) */}
          <div className={styles.column}>
            <section className={`${styles.card} ${styles.loyalty}`}>
              <div className={styles.heroSide}>
                <img src={user.lvl_photo} alt='Уровень' />
              </div>
              <div className={styles.levelDetails}>
                <h3>Уровень: {user.level_name}</h3>
                <div className={styles.xpBar}>
                  <div className={styles.progress} style={{ width: '70%' }}></div>
                </div>
                <p>
                  {user.xp_amount} / {user.level_max_xp} XP до следующего уровня
                </p>
                <span className={styles.discountBadge}>Скидка {user.discount * 100}%</span>
              </div>
            </section>
          </div>

          {/* Правая колонка */}
          <div className={styles.column}>
            <section className={`${styles.card} ${styles.totalTime}`}>
              <h3>Всего сыграно времени</h3>
              <div className={styles.timeValue}>{formatHours(user.totalHours)}</div>
            </section>

            <section className={`${styles.card} ${styles.actions}`}>
              <h3>Управление</h3>
              <button className={styles.editBtn}>Редактировать профиль</button>
              <button className={styles.deleteBtn}>Удалить профиль</button>
              <button className={styles.logoutBtn} onClick={handleLogoutClick}>
                Выйти
              </button>
            </section>
          </div>

          {/* История бронирований на всю ширину */}
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h3>История бронирований</h3>
            {bookings.length > 0 ? (
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
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/room/${b.room_id}`}>
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
                        {b.status == 'Оплачено' ||
                        b.status == 'Ожидает оплаты (онлайн)' ||
                        b.status == 'Ожидает оплаты (наличные)' ? (
                          <button className={styles.deleteBtn} onClick={() => handleCancelClick(b)}>
                            Отменить
                          </button>
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Нет истории бронирований</p>
            )}
          </section>

          {/* 6. История транзакций */}
          <section className={`${styles.card}`}>
            <h3>Транзакции</h3>
            <div className={styles.scrollList}>
              <div className={styles.logItem}>
                <span>+ 1000 ₽</span>
                <small>Пополнение (Карта)</small>
              </div>
              <div className={styles.logItem}>
                <span className={styles.minus}>- 500 ₽</span>
                <small>Бронь #123</small>
              </div>
            </div>
          </section>

          {/* 7. История наград и активностей */}
          <section className={`${styles.card}`}>
            <h3>Достижения и XP</h3>
            <div className={styles.scrollList}>
              <div className={styles.xpItem}>
                <strong>+ 50 XP</strong>
                <span>За ночную сессию</span>
              </div>
              <div className={styles.xpItem}>
                <strong>+ 200 XP</strong>
                <span>Приглашение друга</span>
              </div>
            </div>
          </section>
        </div>

        {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
        <ConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelConfirm}
          title='Отмена бронирования'
          message={cancelMessage}
          confirmText='Да, отменить'
          cancelText='Отмена'
          isLoading={isCancelLoading}
        />
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>

      // <div className={style.wrapper}>
      //   <Button onClick={handleLogoutClick}>Выйти</Button>
      // </div>
    );
  }
};

export default Profile;
