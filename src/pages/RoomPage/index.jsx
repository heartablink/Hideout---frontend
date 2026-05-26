import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RoomPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import People from '../../assets/svg/PeopleSvg';
import Address from '../../assets/svg/AddressSvg';
import PlayStation from '../../assets/svg/PlayStationSvg';
import Vr from '../../assets/svg/VrSvg';

import Modal from '../../modals/BookingModal';

// Возвращает список удобств на основе данных комнаты
const getRoomFeatures = (room) => {
  const features = [];

  // По вместимости
  features.push({
    icon: '👥',
    label: `До ${room.max_people} ${getPeopleDeclension(room.max_people)}`,
  });

  // По категории
  if (room.category_name === 'VR') {
    features.push({ icon: '🥽', label: 'VR-гарнитура' });
    features.push({ icon: '🎮', label: 'Контроллеры движения' });
    features.push({ icon: '🌐', label: 'Библиотека VR-игр' });
  } else {
    features.push({ icon: '🎮', label: 'PlayStation 5' });
    features.push({ icon: '📺', label: '4K телевизор' });
    features.push({ icon: '🕹', label: '4 геймпада DualSense' });
    features.push({ icon: '💿', label: 'Топовые игры PS5' });
  }

  // Общие для всех комнат
  features.push({ icon: '📶', label: 'Бесплатный Wi-Fi' });
  features.push({ icon: '❄️', label: 'Кондиционер' });
  features.push({ icon: '🔒', label: 'Приватная комната' });

  return features;
};

const getPeopleDeclension = (n) => {
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return 'человек';
  if (last === 1) return 'человек';
  if (last >= 2 && last <= 4) return 'человека';
  return 'человек';
};

// Возвращает правила/особенности бронирования
const getRoomRules = () => [
  { icon: '⏱', text: 'Минимальное бронирование — 1 час' },
  { icon: '🕐', text: 'Работаем с 10:00 до 23:00' },
  { icon: '🔔', text: 'Бронируйте заранее — слоты заканчиваются' },
  { icon: '💳', text: 'Оплата депозитом, картой или наличными' },
];

const RoomPage = ({ isAuth }) => {
  const { roomId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const handleBookClick = () => {
    setSelectedRoomId(roomId);
    setIsModalOpen(true);
  };

  useEffect(() => {
    window.scroll(0, 0);
    const fetchRoomData = async () => {
      try {
        setIsLoading(true);
        setRoom(null);
        const { data } = await axios.get(`http://localhost:4444/api/room/${roomId}`);
        setRoom(data);
      } catch (err) {
        console.error('Ошибка:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomData();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
        <div className={styles.content}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} />
        </div>
      </div>
    );
  }

  if (!room) {
    return <div className={styles.errorPage}>Комната не найдена или произошла ошибка сервера.</div>;
  }

  const features = getRoomFeatures(room);
  const rules = getRoomRules();
  const isVR = room.category_name === 'VR';

  return (
    <div className={styles.root}>
      {isModalOpen && <Modal roomId={selectedRoomId} onClose={() => setIsModalOpen(false)} />}

      {/* 1. Герой */}
      <div className={styles.hero}>
        <img src={room.image} alt={room.name} className={styles.mainImage} />
        <div className={styles.heroOverlay}>
          <div className={styles.container}>
            <div className={styles.titleBlock}>
              <div className={styles.categoryBadge}>
                {isVR ? <Vr /> : <PlayStation />}
                <span>{room.category_name}</span>
              </div>
              <h1>{room.name}</h1>
              <p className={styles.address}>
                <Address />
                {room.address || 'Адрес не указан'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Основной контент */}
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Левая колонка */}
          <div className={styles.details}>
            {/* Описание */}
            <div className={styles.section}>
              <h3>Описание</h3>
              <div className={styles.markdownBody}>
                <ReactMarkdown>
                  {room.description ||
                    'Погрузитесь в незабываемый игровой опыт в нашей приватной комнате. Современное оборудование, комфортная обстановка и полная свобода выбора игр — всё для вашего идеального отдыха.'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Что включено */}
            <div className={styles.section}>
              <h3>Что включено</h3>
              <div className={styles.amenities}>
                {features.map((f, i) => (
                  <div key={i} className={styles.amenity}>
                    <span className={styles.amenityIcon}>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Информация о филиале */}
            {room.address && (
              <div className={styles.section}>
                <h3>Расположение</h3>
                <div className={styles.branchCard}>
                  <div className={styles.branchIcon}>📍</div>
                  <div className={styles.branchInfo}>
                    <p className={styles.branchAddress}>{room.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Правила и условия */}
            <div className={styles.section}>
              <h3>Условия бронирования</h3>
              <ul className={styles.rulesList}>
                {rules.map((r, i) => (
                  <li key={i} className={styles.ruleItem}>
                    <span className={styles.ruleIcon}>{r.icon}</span>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Правая колонка: Блок Бронирования (sticky) */}
          <div className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.priceBlock}>
                <span className={styles.price}>{room.price} ₽</span>
                <span className={styles.perHour}>/ час</span>
              </div>
              <p className={styles.subtext}>Оплата в момент бронирования</p>

              <button className={styles.bookButton} onClick={handleBookClick}>
                Забронировать
              </button>

              <div className={styles.divider} />

              {/* Характеристики комнаты в сайдбаре */}
              <div className={styles.quickInfo}>
                <div className={styles.quickInfoRow}>
                  <span>Вместимость</span>
                  <strong>
                    до {room.max_people} {getPeopleDeclension(room.max_people)}
                  </strong>
                </div>
                <div className={styles.quickInfoRow}>
                  <span>Категория</span>
                  <strong>{room.category_name}</strong>
                </div>
                {room.address && (
                  <div className={styles.quickInfoRow}>
                    <span>Адрес</span>
                    <strong className={styles.quickInfoAddress}>{room.address}</strong>
                  </div>
                )}
                <div className={styles.quickInfoRow}>
                  <span>Работаем</span>
                  <strong>10:00 — 23:00</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
