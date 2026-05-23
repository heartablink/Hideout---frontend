import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './GuestBooking.module.scss';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

// Генерируем слоты 10:00–23:00
const ALL_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 10;
  return `${String(h).padStart(2, '0')}:00`;
});

// Следующие 14 дней
const getDays = () =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      isToday: i === 0,
    };
  });

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <span>{toast.message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
};

// ─── Главный компонент ────────────────────────────────────────────────────────
const GuestBooking = () => {
  const DAYS = getDays();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setRoom] = useState(null);
  const [slots, setSlots] = useState([]); // занятые слоты для выбранной комнаты+даты
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedDay, setDay] = useState(DAYS[0].value);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [payment, setPayment] = useState('cash'); // 'cash' | 'paid'

  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [success, setSuccess] = useState(null); // данные успешного бронирования

  const showToast = (message, type = 'error') => setToast({ message, type });

  // Загружаем комнаты филиала
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        const { data } = await axios.get(`http://localhost:4444/api/admin/branchrooms`, {
          headers: authHeaders(),
        });
        setRooms(data);
      } catch (err) {
        showToast(err.response?.data?.message || 'Не удалось загрузить комнаты');
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Загружаем занятые слоты при смене комнаты или даты
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSelectedSlots([]);
        const { data } = await axios.get(`${API}/room/${selectedRoom.room_id}/slots`);
        // Находим нужный день
        const dayData = data.find((d) => d.date === selectedDay);
        setSlots(dayData?.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedRoom, selectedDay]);

  const handleSlotClick = (time) => {
    const slotObj = slots.find((s) => s.time === time);
    if (!slotObj?.isAvailable) return;

    setSelectedSlots((prev) => {
      if (prev.includes(time)) return prev.filter((t) => t !== time);

      if (prev.length > 0) {
        const hours = prev.map((t) => parseInt(t));
        const min = Math.min(...hours);
        const max = Math.max(...hours);
        const hour = parseInt(time);
        if (hour !== min - 1 && hour !== max + 1) {
          showToast('Выбирайте слоты подряд', 'warning');
          return prev;
        }
      }
      return [...prev, time].sort();
    });
  };

  const totalCost = selectedSlots.length * (selectedRoom?.price || 0);
  const timeRange = selectedSlots.length
    ? `${selectedSlots[0]} — ${String(parseInt(selectedSlots[selectedSlots.length - 1]) + 1).padStart(2, '0')}:00`
    : null;

  const handleSubmit = async () => {
    if (!selectedRoom) return showToast('Выберите комнату');
    if (!selectedSlots.length) return showToast('Выберите время');

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${API}/bookings/create-guest`,
        {
          roomId: selectedRoom.room_id,
          date: selectedDay,
          slots: selectedSlots,
          guestName: guestName.trim() || 'Гость',
          guestPhone: guestPhone.trim(),
          paymentMethod: payment,
        },
        { headers: authHeaders() },
      );

      setSuccess({
        bookingId: data.booking.booking_id,
        room: selectedRoom.name,
        date: new Date(selectedDay).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
        time: timeRange,
        total: data.totalCost,
        guestName: data.guestName,
        payment,
      });

      // Сброс формы
      setSelectedSlots([]);
      setGuestName('');
      setGuestPhone('');
      setPayment('cash');
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => setSuccess(null);

  // ── Экран успеха ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.wrapper}>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>✓</div>
          <h2>Бронирование создано</h2>
          <div className={styles.successCard}>
            <div className={styles.successRow}>
              <span>№ брони</span>
              <strong>#{success.bookingId}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Гость</span>
              <strong>{success.guestName}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Комната</span>
              <strong>{success.room}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Дата</span>
              <strong>{success.date}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Время</span>
              <strong>{success.time}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Сумма</span>
              <strong className={styles.totalHighlight}>
                {Number(success.total).toLocaleString('ru-RU')} ₽
              </strong>
            </div>
            <div className={styles.successRow}>
              <span>Оплата</span>
              <strong>
                {success.payment === 'paid' ? '✓ Оплачено' : '⏳ Наличные при заезде'}
              </strong>
            </div>
          </div>
          {success.payment === 'cash' && (
            <p className={styles.cashHint}>
              Не забудьте получить оплату наличными у гостя перед началом сеанса
            </p>
          )}
          <button className={styles.newBookingBtn} onClick={handleNewBooking}>
            + Новое бронирование
          </button>
        </div>
      </div>
    );
  }

  // ── Основной экран ────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Гостевое бронирование</h2>
          <p className={styles.pageSubtitle}>Бронирование на месте без учётной записи клиента</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Левая колонка: комнаты ──────────────────────────────── */}
        <div className={styles.col}>
          <p className={styles.sectionLabel}>1. Выберите комнату</p>
          <div className={styles.roomList}>
            {roomsLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <div key={i} className={styles.roomSkeleton} />)
              : rooms.map((room) => (
                  <button
                    key={room.room_id}
                    className={`${styles.roomCard} ${selectedRoom?.room_id === room.room_id ? styles.roomActive : ''}`}
                    onClick={() => {
                      setRoom(room);
                      setSelectedSlots([]);
                    }}
                  >
                    <div className={styles.roomCardLeft}>
                      {room.image ? (
                        <img src={room.image} alt={room.name} className={styles.roomThumb} />
                      ) : (
                        <div className={styles.roomThumbPlaceholder}>🎮</div>
                      )}
                      <div>
                        <p className={styles.roomName}>{room.name}</p>
                        <p className={styles.roomMeta}>
                          <span className={styles.catBadge}>{room.category_name}</span>
                          <span>👥 до {room.max_people} чел.</span>
                        </p>
                      </div>
                    </div>
                    <div className={styles.roomPrice}>
                      {Number(room.price).toLocaleString('ru-RU')} ₽/ч
                    </div>
                  </button>
                ))}
          </div>

          {/* ── Данные гостя ─────────────────────────────────────── */}
          <p className={styles.sectionLabel} style={{ marginTop: 28 }}>
            2. Данные гостя <span className={styles.optional}>(необязательно)</span>
          </p>
          <div className={styles.guestForm}>
            <div className={styles.inputWrap}>
              <label>Имя</label>
              <input
                className={styles.input}
                placeholder='Иван'
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div className={styles.inputWrap}>
              <label>Телефон</label>
              <input
                className={styles.input}
                placeholder='+7 (___) ___-__-__'
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          </div>

          {/* ── Оплата ───────────────────────────────────────────── */}
          <p className={styles.sectionLabel} style={{ marginTop: 28 }}>
            3. Способ оплаты
          </p>
          <div className={styles.paymentOptions}>
            <label className={`${styles.payOption} ${payment === 'cash' ? styles.payActive : ''}`}>
              <input
                type='radio'
                name='payment'
                value='cash'
                checked={payment === 'cash'}
                onChange={() => setPayment('cash')}
              />
              <span className={styles.payIcon}>💵</span>
              <div>
                <p className={styles.payLabel}>Наличные при заезде</p>
                <p className={styles.payHint}>Гость платит на ресепшене</p>
              </div>
            </label>
            <label className={`${styles.payOption} ${payment === 'paid' ? styles.payActive : ''}`}>
              <input
                type='radio'
                name='payment'
                value='paid'
                checked={payment === 'paid'}
                onChange={() => setPayment('paid')}
              />
              <span className={styles.payIcon}>✓</span>
              <div>
                <p className={styles.payLabel}>Уже оплачено</p>
                <p className={styles.payHint}>Отметить как оплаченное</p>
              </div>
            </label>
          </div>
        </div>

        {/* ── Правая колонка: дата + слоты + итог ────────────────── */}
        <div className={styles.col}>
          <p className={styles.sectionLabel}>4. Выберите дату и время</p>

          {/* Дни */}
          <div className={styles.dayScroll}>
            {DAYS.map((d) => (
              <button
                key={d.value}
                className={`${styles.dayBtn} ${selectedDay === d.value ? styles.dayActive : ''}`}
                onClick={() => {
                  setDay(d.value);
                  setSelectedSlots([]);
                }}
              >
                {d.isToday && <span className={styles.todayDot} />}
                {d.label}
              </button>
            ))}
          </div>

          {/* Слоты */}
          {!selectedRoom ? (
            <div className={styles.noRoom}>← Сначала выберите комнату</div>
          ) : slotsLoading ? (
            <div className={styles.slotsGrid}>
              {ALL_SLOTS.map((s) => (
                <div key={s} className={styles.slotSkeleton} />
              ))}
            </div>
          ) : (
            <>
              <div className={styles.legend}>
                <span>
                  <i className={`${styles.dot} ${styles.dotFree}`} />
                  Свободно
                </span>
                <span>
                  <i className={`${styles.dot} ${styles.dotSelected}`} />
                  Выбрано
                </span>
                <span>
                  <i className={`${styles.dot} ${styles.dotBusy}`} />
                  Занято
                </span>
              </div>
              <div className={styles.slotsGrid}>
                {ALL_SLOTS.map((time) => {
                  const slotObj = slots.find((s) => s.time === time);
                  const available = slotObj?.isAvailable ?? false;
                  const selected = selectedSlots.includes(time);
                  const reason = slotObj?.reason;

                  return (
                    <button
                      key={time}
                      disabled={!available}
                      title={
                        !available
                          ? reason === 'Maintenance'
                            ? 'Обслуживание'
                            : reason === 'Past'
                              ? 'Прошедшее время'
                              : 'Занято'
                          : ''
                      }
                      className={`${styles.slot}
                        ${selected ? styles.slotSelected : ''}
                        ${!available ? styles.slotUnavailable : styles.slotFree}
                        ${reason === 'Maintenance' ? styles.slotMaintenance : ''}
                      `}
                      onClick={() => handleSlotClick(time)}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Итоговая карточка ───────────────────────────────── */}
          {selectedSlots.length > 0 && selectedRoom && (
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Комната</span>
                <strong>{selectedRoom.name}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Время</span>
                <strong>{timeRange}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>
                  {selectedSlots.length} ч × {Number(selectedRoom.price).toLocaleString('ru-RU')} ₽
                </span>
                <strong className={styles.totalHighlight}>
                  {Number(totalCost).toLocaleString('ru-RU')} ₽
                </strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Оплата</span>
                <strong>{payment === 'cash' ? 'Наличные' : 'Оплачено'}</strong>
              </div>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading
                  ? 'Создаём...'
                  : `Создать бронирование · ${Number(totalCost).toLocaleString('ru-RU')} ₽`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestBooking;
