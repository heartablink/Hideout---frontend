// src/pages/manager/ShiftPage/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ShiftPage.module.scss';

const ShiftPage = () => {
  const [shiftStatus, setShiftStatus] = useState(null); // { isOpen, shift }
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchShiftStatus = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('http://localhost:4444/api/shift/status', { headers });
      setShiftStatus(data);
    } catch (err) {
      setError('Не удалось получить статус смены. Либо смена еще не открыта');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftStatus();
  }, []);

  const handleOpenShift = async () => {
    try {
      setIsActionLoading(true);
      setError('');
      setSuccessMessage('');
      const { data } = await axios.post(
        'http://localhost:4444/api/shift/open',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      setSuccessMessage(data.message);
      await fetchShiftStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при открытии смены');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCloseShift = async () => {
    try {
      setIsActionLoading(true);
      setError('');
      setSuccessMessage('');
      const { data } = await axios.post('http://localhost:4444/api/shift/close', {}, { headers });
      setSuccessMessage(data.message);
      await fetchShiftStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при закрытии смены');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.spinner} />
        <p>Загрузка...</p>
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Управление сменой</h2>

      {/* Кнопки */}
      <div className={styles.actions}>
        {!shiftStatus?.isOpen ? (
          <button className={styles.openBtn} onClick={handleOpenShift} disabled={isActionLoading}>
            {isActionLoading ? (
              <>
                <span className={styles.btnSpinner} /> Открытие...
              </>
            ) : (
              '▶ Открыть смену'
            )}
          </button>
        ) : (
          <button className={styles.closeBtn} onClick={handleCloseShift} disabled={isActionLoading}>
            {isActionLoading ? (
              <>
                <span className={styles.btnSpinner} /> Закрытие...
              </>
            ) : (
              '■ Закрыть смену'
            )}
          </button>
        )}
      </div>

      {/* Статус смены */}
      <div className={`${styles.statusCard} ${shiftStatus?.isOpen ? styles.open : styles.closed}`}>
        <div className={styles.statusIndicator}>
          <span className={styles.dot} />
          <span>{shiftStatus?.isOpen ? 'Смена открыта' : 'Смена закрыта'}</span>
        </div>

        {shiftStatus?.isOpen && shiftStatus.shift && (
          <div className={styles.shiftInfo}>
            <div className={styles.infoRow}>
              <span>📍 Филиал:</span>
              <strong>{shiftStatus.shift.branchAddress}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>🕐 Открыта в:</span>
              <strong>{formatter.format(new Date(shiftStatus.shift.openedAt))}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>🔢 ID смены:</span>
              <strong>#{shiftStatus.shift.shiftId}</strong>
            </div>
          </div>
        )}

        {!shiftStatus?.isOpen && (
          <p className={styles.closedHint}>Откройте смену, чтобы начать работу с бронированиями</p>
        )}
      </div>

      {/* Сообщения */}
      {error && <div className={styles.error}>Ошибка: {error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
    </div>
  );
};

export default ShiftPage;
