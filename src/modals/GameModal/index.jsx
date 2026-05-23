import React from 'react';
import styles from './GameModal.module.scss';
import { Link } from 'react-router-dom';

const GameModal = ({ game, onClose }) => {
  if (!game) return null;

  const categoryName = game.category_id === 1 ? 'PlayStation 5' : 'VR';
  const isBadgePs5 = game.category_id === 1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.hero}>
          <img
            src={game.image_url}
            alt={game.title}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className={styles.heroOverlay} />
          <span className={`${styles.badge} ${isBadgePs5 ? styles.badgePs : styles.badgeVr}`}>
            {categoryName}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{game.title}</h2>

          <div className={styles.meta}>
            {game.genre && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>🎮</span>
                {game.genre}
              </div>
            )}
            {game.created_at && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span>
                {new Date(game.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>🏷</span>
              {categoryName}
            </div>
          </div>

          <div className={styles.divider} />

          {game.description && (
            <>
              <p className={styles.sectionLabel}>Описание</p>
              <p className={styles.description}>{game.description}</p>
            </>
          )}

          <div className={styles.footer}>
            <div className={styles.availableBadge}>
              <span className={styles.dot} />
              Доступна в клубе
            </div>
            <Link to='/rooms'>
              <button className={styles.bookBtn}>Забронировать комнату</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
