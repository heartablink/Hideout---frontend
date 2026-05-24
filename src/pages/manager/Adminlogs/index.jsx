import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Adminlogs.module.scss';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Цвета по типу действия
const ACTION_COLORS = {
  1: { color: '#4ecca3', bg: 'rgba(78,204,163,0.1)', border: 'rgba(78,204,163,0.25)' }, // создание брони
  2: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' }, // отмена
  3: { color: '#4ecca3', bg: 'rgba(78,204,163,0.1)', border: 'rgba(78,204,163,0.25)' }, // подтверждение оплаты
  4: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' }, // пополнение депозита
  5: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' }, // закрытие комнаты
  6: { color: '#4ecca3', bg: 'rgba(78,204,163,0.1)', border: 'rgba(78,204,163,0.25)' }, // открытие комнаты
  7: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)' }, // гостевое бронирование
  8: { color: '#4ecca3', bg: 'rgba(78,204,163,0.1)', border: 'rgba(78,204,163,0.25)' }, // начало сеанса
  9: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' }, // неявка
};

const ACTION_ICONS = {
  1: '📅',
  2: '❌',
  3: '✅',
  4: '💰',
  5: '🔧',
  6: '✔️',
  7: '👤',
  8: '▶️',
  9: '🚫',
};

const getActionStyle = (type) =>
  ACTION_COLORS[type] || {
    color: '#fff',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
  };

const formatPhone = (phone) => {
  if (!phone) return '—';
  const c = String(phone).replace(/\D/g, '');
  if (c.length === 11)
    return `+${c[0]} (${c.slice(1, 4)}) ${c.slice(4, 7)}-${c.slice(7, 9)}-${c.slice(9, 11)}`;
  return phone;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  );
};

const LIMIT = 30;

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className={styles.logRow}>
    <div className={styles.logLeft}>
      <div className={`${styles.skeleton} ${styles.skAction}`} />
      <div className={styles.logMeta}>
        <div className={`${styles.skeleton} ${styles.skLine}`} />
        <div className={`${styles.skeleton} ${styles.skLineShort}`} />
      </div>
    </div>
    <div className={`${styles.skeleton} ${styles.skDate}`} />
  </div>
);

