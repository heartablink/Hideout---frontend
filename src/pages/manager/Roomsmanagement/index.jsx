import { useState } from 'react';
import styles from './Roomsmanagement.module.scss';

const MOCK_ROOMS = [
  {
    room_id: 1,
    name: 'PlayStation 5 — Зал A',
    category_name: 'PlayStation',
    max_people: 4,
    price: 800,
    is_active: true,
    is_deleted: false,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=220&fit=crop',
    description: 'Просторный зал с новейшими PS5 консолями и 4K телевизорами.',
  },
  {
    room_id: 2,
    name: 'VR Arena',
    category_name: 'VR',
    max_people: 2,
    price: 1200,
    is_active: true,
    is_deleted: false,
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=220&fit=crop',
    description: 'Полное погружение в виртуальную реальность с топовым оборудованием.',
  },
  {
    room_id: 3,
    name: 'PlayStation 5 — VIP',
    category_name: 'PlayStation',
    max_people: 6,
    price: 1500,
    is_active: false,
    is_deleted: false,
    image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=400&h=220&fit=crop',
    description: 'VIP-зал для больших компаний с премиум оборудованием.',
    maintenance_reason: 'Замена оборудования',
  },
  {
    room_id: 4,
    name: 'VR Одиночный',
    category_name: 'VR',
    max_people: 1,
    price: 900,
    is_active: true,
    is_deleted: false,
    image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=220&fit=crop',
    description: 'Приватный VR-кабинет для личного погружения.',
  },
  {
    room_id: 5,
    name: 'PlayStation 5 — Зал B',
    category_name: 'PlayStation',
    max_people: 4,
    price: 800,
    is_active: true,
    is_deleted: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop',
    description: 'Стандартный зал с игровыми консолями и широкоформатными экранами.',
  },
];

const CATEGORY_COLORS = {
  PlayStation: { bg: '#fc90c21a', text: '#fc90c2', border: '#fc90c240' },
  VR: { bg: '#4ecca31a', text: '#4ecca3', border: '#4ecca340' },
};

const ModalOverlay = ({ children, onClose }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const PriceModal = ({ room, onClose, onSave }) => {
  const [newPrice, setNewPrice] = useState(room.price);
  const [error, setError] = useState('');

  const handleSave = () => {
    const val = Number(newPrice);
    if (!val || val <= 0) return setError('Цена должна быть больше нуля');
    if (val === room.price) return setError('Новая цена должна отличаться от текущей');
    onSave(room.room_id, val);
    onClose();
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
        <button className={styles.btnConfirm} onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </ModalOverlay>
  );
};

const MaintenanceModal = ({ room, onClose, onSave }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!reason.trim()) return setError('Укажите причину закрытия');
    onSave(room.room_id, reason);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <h3 className={styles.modalTitle}>Временное закрытие</h3>
      <p className={styles.modalSubtitle}>{room.name}</p>
      <p className={styles.modalHint}>
        Комната будет недоступна для бронирования. Укажите причину.
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
      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnWarning} onClick={handleSave}>
          Закрыть комнату
        </button>
      </div>
    </ModalOverlay>
  );
};

const DeleteModal = ({ room, onClose, onSave }) => (
  <ModalOverlay onClose={onClose}>
    <button className={styles.modalClose} onClick={onClose}>
      ×
    </button>
    <div className={styles.deleteIcon}>🗑</div>
    <h3 className={styles.modalTitle}>Удалить комнату?</h3>
    <p className={styles.modalHint}>
      Комната <strong>«{room.name}»</strong> будет скрыта из каталога. Это действие необратимо.
    </p>
    <div className={styles.modalActions}>
      <button className={styles.btnCancel} onClick={onClose}>
        Отмена
      </button>
      <button
        className={styles.btnDanger}
        onClick={() => {
          onSave(room.room_id);
          onClose();
        }}
      >
        Да, удалить
      </button>
    </div>
  </ModalOverlay>
);

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: '',
    category_name: 'PlayStation',
    max_people: 2,
    price: '',
    description: '',
    image: '',
  });
  const [error, setError] = useState('');

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleCreate = () => {
    if (!form.name.trim()) return setError('Введите название');
    if (!form.price || Number(form.price) <= 0) return setError('Укажите цену больше 0');
    onCreate({
      ...form,
      price: Number(form.price),
      max_people: Number(form.max_people),
      is_active: true,
      is_deleted: false,
    });
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <button className={styles.modalClose} onClick={onClose}>
        ×
      </button>
      <h3 className={styles.modalTitle}>Новая комната</h3>

      <label className={styles.inputLabel}>Название</label>
      <input
        className={styles.input}
        placeholder='PlayStation 5 — Зал C'
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />

      <label className={styles.inputLabel}>Категория</label>
      <select
        className={styles.input}
        value={form.category_name}
        onChange={(e) => set('category_name', e.target.value)}
      >
        <option value='PlayStation'>PlayStation</option>
        <option value='VR'>VR</option>
      </select>

      <div className={styles.formRow}>
        <div style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Макс. человек</label>
          <input
            className={styles.input}
            type='number'
            min='1'
            max='10'
            value={form.max_people}
            onChange={(e) => set('max_people', e.target.value)}
          />
        </div>
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
      </div>

      <label className={styles.inputLabel}>Ссылка на фото (URL)</label>
      <input
        className={styles.input}
        placeholder='https://...'
        value={form.image}
        onChange={(e) => set('image', e.target.value)}
      />

      <label className={styles.inputLabel}>Описание</label>
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        placeholder='Краткое описание комнаты...'
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />

      {error && <p className={styles.inputError}>{error}</p>}
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Отмена
        </button>
        <button className={styles.btnConfirm} onClick={handleCreate}>
          Создать
        </button>
      </div>
    </ModalOverlay>
  );
};

