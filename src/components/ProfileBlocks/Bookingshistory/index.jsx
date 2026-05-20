import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Bookingshistory.module.scss';

const PREVIEW_COUNT = 10;

const statusClass = {
  Оплачено: styles.statusPaid,
  Отменено: styles.statusCanceled,
  Завершено: styles.statusDone,
  'Ожидает оплаты (наличные)': styles.statusCash,
  'Ожидает оплаты (онлайн)': styles.statusPending,
  Просрочено: styles.statusExpired,
};

const BookingsHistory = ({ bookings = [] }) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? bookings : bookings.slice(0, PREVIEW_COUNT);
  const hidden = bookings.length - PREVIEW_COUNT;

  return (
    <section className={`${styles.card} ${styles.fullWidth}`}>
      <div className={styles.header}>
        <h3>История бронирований</h3>
        <span className={styles.totalCount}>{bookings.length} записей</span>
      </div>

      {bookings.length === 0 ? (
        <p className={styles.empty}>Нет истории бронирований</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Дата</th>
                <th>Комната</th>
                <th>Время</th>
                <th>Стоимость</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b, i) => (
                <tr key={b.id} className={i >= PREVIEW_COUNT - 1 && !showAll ? '' : ''}>
                  <td className={styles.idCell}>{b.id}</td>
                  <td>{new Date(b.date).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <Link to={`/room/${b.room_id}`}>
                      <span>{b.roomName}</span>
                    </Link>
                  </td>
                  <td className={styles.timeCell}>
                    {b.timeBegin?.slice(0, 5)}
                    <span className={styles.timeDash}>—</span>
                    {b.timeEnd?.slice(0, 5)}
                  </td>
                  <td className={styles.costCell}>
                    {Number(b.totalCost).toLocaleString('ru-RU')} ₽
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${statusClass[b.status] || styles.statusDefault}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length > PREVIEW_COUNT && (
            <div className={styles.showMoreWrap}>
              <button className={styles.showMoreBtn} onClick={() => setShowAll((v) => !v)}>
                {showAll ? (
                  <>
                    Свернуть <span className={styles.arrow}>↑</span>
                  </>
                ) : (
                  <>
                    Показать ещё {hidden} {declineBookings(hidden)}{' '}
                    <span className={styles.arrow}>↓</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// Склонение слова "бронирование"
function declineBookings(n) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return 'бронирований';
  if (last === 1) return 'бронирование';
  if (last >= 2 && last <= 4) return 'бронирования';
  return 'бронирований';
}

export default BookingsHistory;
