import { useState } from 'react';
import axios from 'axios';
import { PatternFormat } from 'react-number-format';
import styles from './Editprofilemodal.module.scss';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

const EditProfileModal = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user?.name ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');

  // user.phone приходит как '79991234567' — отрезаем первую цифру для маски +7
  const rawPhone = user?.phone ? String(user.phone).replace(/\D/g, '') : '';
  // Если номер начинается с 7 или 8 — отрезаем, иначе берём как есть
  const initialPhone = rawPhone.length === 11 ? rawPhone.slice(1) : rawPhone;

  const [phone, setPhone] = useState(initialPhone);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Имя не может быть пустым';
    if (phone.length !== 10) e.phone = 'Введите полный номер телефона';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const token = localStorage.getItem('token');

      const { data } = await axios.patch(
        `http://localhost:4444/api/me`,
        { name: name.trim(), surname: surname.trim(), phone: '7' + phone },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSaved(data); // { name, surname, phone }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сохранении';
      if (msg.toLowerCase().includes('телефон') || msg.toLowerCase().includes('номер')) {
        setErrors({ phone: msg });
      } else {
        setErrors({ global: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const clearError = (field) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Редактировать профиль</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {/* Имя */}
          <div className={styles.field}>
            <label>
              Имя <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.hasError : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
              placeholder='Введите имя'
              maxLength={50}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          {/* Фамилия */}
          <div className={styles.field}>
            <label>Фамилия</label>
            <input
              className={styles.input}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder='Введите фамилию'
              maxLength={50}
            />
          </div>

          {/* Телефон */}
          <div className={styles.field}>
            <label>
              Номер телефона <span className={styles.required}>*</span>
            </label>
            <div className={`${styles.phoneWrap} ${errors.phone ? styles.hasError : ''}`}>
              <span className={styles.phonePrefix}>+7</span>
              <PatternFormat
                format='(###) ###-##-##'
                allowEmptyFormatting
                mask='_'
                type='tel'
                className={styles.phoneInput}
                value={phone}
                onValueChange={(values) => {
                  setPhone(values.value);
                  clearError('phone');
                }}
              />
            </div>
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </div>

          {errors.global && <p className={styles.globalError}>{errors.global}</p>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