// ─── Главный компонент ────────────────────────────────────────────────────────
const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Фильтры
  const [search, setSearch] = useState(''); // поиск по имени сотрудника
  const [staffId, setStaffId] = useState(''); // выбранный сотрудник
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Загрузка списка сотрудников для фильтра
  useEffect(() => {
    axios
      .get(`http://localhost:4444/api/manager/staff`, { headers: authHeaders() })
      .then((r) => setStaff(r.data))
      .catch(() => {});
  }, []);

  // Загрузка логов
  const fetchLogs = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        setError('');
        const params = { page: p, limit: LIMIT };
        if (staffId) params.staffId = staffId;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const { data } = await axios.get(`http://localhost:4444/api/manager/logs`, {
          headers: authHeaders(),
          params,
        });

        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(p);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить логи');
      } finally {
        setLoading(false);
      }
    },
    [staffId, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Фильтрованный список сотрудников по поисковой строке
  const filteredStaff = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.surname.toLowerCase().includes(q) ||
      formatPhone(s.phone).includes(q)
    );
  });

  const handleStaffSelect = (id) => {
    setStaffId((prev) => (prev === String(id) ? '' : String(id)));
    setSearch('');
    setPage(1);
  };

  const handleReset = () => {
    setStaffId('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  const selectedStaff = staff.find((s) => String(s.user_id) === staffId);

  return (
    <div className={styles.wrapper}>
      {/* ── Шапка ──────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Журнал действий</h2>
          <p className={styles.pageSubtitle}>Все действия администраторов вашего филиала</p>
        </div>
        {(staffId || dateFrom || dateTo) && (
          <button className={styles.resetBtn} onClick={handleReset}>
            × Сбросить фильтры
          </button>
        )}
      </div>

      <div className={styles.layout}>
        {/* ── Левая панель фильтров ───────────────────────────────── */}
        <aside className={styles.sidebar}>
          {/* Поиск + список сотрудников */}
          <div className={styles.filterSection}>
            <p className={styles.filterLabel}>Сотрудник</p>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                placeholder='Поиск по имени...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearSearch} onClick={() => setSearch('')}>
                  ×
                </button>
              )}
            </div>

            <div className={styles.staffList}>
              {/* Кнопка "Все сотрудники" */}
              <button
                className={`${styles.staffItem} ${!staffId ? styles.staffActive : ''}`}
                onClick={() => {
                  setStaffId('');
                  setSearch('');
                }}
              >
                <div
                  className={styles.staffAvatar}
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  👥
                </div>
                <div className={styles.staffInfo}>
                  <span className={styles.staffName}>Все сотрудники</span>
                  <span className={styles.staffPhone}>{total} записей</span>
                </div>
                {!staffId && <span className={styles.checkMark}>✓</span>}
              </button>

              {filteredStaff.map((s) => {
                const isActive = String(s.user_id) === staffId;
                const initials = `${s.name[0] ?? ''}${s.surname[0] ?? ''}`.toUpperCase();
                return (
                  <button
                    key={s.user_id}
                    className={`${styles.staffItem} ${isActive ? styles.staffActive : ''}`}
                    onClick={() => handleStaffSelect(s.user_id)}
                  >
                    <div className={styles.staffAvatar}>{initials || '?'}</div>
                    <div className={styles.staffInfo}>
                      <span className={styles.staffName}>
                        {s.name} {s.surname}
                      </span>
                      <span className={styles.staffPhone}>{formatPhone(s.phone)}</span>
                      <span className={styles.staffRole}>{s.role}</span>
                    </div>
                    {isActive && <span className={styles.checkMark}>✓</span>}
                  </button>
                );
              })}

              {filteredStaff.length === 0 && search && (
                <p className={styles.noResults}>Сотрудники не найдены</p>
              )}
            </div>
          </div>

          {/* Фильтр по дате */}
          <div className={styles.filterSection}>
            <p className={styles.filterLabel}>Период</p>
            <div className={styles.dateField}>
              <label>С</label>
              <input
                type='date'
                className={styles.dateInput}
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className={styles.dateField}>
              <label>По</label>
              <input
                type='date'
                className={styles.dateInput}
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Статистика */}
          <div className={styles.statsBlock}>
            <div className={styles.statRow}>
              <span>Всего записей</span>
              <strong>{total}</strong>
            </div>
            {selectedStaff && (
              <div className={styles.statRow}>
                <span>Сотрудник</span>
                <strong>
                  {selectedStaff.name} {selectedStaff.surname}
                </strong>
              </div>
            )}
          </div>
        </aside>

        {/* ── Основной список ─────────────────────────────────────── */}
        <div className={styles.main}>
          {/* Активные фильтры */}
          {(staffId || dateFrom || dateTo) && (
            <div className={styles.activeTags}>
              {selectedStaff && (
                <span className={styles.tag}>
                  👤 {selectedStaff.name} {selectedStaff.surname}
                  <button onClick={() => setStaffId('')}>×</button>
                </span>
              )}
              {dateFrom && (
                <span className={styles.tag}>
                  С {new Date(dateFrom).toLocaleDateString('ru-RU')}
                  <button onClick={() => setDateFrom('')}>×</button>
                </span>
              )}
              {dateTo && (
                <span className={styles.tag}>
                  По {new Date(dateTo).toLocaleDateString('ru-RU')}
                  <button onClick={() => setDateTo('')}>×</button>
                </span>
              )}
            </div>
          )}

          {error && <div className={styles.errorBlock}>⚠️ {error}</div>}

          {/* Список логов */}
          <div className={styles.logsList}>
            {loading ? (
              Array(8)
                .fill(0)
                .map((_, i) => <SkeletonRow key={i} />)
            ) : logs.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyIcon}>📋</p>
                <p>Записи не найдены</p>
                {(staffId || dateFrom || dateTo) && (
                  <button className={styles.resetBtn} onClick={handleReset}>
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              logs.map((log) => {
                const style = getActionStyle(log.action_type);
                const icon = ACTION_ICONS[log.action_type] || '📝';
                return (
                  <div key={log.log_id} className={styles.logRow}>
                    {/* Иконка действия */}
                    <div
                      className={styles.actionIcon}
                      style={{ background: style.bg, border: `1px solid ${style.border}` }}
                    >
                      {icon}
                    </div>

                    {/* Основная информация */}
                    <div className={styles.logLeft}>
                      <div className={styles.logMeta}>
                        <span
                          className={styles.actionBadge}
                          style={{
                            color: style.color,
                            background: style.bg,
                            borderColor: style.border,
                          }}
                        >
                          {log.action_name}
                        </span>

                        <div className={styles.logPeople}>
                          {/* Администратор */}
                          <span className={styles.adminChip}>
                            <span className={styles.chipIcon}>👤</span>
                            {log.admin.name} {log.admin.surname}
                            <span className={styles.chipPhone}>{formatPhone(log.admin.phone)}</span>
                          </span>

                          {/* Целевой пользователь (если есть и отличается от admin) */}
                          {log.target && log.target.id !== log.admin.id && (
                            <>
                              <span className={styles.arrow}>→</span>
                              <span className={styles.targetChip}>
                                <span className={styles.chipIcon}>🙋</span>
                                {log.target.name} {log.target.surname}
                                <span className={styles.chipPhone}>
                                  {formatPhone(log.target.phone)}
                                </span>
                              </span>
                            </>
                          )}
                        </div>

                        {log.shift_id && (
                          <span className={styles.shiftBadge}>Смена #{log.shift_id}</span>
                        )}
                      </div>
                    </div>

                    {/* Дата */}
                    <div className={styles.logDate}>{formatDate(log.created_at)}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Пагинация */}
          {!loading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => fetchLogs(page - 1)}
              >
                ← Назад
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className={styles.dots}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageNum} ${p === page ? styles.pageActive : ''}`}
                        onClick={() => fetchLogs(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => fetchLogs(page + 1)}
              >
                Вперёд →
              </button>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <p className={styles.countHint}>
              Показано {logs.length} из {total} записей
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
