import React from 'react';
import styles from './NotificationModal.module.scss';

const NotificationModal = ({
  isOpen,
  onClose,
  type = 'success', // 'success' | 'error'
  title = '',
  message = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.icon}>{type === 'success' ? '✓' : '✕'}</div>
        <h2 className={type === 'success' ? styles.successTitle : styles.errorTitle}>{title}</h2>
        {message && <p className={styles.message}>{message}</p>}
        <button className={styles.confirmButton} onClick={onClose}>
          Окей
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
