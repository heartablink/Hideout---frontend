import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Roomsmanagement.module.scss';

import NotificationModal from '../../../modals/NotificationModal';

const API = 'http://localhost:4444/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const CATEGORY_COLORS = {
  PlayStation: { bg: '#fc90c21a', text: '#fc90c2', border: '#fc90c240' },
  VR: { bg: '#4ecca31a', text: '#4ecca3', border: '#4ecca340' },
};

// ─── Overlay-обёртка ─────────────────────────────────────────────────────────
const ModalOverlay = ({ children, onClose }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ─── Модалка: изменить цену ──────────────────────────────────────────────────
const PriceModal = ({ room, onClose, onSaved }) => {
  const [newPrice, setNewPrice] = useState(room.price);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const val = Number(newPrice);
    if (!val || val <= 0) return setError('Цена должна быть больше нуля');
    if (val === room.price) return setError('Новая цена должна отличаться от текущей');

    setLoading(true);
    try {
      const { data } = await axios.patch(
        `${API}/manager/rooms/${room.room_id}/price`,
        { price: val },
        { headers: authHeader() },
      );
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <h3 className={styles.modalTitle}>Изменить цену</h3>
      <p className={styles.modalSubtitle}>{room.name}</p>
      <div className={styles.priceRow}>
        <span className={styles.priceLabel}>Текущая цена</span>
        <span className={styles.priceValue}>{room.price} ₽/ч</span>
      </div>
      <label className={styles.inputLabel}>Новая цена (₽/ч)</label>
      <input
        className={styles.input}
        type='number'
        min='1'
        value={newPrice}
        onChange={(e) => {
          setNewPrice(e.target.value);
          setError('');
        }}
      />
      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnConfirm} onClick={handleSave} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ─── Модалка: закрыть на обслуживание ───────────────────────────────────────
const MaintenanceModal = ({ room, onClose, onSaved }) => {
  const [reason, setReason] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) return setError('Укажите причину закрытия');
    if (endAt && startAt && new Date(endAt) <= new Date(startAt)) {
      return setError('Дата окончания не может быть раньше или равна дате начала');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/manager/rooms/${room.room_id}/maintenance`,
        { reason, start_at: startAt || undefined, end_at: endAt || undefined },
        { headers: authHeader() },
      );
      onSaved(room.room_id, reason, data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка закрытия');
    } finally {
      setLoading(false);
    }
  };

  // Минимальная дата — сегодня
  const todayStr = new Date().toISOString().slice(0, 16);

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <h3 className={styles.modalTitle}>Временное закрытие</h3>
      <p className={styles.modalSubtitle}>{room.name}</p>
      <p className={styles.modalHint}>
        Комната будет недоступна для бронирования на указанный период.
      </p>

      <label className={styles.inputLabel}>Причина закрытия</label>
      <input
        className={styles.input}
        placeholder='Напр.: техническое обслуживание, ремонт...'
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
          setError('');
        }}
      />

      <div className={styles.formRow}>
        <div style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Начало</label>
          <input
            className={styles.input}
            type='datetime-local'
            min={todayStr}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Окончание (необязательно)</label>
          <input
            className={styles.input}
            type='datetime-local'
            min={startAt || todayStr}
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
      </div>

      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnWarning} onClick={handleSave} disabled={loading}>
          {loading ? 'Закрытие...' : 'Закрыть комнату'}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ─── Модалка: удалить ────────────────────────────────────────────────────────
const DeleteModal = ({ room, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/manager/rooms/${room.room_id}`, { headers: authHeader() });
      onSaved(room.room_id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <div className={styles.deleteIcon}>🗑</div>
      <h3 className={styles.modalTitle}>Удалить комнату?</h3>
      <p className={styles.modalHint}>
        Комната <strong>«{room.name}»</strong> будет скрыта из каталога. Это действие необратимо.
      </p>
      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnDanger} onClick={handleDelete} disabled={loading}>
          {loading ? 'Удаление...' : 'Да, удалить'}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ─── Модалка: создать / редактировать комнату ────────────────────────────────
const RoomFormModal = ({ editRoom, categories, onClose, onSaved }) => {
  const isEdit = !!editRoom;
  const [form, setForm] = useState({
    name: editRoom?.name ?? '',
    category_id: editRoom?.category_id ?? '',
    max_people: editRoom?.max_people ?? 2,
    price: editRoom?.price ?? '',
    description: editRoom?.description ?? '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(editRoom?.image ?? null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Введите название');
    if (!isEdit && !form.category_id) return setError('Выберите категорию');
    if (!isEdit && (!form.price || Number(form.price) <= 0))
      return setError('Укажите цену больше 0');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);

      let data;
      if (isEdit) {
        // PUT /manager/rooms/:id — редактирование (название, описание, вместимость, фото)
        ({ data } = await axios.put(`${API}/manager/rooms/${editRoom.room_id}`, fd, {
          headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
        }));
      } else {
        // POST /manager/rooms — создание
        ({ data } = await axios.post(`${API}/manager/rooms`, fd, {
          headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
        }));
      }

      onSaved(data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <h3 className={styles.modalTitle}>{isEdit ? 'Редактировать комнату' : 'Новая комнату'}</h3>

      <label className={styles.inputLabel}>Название</label>
      <input
        className={styles.input}
        placeholder='PlayStation 5 — Зал C'
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />

      {/* Категорию при редактировании не меняем */}
      {!isEdit && (
        <>
          <label className={styles.inputLabel}>Категория</label>
          <select
            className={styles.input}
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
          >
            <option value=''>— выберите —</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
        </>
      )}

      <div className={styles.formRow}>
        <div style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Макс. человек</label>
          <input
            className={styles.input}
            type='number'
            min='1'
            max='20'
            value={form.max_people}
            onChange={(e) => set('max_people', e.target.value)}
          />
        </div>
        {/* Цену при редактировании меняют через отдельную кнопку */}
        {!isEdit && (
          <div style={{ flex: 1 }}>
            <label className={styles.inputLabel}>Цена ₽/ч</label>
            <input
              className={styles.input}
              type='number'
              min='1'
              placeholder='800'
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>
        )}
      </div>

      <label className={styles.inputLabel}>Описание</label>
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        placeholder='Краткое описание...'
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />

      <label className={styles.inputLabel}>Фото комнаты</label>
      {preview && (
        <img
          src={preview}
          alt='preview'
          style={{
            width: '100%',
            height: 140,
            objectFit: 'cover',
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
      )}
      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <button
        className={styles.btnCancel}
        style={{ width: '100%', marginBottom: 0 }}
        onClick={() => fileRef.current.click()}
      >
        {preview ? '📷 Заменить фото' : '📷 Загрузить фото'}
      </button>

      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnConfirm} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ─── Модалка: подтвердить открытие комнаты ──────────────────────────────────
const ReopenModal = ({ room, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(room.room_id);
    setLoading(false);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <div className={styles.deleteIcon}>🔓</div>
      <h3 className={styles.modalTitle}>Открыть комнату?</h3>
      <p className={styles.modalHint}>
        Комната <strong>«{room.name}»</strong> будет переведена в активный статус и станет доступна
        для бронирования.
        {room.maintenance_reason && (
          <>
            <br />
            <br />
            Текущая причина закрытия: <em>{room.maintenance_reason}</em>
          </>
        )}
      </p>
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnConfirm} onClick={handleConfirm} disabled={loading}>
          {loading ? 'Открытие...' : 'Да, открыть'}
        </button>
      </div>
    </ModalOverlay>
  );
};

const RoomCard = ({ room, onPrice, onEdit, onMaintenance, onReopen, onDelete }) => {
  const cat = CATEGORY_COLORS[room.category_name] || CATEGORY_COLORS.PlayStation;

  return (
    <div className={`${styles.card} ${!room.is_active ? styles.cardInactive : ''}`}>
      <div className={styles.cardImageWrap}>
        {room.image ? (
          <img src={room.image} alt={room.name} className={styles.cardImage} />
        ) : (
          <div className={styles.cardImagePlaceholder}>🎮</div>
        )}
        <span
          className={styles.categoryBadge}
          style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
        >
          {room.category_name === 'VR' ? '🥽' : '🎮'} {room.category_name}
        </span>
        {!room.is_active && (
          <div className={styles.closedBadge}>
            <span>🔧 На обслуживании</span>
            {room.maintenance_reason && (
              <span className={styles.closedReason}>{room.maintenance_reason}</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardName}>{room.name}</h4>
          <span className={styles.cardPrice}>
            {room.price} ₽<span className={styles.perHour}>/ч</span>
          </span>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>👥 до {room.max_people} чел.</span>
          <span
            className={`${styles.statusDot} ${room.is_active ? styles.statusActive : styles.statusClosed}`}
          >
            {room.is_active ? '● Активна' : '● Закрыта'}
          </span>
        </div>
        {room.description && <p className={styles.cardDesc}>{room.description}</p>}

        <div className={styles.cardActions}>
          {/* Редактировать */}
          <button className={styles.actionBtn} onClick={() => onEdit(room)} title='Редактировать'>
            ✏️ Изменить
          </button>

          {/* Цена */}
          <button className={styles.actionBtn} onClick={() => onPrice(room)} title='Изменить цену'>
            💰 Цена
          </button>

          {/* Закрыть / Открыть */}
          {room.is_active ? (
            <button
              className={`${styles.actionBtn} ${styles.actionWarn}`}
              onClick={() => onMaintenance(room)}
              title='Закрыть на обслуживание'
            >
              🔧 Закрыть
            </button>
          ) : (
            <button
              className={`${styles.actionBtn} ${styles.actionGreen}`}
              onClick={() => onReopen(room)}
              title='Открыть комнату'
            >
              ✅ Открыть
            </button>
          )}

          {/* Удалить */}
          <button
            className={`${styles.actionBtn} ${styles.actionDanger}`}
            onClick={() => onDelete(room)}
            title='Удалить комнату'
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Главный компонент ───────────────────────────────────────────────────────
const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branchAddress, setBranchAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Состояния модалок
  const [priceModal, setPriceModal] = useState(null);
  const [editModal, setEditModal] = useState(null); // null | room (редакт.) | 'create'
  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [reopenModal, setReopenModal] = useState(null); // null | room

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  // ─── Загрузка данных ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, catRes] = await Promise.all([
          axios.get(`${API}/manager/rooms`, { headers: authHeader() }),
          axios.get(`${API}/categories`),
        ]);
        setRooms(roomsRes.data);
        setCategories(catRes.data);
        if (roomsRes.data.length > 0) setBranchAddress(roomsRes.data[0].address);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Колбэки обновления состояния ───────────────────────────────────────

  // Цена обновлена
  const handlePriceSaved = (updatedRoom) => {
    setRooms((prev) =>
      prev.map((r) => (r.room_id === updatedRoom.room_id ? { ...r, price: updatedRoom.price } : r)),
    );
  };

  // Комната создана или отредактирована
  const handleRoomSaved = (savedRoom, isEdit) => {
    if (isEdit) {
      setRooms((prev) =>
        prev.map((r) => (r.room_id === savedRoom.room_id ? { ...r, ...savedRoom } : r)),
      );
    } else {
      // Новая комната — нет данных категории от бэка, добавляем из списка
      const cat = categories.find((c) => c.category_id === Number(savedRoom.category_id));
      setRooms((prev) => [
        ...prev,
        { ...savedRoom, category_name: cat?.name ?? '', is_active: true },
      ]);
    }
  };

  // Закрытие на обслуживание
  const handleMaintenanceSaved = (roomId, reason) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.room_id === roomId ? { ...r, is_active: false, maintenance_reason: reason } : r,
      ),
    );
  };

  // Открытие комнаты (вызывается из модалки подтверждения)
  const handleReopen = async (roomId) => {
    try {
      await axios.delete(`${API}/manager/rooms/${roomId}/maintenance`, { headers: authHeader() });
      setRooms((prev) =>
        prev.map((r) =>
          r.room_id === roomId ? { ...r, is_active: true, maintenance_reason: null } : r,
        ),
      );
    } catch (err) {
      showNotification(
        'error',
        'Ошибка',
        err.response?.data?.message || 'Не удалось открыть комнату',
      );
    }
  };

  // Удаление
  const handleDeleteSaved = (roomId) => {
    setRooms((prev) => prev.filter((r) => r.room_id !== roomId));
  };

  // ─── Фильтрация ─────────────────────────────────────────────────────────
  const filtered = rooms.filter((r) => {
    if (filterCategory !== 'all' && r.category_name !== filterCategory) return false;
    if (filterStatus === 'active' && !r.is_active) return false;
    if (filterStatus === 'closed' && r.is_active) return false;
    return true;
  });

  const activeCount = rooms.filter((r) => r.is_active).length;
  const closedCount = rooms.filter((r) => !r.is_active).length;

  // ─── Рендер ─────────────────────────────────────────────────────────────
  if (loading) return <div style={{ color: '#888', padding: 40 }}>Загрузка комнат...</div>;
  if (error) return <div style={{ color: '#ff4d4d', padding: 40 }}>{error}</div>;

  return (
    <div className={styles.wrapper}>
      {/* Модалки */}
      {priceModal && (
        <PriceModal
          room={priceModal}
          onClose={() => setPriceModal(null)}
          onSaved={handlePriceSaved}
        />
      )}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
      {editModal && (
        <RoomFormModal
          editRoom={editModal === 'create' ? null : editModal}
          categories={categories}
          onClose={() => setEditModal(null)}
          onSaved={handleRoomSaved}
        />
      )}
      {maintenanceModal && (
        <MaintenanceModal
          room={maintenanceModal}
          onClose={() => setMaintenanceModal(null)}
          onSaved={handleMaintenanceSaved}
        />
      )}
      {deleteModal && (
        <DeleteModal
          room={deleteModal}
          onClose={() => setDeleteModal(null)}
          onSaved={handleDeleteSaved}
        />
      )}
      {reopenModal && (
        <ReopenModal
          room={reopenModal}
          onClose={() => setReopenModal(null)}
          onConfirm={handleReopen}
        />
      )}

      {/* Шапка */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Управление комнатами</h2>
          <p className={styles.pageSubtitle}>Филиал: {branchAddress || '—'}</p>
        </div>
        <button className={styles.createBtn} onClick={() => setEditModal('create')}>
          + Создать комнату
        </button>
      </div>

      {/* Статистика */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{rooms.length}</span>
          <span className={styles.statLabel}>Всего комнат</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statNum} ${styles.statGreen}`}>{activeCount}</span>
          <span className={styles.statLabel}>Активных</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statNum} ${styles.statOrange}`}>{closedCount}</span>
          <span className={styles.statLabel}>На обслуживании</span>
        </div>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {['all', ...categories.map((c) => c.name)].map((v) => (
            <button
              key={v}
              className={`${styles.filterBtn} ${filterCategory === v ? styles.filterActive : ''}`}
              onClick={() => setFilterCategory(v)}
            >
              {v === 'all' ? 'Все категории' : v}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          {[
            ['all', 'Все статусы'],
            ['active', '● Активные'],
            ['closed', '● Закрытые'],
          ].map(([v, label]) => (
            <button
              key={v}
              className={`${styles.filterBtn} ${filterStatus === v ? styles.filterActive : ''}`}
              onClick={() => setFilterStatus(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Комнаты не найдены</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((room) => (
            <RoomCard
              key={room.room_id}
              room={room}
              onPrice={setPriceModal}
              onEdit={setEditModal}
              onMaintenance={setMaintenanceModal}
              onReopen={(room) => setReopenModal(room)}
              onDelete={setDeleteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsManagement;
