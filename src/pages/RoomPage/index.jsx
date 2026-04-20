import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RoomPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// Импортируй свои SVG иконки
import People from '../../assets/svg/PeopleSvg';
import Address from '../../assets/svg/AddressSvg';
import PlayStation from '../../assets/svg/PlayStationSvg';
import Vr from '../../assets/svg/VrSvg';

import Modal from '../../modals/BookingModal';

const RoomPage = ({ isAuth }) => {
  const { roomId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState(null); //для слотов

  const handleBookClick = () => {
    // if (!isAuth) {
    // //   // Если не авторизован — отправляем на страницу входа
    //   navigate('/auth');
    //   // Или используй navigate('/auth') из хука useNavigate
    // } else {
    setSelectedRoomId(roomId);
    setIsModalOpen(true);
    // }
  };

  useEffect(() => {
    window.scroll(0, 0);
    const fetchRoomData = async () => {
      try {
        setIsLoading(true);
        // Сбрасываем стейт, чтобы сработал скелетон при смене ID
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

  // Скелетон загрузки
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

  return (
    <div className={styles.root}>
      {isModalOpen && <Modal roomId={selectedRoomId} onClose={() => setIsModalOpen(false)} />}
      {/* 1. Блок Героя (Главная картинка + Заголовок) */}
      <div className={styles.hero}>
        <img src={room.image} alt={room.name} className={styles.mainImage} />
        <div className={styles.heroOverlay}>
          <div className={styles.container}>
            <div className={styles.titleBlock}>
              <div className={styles.categoryBadge}>
                {room.category_name === 'VR' ? <Vr /> : <PlayStation />}
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
          {/* Левая колонка: Описание и Галерея */}
          <div className={styles.details}>
            <div className={styles.section}>
              <h3>Описание</h3>
              <div>
                <ReactMarkdown>
                  {room.description ||
                    'Описание для этой комнаты пока не добавлено. Вас ждут незабываемые впечатления!'}
                </ReactMarkdown>
              </div>
            </div>

            <div className={styles.section}>
              <h3>Удобства</h3>
              <div className={styles.amenities}>
                <div className={styles.amenity}>
                  <People />
                  <span>До {room.max_people} человек</span>
                </div>
                {/* Добавь другие удобства, если они есть в БД */}
                <div className={styles.amenity}>4K Телевизор</div>
                <div className={styles.amenity}>PS5 + 4 Геймпада</div>
                <div className={styles.amenity}>Бесплатный Wi-Fi</div>
              </div>
            </div>
          </div>

          {/* Правая колонка: Блок Бронирования */}
          <div className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.priceBlock}>
                <span className={styles.price}>{room.price} ₽</span>
                <span className={styles.perHour}>/ час</span>
              </div>
              <p className={styles.subtext}>Минимальное бронирование: 2 часа</p>

              <button className={styles.bookButton} onClick={handleBookClick}>
                Забронировать
              </button>

              <div className={styles.divider} />
              <div className={styles.quickInfo}>
                <p>Доступно сегодня с 14:00</p>
                <p>Метро: Павелецкая (5 мин)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
