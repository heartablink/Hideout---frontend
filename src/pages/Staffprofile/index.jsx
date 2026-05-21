import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Staffprofile.module.scss';

const API = 'http://localhost:4444/api';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

/* ── Вспомогательные функции ── */
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const fmtDuration = (open, close) => {
  if (!open || !close) return null;
  const ms = new Date(close) - new Date(open);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}ч ${m}м`;
};

const declineShifts = (n) => {
  const a = Math.abs(n) % 100,
    l = a % 10;
  if (a >= 11 && a <= 19) return 'смен';
  if (l === 1) return 'смена';
  if (l >= 2 && l <= 4) return 'смены';
  return 'смен';
};

const declineLogs = (n) => {
  const a = Math.abs(n) % 100,
    l = a % 10;
  if (a >= 11 && a <= 19) return 'записей';
  if (l === 1) return 'запись';
  if (l >= 2 && l <= 4) return 'записи';
  return 'записей';
};

const PREVIEW = 8;

/* ══════════════════════════════════
   КОМПОНЕНТ
══════════════════════════════════ */
const StaffProfile = ({ onLogout, userRole }) => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [showAllShifts, setShowAllShifts] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isManager = userRole === 'Менеджер';

  /* загрузка */
  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const [meRes, shiftsRes, logsRes] = await Promise.all([
          axios.get(`${API}/staff/me`, { headers: authHeaders() }),
          axios.get(`${API}/staff/shifts`, { headers: authHeaders() }),
          axios.get(`${API}/staff/logs`, { headers: authHeaders() }),
        ]);
        setMe(meRes.data);
        setShifts(shiftsRes.data);
        setLogs(logsRes.data);
        setActiveShift(shiftsRes.data.find((s) => !s.closed_at) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  /* форматируем телефон */
  const formatPhone = (phone) => {
    if (!phone) return '—';
    const c = String(phone).replace(/\D/g, '');
    if (c.length === 11)
      return `+${c[0]} (${c.slice(1, 4)}) ${c.slice(4, 7)}-${c.slice(7, 9)}-${c.slice(9, 11)}`;
    return phone;
  };

  if (isLoading)
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Загрузка профиля...</p>
      </div>
    );

  if (!me) return null;

  const visibleShifts = showAllShifts ? shifts : shifts.slice(0, PREVIEW);
  const visibleLogs = showAllLogs ? logs : logs.slice(0, PREVIEW);
  const hiddenShifts = shifts.length - PREVIEW;
  const hiddenLogs = logs.length - PREVIEW;

  /* статистика */
  const totalShifts = shifts.length;
  const closedShifts = shifts.filter((s) => s.closed_at);
  const totalHours =
    closedShifts.reduce((acc, s) => {
      return acc + (new Date(s.closed_at) - new Date(s.opened_at));
    }, 0) / 3_600_000;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Профиль сотрудника</h1>

      {/* ══ ВЕРХНЯЯ ЗОНА ══ */}
      <div className={styles.topZone}>
        {/* Карточка сотрудника */}
        <div className={styles.staffCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{me.name?.[0]?.toUpperCase() || '?'}</div>
            <span
              className={`${styles.roleBadge} ${isManager ? styles.roleManager : styles.roleAdmin}`}
            >
              {userRole}
            </span>
          </div>
          <h2 className={styles.staffName}>
            {me.name} {me.surname}
          </h2>
          <p className={styles.staffPhone}>{formatPhone(me.phone)}</p>
          <p className={styles.staffBranch}>
            <span className={styles.branchIcon}>📍</span>
            {me.branch_address || 'Филиал не указан'}
          </p>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>

        {/* Статистика */}
        <div className={styles.statsCol}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🕐</span>
              <div className={styles.statValue}>{Math.floor(totalHours)}</div>
              <div className={styles.statLabel}>Часов отработано</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📋</span>
              <div className={styles.statValue}>{totalShifts}</div>
              <div className={styles.statLabel}>{declineShifts(totalShifts)} всего</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>⚡</span>
              <div className={styles.statValue}>{logs.length}</div>
              <div className={styles.statLabel}>Действий в системе</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📅</span>
              <div className={styles.statValue}>
                {closedShifts.length > 0
                  ? new Date(closedShifts[closedShifts.length - 1].opened_at).toLocaleDateString(
                      'ru-RU',
                      { day: 'numeric', month: 'short' },
                    )
                  : '—'}
              </div>
              <div className={styles.statLabel}>Первая смена</div>
            </div>
          </div>

          {/* Текущая активная смена — детали */}
          {activeShift && (
            <div className={styles.activeShiftCard}>
              <div className={styles.activeShiftHeader}>
                <span className={styles.activeShiftDot} />
                <strong>Идёт смена</strong>
              </div>
              <div className={styles.activeShiftRows}>
                <div className={styles.activeShiftRow}>
                  <span>Начало</span>
                  <strong>{fmtDateTime(activeShift.opened_at)}</strong>
                </div>
                <div className={styles.activeShiftRow}>
                  <span>IP рабочего места</span>
                  <strong>{activeShift.ip_address || '—'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ ИСТОРИЯ СМЕН ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>История смен</h3>
          <span className={styles.sectionCount}>
            {shifts.length} {declineShifts(shifts.length)}
          </span>
        </div>

        {shifts.length === 0 ? (
          <div className={styles.empty}>Смен пока не было</div>
        ) : (
          <>
            <div className={styles.shiftsList}>
              {visibleShifts.map((s) => {
                const dur = fmtDuration(s.opened_at, s.closed_at);
                const isOpen = !s.closed_at;
                return (
                  <div
                    key={s.shift_id}
                    className={`${styles.shiftRow} ${isOpen ? styles.shiftRowActive : ''}`}
                  >
                    <div className={styles.shiftRowLeft}>
                      <span
                        className={`${styles.shiftStatus} ${isOpen ? styles.shiftStatusOpen : styles.shiftStatusClosed}`}
                      >
                        {isOpen ? 'Открыта' : 'Завершена'}
                      </span>
                      <span className={styles.shiftDate}>
                        {new Date(s.opened_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className={styles.shiftRowMid}>
                      <span>{fmtDateTime(s.opened_at)}</span>
                      <span className={styles.arrow}>→</span>
                      <span>{s.closed_at ? fmtDateTime(s.closed_at) : <em>сейчас</em>}</span>
                    </div>
                    <div className={styles.shiftRowRight}>
                      {dur && <span className={styles.shiftDur}>{dur}</span>}
                      {s.ip_address && <span className={styles.shiftIp}>{s.ip_address}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {shifts.length > PREVIEW && (
              <button className={styles.showMoreBtn} onClick={() => setShowAllShifts((v) => !v)}>
                {showAllShifts
                  ? 'Свернуть ↑'
                  : `Показать ещё ${hiddenShifts} ${declineShifts(hiddenShifts)} ↓`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ══ ЖУРНАЛ ДЕЙСТВИЙ ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Журнал действий</h3>
          <span className={styles.sectionCount}>
            {logs.length} {declineLogs(logs.length)}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className={styles.empty}>Действий пока нет</div>
        ) : (
          <>
            <div className={styles.logsList}>
              {visibleLogs.map((log) => (
                <div key={log.log_id} className={styles.logRow}>
                  <div className={styles.logIcon}>⚙</div>
                  <div className={styles.logInfo}>
                    <span className={styles.logAction}>{log.action_type}</span>
                    {log.target_user_id && (
                      <span className={styles.logTarget}>клиент #{log.target_user_id}</span>
                    )}
                  </div>
                  <span className={styles.logDate}>{fmtDateTime(log.created_at)}</span>
                </div>
              ))}
            </div>

            {logs.length > PREVIEW && (
              <button className={styles.showMoreBtn} onClick={() => setShowAllLogs((v) => !v)}>
                {showAllLogs
                  ? 'Свернуть ↑'
                  : `Показать ещё ${hiddenLogs} ${declineLogs(hiddenLogs)} ↓`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;
