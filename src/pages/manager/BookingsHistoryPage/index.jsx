import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import styles from './BookingsHistoryPage.module.scss';

const PERIODS = [
  { value: 'week', label: 'Эта неделя' },
  { value: 'month', label: 'Этот месяц' },
  { value: '3months', label: '3 месяца' },
  { value: 'year', label: 'Этот год' },
  { value: 'all', label: 'Всё время' },
];

const STATUSES = [
  { value: '', label: 'Все статусы' },
  { value: '1', label: 'Оплачено' },
  { value: '3', label: 'Завершено' },
  { value: '4', label: 'Отменено' },
  { value: '5', label: 'Просрочено' },
  { value: '6', label: 'Ожидает (наличные)' },
  { value: '7', label: 'Выполняется' },
  { value: '8', label: 'Неявка' },
];

const STATUS_STYLES = {
  Оплачено: { bg: 'rgba(110,232,90,0.1)', color: '#6ee85a', border: 'rgba(110,232,90,0.25)' },
  Завершено: { bg: 'rgba(160,160,160,0.08)', color: '#888', border: 'rgba(160,160,160,0.2)' },
  Отменено: { bg: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'rgba(255,77,77,0.25)' },
  Просрочено: { bg: 'rgba(120,120,120,0.08)', color: '#666', border: 'rgba(120,120,120,0.2)' },
  'Ожидает оплаты (наличные)': {
    bg: 'rgba(245,158,11,0.1)',
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.25)',
  },
  'Ожидает оплаты (онлайн)': {
    bg: 'rgba(75,139,255,0.1)',
    color: '#4b8bff',
    border: 'rgba(75,139,255,0.25)',
  },
  Выполняется: { bg: 'rgba(78,204,163,0.1)', color: '#4ecca3', border: 'rgba(78,204,163,0.25)' },
  Неявка: { bg: 'rgba(255,107,53,0.1)', color: '#ff6b35', border: 'rgba(255,107,53,0.25)' },
};

const PAGE_SIZE = 20;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const BookingsHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const debouncedSearch = useDebounce(search, 400);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('http://localhost:4444/api/manager/bookings', {
        headers,
        params: { period, search: debouncedSearch, status, page, limit: PAGE_SIZE },
      });
      setBookings(data.bookings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setTotalRevenue(data.totalRevenue);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [period, debouncedSearch, status, page]);

  useEffect(() => {
    setPage(1);
  }, [period, debouncedSearch, status]);
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...bookings].sort((a, b) => {
    let va = a[sortField],
      vb = b[sortField];
    if (sortField === 'date') {
      va = new Date(a.date);
      vb = new Date(b.date);
    }
    if (sortField === 'totalCost') {
      va = a.totalCost;
      vb = b.totalCost;
    }
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className={styles.sortNeutral}>↕</span>;
    return <span className={styles.sortActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const completedCount = bookings.filter((b) => b.statusId === 3).length;
  const cancelledCount = bookings.filter(
    (b) => b.statusId === 4 || b.statusId === 5 || b.statusId === 8,
  ).length;
  const activeCount = bookings.filter(
    (b) => b.statusId === 1 || b.statusId === 6 || b.statusId === 7,
  ).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>История бронирований</h2>
          <p className={styles.subtitle}>Все бронирования вашего филиала</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchBookings} title='Обновить'>
          ↻ Обновить
        </button>
      </div>

      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Всего броней</span>
          <span className={styles.kpiValue}>{total}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Выручка (завершённые)</span>
          <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>
            {totalRevenue.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Завершено</span>
          <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>{completedCount}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Активных</span>
          <span className={`${styles.kpiValue} ${styles.kpiBlue}`}>{activeCount}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Отменено / неявки</span>
          <span className={`${styles.kpiValue} ${styles.kpiRed}`}>{cancelledCount}</span>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.periodTabs}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodBtn} ${period === p.value ? styles.periodActive : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder='Имя, фамилия или телефон...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        <select
          className={styles.statusSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {isLoading ? (
          <div className={styles.loaderWrap}>
            <div className={styles.spinner} />
            <p>Загрузка...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>Бронирований не найдено</p>
            <span>Попробуйте изменить период или фильтры</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thNum}>#</th>
                <th onClick={() => handleSort('date')} className={styles.thSort}>
                  Дата <SortIcon field='date' />
                </th>
                <th>Время</th>
                <th onClick={() => handleSort('roomName')} className={styles.thSort}>
                  Комната <SortIcon field='roomName' />
                </th>
                <th onClick={() => handleSort('clientName')} className={styles.thSort}>
                  Клиент <SortIcon field='clientName' />
                </th>
                <th>Телефон</th>
                <th
                  onClick={() => handleSort('totalCost')}
                  className={`${styles.thSort} ${styles.thRight}`}
                >
                  Сумма <SortIcon field='totalCost' />
                </th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b, i) => {
                const st = STATUS_STYLES[b.status] || {
                  bg: 'rgba(255,255,255,0.05)',
                  color: '#777',
                  border: 'rgba(255,255,255,0.1)',
                };
                return (
                  <tr key={b.id} className={styles.row}>
                    <td className={styles.tdNum}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className={styles.tdDate}>
                      {new Date(b.date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className={styles.tdTime}>
                      <span className={styles.timeRange}>
                        {b.timeBegin}–{b.timeEnd}
                      </span>
                    </td>
                    <td className={styles.tdRoom}>{b.roomName}</td>
                    <td className={styles.tdClient}>
                      <div className={styles.clientCell}>
                        <div className={styles.clientAvatar}>
                          {b.clientName !== '—' ? b.clientName[0].toUpperCase() : '?'}
                        </div>
                        <span>{b.clientName}</span>
                      </div>
                    </td>
                    <td className={styles.tdPhone}>
                      <a href={`tel:${b.clientPhone}`} className={styles.phoneLink}>
                        {b.clientPhone}
                      </a>
                    </td>
                    <td className={styles.tdCost}>
                      <span className={b.isPaid ? styles.costPaid : styles.costUnpaid}>
                        {b.paidSum > 0
                          ? b.paidSum.toLocaleString('ru-RU') + ' ₽'
                          : b.totalCost.toLocaleString('ru-RU') + ' ₽'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: st.bg, color: st.color, borderColor: st.border }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Назад
          </button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className={styles.pageDots}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageNum} ${page === p ? styles.pageActive : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд →
          </button>
        </div>
      )}

      <div className={styles.tableFooter}>
        Показано {sorted.length} из {total} бронирований
      </div>
    </div>
  );
};

export default BookingsHistoryPage;
