import { useState, useRef } from 'react';
import styles from './Achievementsblock.module.scss';

// Иконки достижений (SVG inline)
const ACHIEVEMENT_ICONS = {
  1: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  2: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path d='M12 6V12L16 14' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
  ),
  3: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M13 2L3 14H12L11 22L21 10H12L13 2Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  4: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  5: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='12' cy='8' r='6' stroke='currentColor' strokeWidth='2' />
      <path
        d='M15.477 12.89L17 22L12 19L7 22L8.523 12.89'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  6: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path d='M12 8V12L15 15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
  ),
  7: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  ),
  8: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M6 9H4.5C3.12 9 2 10.12 2 11.5C2 12.88 3.12 14 4.5 14H6M18 9H19.5C20.88 9 22 10.12 22 11.5C22 12.88 20.88 14 19.5 14H18M6 9V17H18V9M6 9L7 5H17L18 9'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
};

// Цвета для каждой ачивки
const ACHIEVEMENT_COLORS = {
  1: { glow: '#FFD700', bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.4)' },
  2: { glow: '#6EE85A', bg: 'rgba(110,232,90,0.12)', border: 'rgba(110,232,90,0.4)' },
  3: { glow: '#FF6B35', bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.4)' },
  4: { glow: '#4B8BFF', bg: 'rgba(75,139,255,0.12)', border: 'rgba(75,139,255,0.4)' },
  5: { glow: '#FF2D78', bg: 'rgba(255,45,120,0.12)', border: 'rgba(255,45,120,0.4)' },
  6: { glow: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.4)' },
  7: { glow: '#06B6D4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.4)' },
  8: { glow: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)' },
};

const AchievementsBlock = ({ xpLogs = [] }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const achievements = xpLogs;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const scroll = (dir) => {
    trackRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (achievements.length === 0) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.titleIcon}>🏆</span>
            Достижения
          </h3>
          <span className={styles.count}>0 получено</span>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎮</div>
          <p>Сделайте первое бронирование, чтобы получить достижения</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>🏆</span>
          Достижения
        </h3>
        <div className={styles.headerRight}>
          <span className={styles.count}>{achievements.length} получено</span>
          <div className={styles.navBtns}>
            <button className={styles.navBtn} onClick={() => scroll(-1)}>
              ‹
            </button>
            <button className={styles.navBtn} onClick={() => scroll(1)}>
              ›
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.track} ${isDragging ? styles.dragging : ''}`}
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {achievements.map((ach, i) => {
          const colors = ACHIEVEMENT_COLORS[ach.activity_type_id] || ACHIEVEMENT_COLORS[1];
          return (
            <div
              key={ach.log_id}
              className={styles.card}
              style={{
                '--glow': colors.glow,
                '--bg': colors.bg,
                '--border': colors.border,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className={styles.cardGlow} />
              <div className={styles.iconWrap}>
                {ACHIEVEMENT_ICONS[ach.activity_type_id] || ACHIEVEMENT_ICONS[1]}
              </div>
              <div className={styles.xpBadge}>+{ach.xp_gain} XP</div>
              <p className={styles.achName}>{ach.name || `Достижение #${ach.activity_type_id}`}</p>
              <p className={styles.achDate}>
                {new Date(ach.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AchievementsBlock;
