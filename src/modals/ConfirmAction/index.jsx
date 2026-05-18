import styles from './ConfirmAction.module.scss';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены?',
  confirmText = 'Да, подтвердить',
  cancelText = 'Отмена',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modaloverlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.confirmWrapper}>
          <h2>{title}</h2>
          <p>{message}</p>

          <div className={styles.confirmActions}>
            <button className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              {cancelText}
            </button>
            <button className={styles.confirmButton} onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
