import React, { useState } from 'react';
import axios from 'axios';
import styles from './StartBooking.module.scss';

const BookingModal = ({ booking, onClose, onSuccess, mode = 'start' }) => {
  // mode: 'start' | 'complete'
  // step: 'confirm' | 'cash' | 'success'
  const [step, setStep] = useState('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isCash = booking?.status === 'Ожидает оплаты (наличные)';
  const isComplete = mode === 'complete';

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const url = isComplete
        ? `http://localhost:4444/api/bookings/${booking.id}/complete`
        : `http://localhost:4444/api/bookings/${booking.id}/start`;

      await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!isComplete && isCash) {
        setStep('cash');
      } else {
        setStep('success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при выполнении действия');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashConfirm = async () => {
    try {
      setIsLoading(true);
      setError('');
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') onSuccess?.();
    onClose();
  };

  return (
    <div className={styles.modaloverlay} onClick={handleClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        {/* ШАГ 1: подтверждение */}
        {step === 'confirm' && (
          <div className={styles.confirmWrapper}>
            <h2>
              {isComplete ? 'Подтверждение завершения сеанса' : 'Подтверждение начала сеанса'}
            </h2>
            <p>
              {isComplete
                ? 'Вы уверены, что хотите завершить сеанс? Убедитесь, что гости покинули комнату.'
                : 'Вы действительно хотите подтвердить начало сеанса?'}
            </p>
            {!isComplete && isCash && (
              <p className={styles.cashWarning}>
                Бронирование не оплачено — необходимо принять наличные у клиента.
              </p>
            )}
            <div className={styles.bookingInfo}>
              <div className={styles.infoRow}>
                <span>Комната:</span>
                <strong>{booking?.roomName}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Время:</span>
                <strong>
                  {booking?.timeBegin} — {booking?.timeEnd}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span>Сумма:</span>
                <strong>{booking?.totalCost} ₽</strong>
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={handleClose}>
                Отмена
              </button>
              <button
                className={isComplete ? styles.completeConfirmBtn : styles.confirmButton}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Загрузка...'
                  : isComplete
                    ? 'Да, завершить сеанс'
                    : 'Да, начать сеанс'}
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 2: приём наличных */}
        {step === 'cash' && (
          <div className={styles.confirmWrapper}>
            <div className={styles.cashIcon}>💵</div>
            <h2>Примите оплату наличными</h2>
            <p>Попросите клиента оплатить бронирование:</p>
            <div className={styles.amountBlock}>
              <span className={styles.amount}>{booking?.totalCost} ₽</span>
            </div>
            <div className={styles.bookingInfo}>
              <div className={styles.infoRow}>
                <span>Комната:</span>
                <strong>{booking?.roomName}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Время:</span>
                <strong>
                  {booking?.timeBegin} — {booking?.timeEnd}
                </strong>
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmButton}
                onClick={handleCashConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Подтверждение...' : 'Оплата получена'}
              </button>
              <button className={styles.cancelButton} onClick={handleClose}>
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: успех */}
        {step === 'success' && (
          <div className={styles.confirmWrapper}>
            <div className={styles.successIcon}>✓</div>
            <h2>{isComplete ? 'Сеанс успешно завершён!' : 'Сеанс успешно начат!'}</h2>
            <div className={styles.bookingInfo}>
              <div className={styles.infoRow}>
                <span>Комната:</span>
                <strong>{booking?.roomName}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Время:</span>
                <strong>
                  {booking?.timeBegin} — {booking?.timeEnd}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span>Сумма:</span>
                <strong>{booking?.totalCost} ₽</strong>
              </div>
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmButton} onClick={handleClose}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
