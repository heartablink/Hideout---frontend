import { useState } from 'react';
import axios from 'axios';
import styles from './Deleteprofilemodal.module.scss';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

const DeleteProfileModal = ({ onClose, onDeleted }) => {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Требуем ввести "УДАЛИТЬ" для подтверждения
  const CONFIRM_WORD = 'УДАЛИТЬ';
  const isReady = confirm === CONFIRM_WORD;

  const handleDelete = async () => {
    if (!isReady) return;
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeleted(); // логаут + редирект — обрабатывается снаружи
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при удалении профиля');
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🗑</span>
        </div>

        <h3 className={styles.title}>Удалить профиль?</h3>
        <p className={styles.description}>
          Это действие <strong>необратимо</strong>. Все ваши данные, история бронирований и
          накопленный опыт будут скрыты. Вы потеряете доступ к аккаунту.
        </p>

        <div className={styles.confirmBlock}>
          <label className={styles.confirmLabel}>
            Введите <span className={styles.word}>{CONFIRM_WORD}</span> для подтверждения
          </label>
          <input
            className={`${styles.input} ${confirm && !isReady ? styles.inputError : ''} ${isReady ? styles.inputReady : ''}`}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder={CONFIRM_WORD}
            autoComplete='off'
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={!isReady || loading}
          >
            {loading ? 'Удаление...' : 'Удалить профиль'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