const RoomCard = ({ room, onPrice, onMaintenance, onReopen, onDelete }) => {
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
          <button className={styles.actionBtn} onClick={() => onPrice(room)} title='Изменить цену'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M9 12l2 2 4-4' />
            </svg>
            Цена
          </button>
          {room.is_active ? (
            <button
              className={`${styles.actionBtn} ${styles.actionWarn}`}
              onClick={() => onMaintenance(room)}
              title='Закрыть на обслуживание'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' />
              </svg>
              Закрыть
            </button>
          ) : (
            <button
              className={`${styles.actionBtn} ${styles.actionGreen}`}
              onClick={() => onReopen(room.room_id)}
              title='Открыть комнату'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <polyline points='20 6 9 17 4 12' />
              </svg>
              Открыть
            </button>
          )}
          <button
            className={`${styles.actionBtn} ${styles.actionDanger}`}
            onClick={() => onDelete(room)}
            title='Удалить комнату'
          >
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <polyline points='3 6 5 6 21 6' />
              <path d='M19 6l-1 14H6L5 6' />
              <path d='M10 11v6M14 11v6' />
              <path d='M9 6V4h6v2' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomsManagement = () => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [priceModal, setPriceModal] = useState(null);
  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);

  const handlePriceSave = (id, newPrice) =>
    setRooms((prev) => prev.map((r) => (r.room_id === id ? { ...r, price: newPrice } : r)));

  const handleMaintenanceSave = (id, reason) =>
    setRooms((prev) =>
      prev.map((r) =>
        r.room_id === id ? { ...r, is_active: false, maintenance_reason: reason } : r,
      ),
    );

  const handleReopen = (id) =>
    setRooms((prev) =>
      prev.map((r) =>
        r.room_id === id ? { ...r, is_active: true, maintenance_reason: undefined } : r,
      ),
    );

  const handleDelete = (id) => setRooms((prev) => prev.filter((r) => r.room_id !== id));

  const handleCreate = (room) => setRooms((prev) => [...prev, { ...room, room_id: Date.now() }]);

  const filtered = rooms.filter((r) => {
    if (filterCategory !== 'all' && r.category_name !== filterCategory) return false;
    if (filterStatus === 'active' && !r.is_active) return false;
    if (filterStatus === 'closed' && r.is_active) return false;
    return true;
  });

  const activeCount = rooms.filter((r) => r.is_active).length;
  const closedCount = rooms.filter((r) => !r.is_active).length;

  return (
    <div className={styles.wrapper}>
      {priceModal && (
        <PriceModal
          room={priceModal}
          onClose={() => setPriceModal(null)}
          onSave={handlePriceSave}
        />
      )}
      {maintenanceModal && (
        <MaintenanceModal
          room={maintenanceModal}
          onClose={() => setMaintenanceModal(null)}
          onSave={handleMaintenanceSave}
        />
      )}
      {deleteModal && (
        <DeleteModal
          room={deleteModal}
          onClose={() => setDeleteModal(null)}
          onSave={handleDelete}
        />
      )}
      {createModal && (
        <CreateRoomModal onClose={() => setCreateModal(false)} onCreate={handleCreate} />
      )}

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Управление комнатами</h2>
          <p className={styles.pageSubtitle}>Филиал: ул. Красная, 12</p>
        </div>
        <button className={styles.createBtn} onClick={() => setCreateModal(true)}>
          + Создать комнату
        </button>
      </div>

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

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {['all', 'PlayStation', 'VR'].map((v) => (
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
              onMaintenance={setMaintenanceModal}
              onReopen={handleReopen}
              onDelete={setDeleteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsManagement;
