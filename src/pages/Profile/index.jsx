import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Profile.module.scss';
import { useState, useEffect } from 'react';

import ConfirmModal from '../../modals/ConfirmAction';
import NotificationModal from '../../modals/NotificationModal';
import AchievementsBlock from '../../components/ProfileBlocks/Achievementsblock';
import BookingsHistory from '../../components/ProfileBlocks/Bookingshistory';
import TransactionsHistory from '../../components/ProfileBlocks/Transactionshistory';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [cancelBookingInfo, setCancelBookingInfo] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [xpLogs, setXpLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      setUser(null);
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

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:4444/api/me/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchXpLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:4444/api/me/xp-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setXpLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:4444/api/bookings/getUserBookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    fetchClientData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchXpLogs();
      fetchTransactions();
    }
  }, [user]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleCancelClick = (booking) => {
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showNotification('success', 'Готово', 'Бронирование успешно отменено');
      fetchBookings();
      setIsCancelModalOpen(false);
    } catch (err) {
      showNotification('error', 'Ошибка', 'Не удалось отменить бронирование');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone && phone !== 0) return '';
    const cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
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

  const showNotification = (type, title, message) =>
    setNotification({ isOpen: true, type, title, message });
  const closeNotification = () => setNotification({ isOpen: false });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <p className={styles.loading}>Загрузка профиля...</p>
      </div>
    );
  }

  if (!user) return null;

  const minXp = Number(user.level_min_xp) || 0;
  const maxXp = Number(user.level_max_xp) || 1;
  const currentXp = user.xp_amount || 0;
  const progress = Math.min(((currentXp - minXp) / (maxXp - minXp)) * 100, 100);
  const remaining = Math.max(maxXp - currentXp, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Личный кабинет</h1>

      {/* ── ВЕРХНЯЯ ЗОНА ── */}
      <div className={styles.topZone}>
        {/* Большой блок лояльности */}
        <div className={styles.loyaltyHero}>
          <img src={user.lvl_photo} alt={user.level_name} className={styles.heroImage} />
          <p className={styles.heroLevelName}>{user.level_name}</p>
          <p className={styles.heroSubtitle}>Текущий уровень</p>
          <span className={styles.discountBadge}>🏷 Скидка {user.discount * 100}%</span>

          <div className={styles.xpSection}>
            <div className={styles.xpLabelRow}>
              <span>Опыт</span>
              <strong>{currentXp.toLocaleString('ru-RU')} XP</strong>
            </div>
            <div className={styles.xpBarTrack}>
              <div className={styles.xpBarFill} style={{ width: `${progress.toFixed(1)}%` }} />
            </div>
            <div className={styles.xpNumbers}>
              <span>{minXp.toLocaleString('ru-RU')}</span>
              <span>{maxXp.toLocaleString('ru-RU')}</span>
            </div>
            <div className={styles.xpHint}>
              {remaining > 0 ? (
                <>
                  ⚡ До следующего уровня: <strong>{remaining} XP</strong>
                </>
              ) : (
                <>🏆 Максимальный уровень!</>
              )}
            </div>
          </div>
        </div>

        {/* Правая сетка 2×2 */}
        <div className={styles.rightGrid}>
          {/* Личные данные — на всю ширину правой сетки */}
          <div className={`${styles.card} ${styles.userInfo}`}>
            <h3>Личные данные</h3>
            <div className={styles.infoRow}>
              <span>Имя</span>
              <strong>{user.user_info.name}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Телефон</span>
              <strong>{formatPhone(user.phone)}</strong>
            </div>
          </div>

          {/* Депозит */}
          <div className={`${styles.card} ${styles.balance}`}>
            <h3>Депозит</h3>
            <div className={styles.amount}>
              {Number(user.current_balance).toLocaleString('ru-RU')} ₽
            </div>
            <button className={styles.topUpBtn}>Пополнить</button>
          </div>

          {/* Время */}
          <div className={`${styles.card} ${styles.totalTime}`}>
            <h3>Сыграно</h3>
            <div className={styles.timeValue}>{formatHours(user.totalHours)}</div>
            <div className={styles.timeLabel}>в клубах сети</div>
          </div>

          {/* Управление */}
          <div className={`${styles.card} ${styles.actions}`}>
            <h3>Аккаунт</h3>
            <button className={styles.editBtn}>Редактировать</button>
            <button className={styles.deleteBtn}>Удалить профиль</button>
            <button className={styles.logoutBtn} onClick={handleLogoutClick}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* ── ДОСТИЖЕНИЯ — на всю ширину ── */}
      <AchievementsBlock xpLogs={xpLogs} />

      {/* ── НИЖНЯЯ ЗОНА: транзакции + бронирования ── */}
      <div className={styles.bottomZone}>
        <TransactionsHistory transactions={transactions} />
        <BookingsHistory bookings={bookings} onCancelClick={handleCancelClick} />
      </div>

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
  );
};

export default Profile;
