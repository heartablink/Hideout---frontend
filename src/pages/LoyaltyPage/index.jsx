import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './LoyaltyPage.module.scss';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

// ─── Цвета для каждого уровня (по level_order) ────────────────────────────
const LEVEL_COLORS = [
  { accent: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)' }, // 1 — серый
  { accent: '#84cc16', bg: 'rgba(132,204,22,0.1)', border: 'rgba(132,204,22,0.3)' }, // 2 — зелёный
  { accent: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' }, // 3 — голубой
  { accent: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' }, // 4 — фиолетовый
  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }, // 5 — золотой
  { accent: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }, // 6+ — красный
];

const getLevelColor = (order) => LEVEL_COLORS[Math.min(order - 1, LEVEL_COLORS.length - 1)];

// Иконки и описания активностей (статичные дефолты, если в БД нет)
const ACTIVITY_ICONS = {
  default: '⚡',
  'Ранняя пташка': '🌅',
  'Счастливые часы': '🕐',
  'Дневной безлимит': '☀️',
  'Локальный патриот': '🏠',
  'Завоеватель сети': '🗺️',
  'Щедрый депозит': '💰',
  Киберспортсмен: '🏆',
  'Легенда Hideout': '👑',
};

const FAQ_ITEMS = [
  {
    q: 'Как начисляется XP?',
    a: 'XP начисляется автоматически после завершения бронирования и оплаты сеанса. Также можно получить XP за выполнение специальных активностей — ранние брони, длительные сессии, посещение всех филиалов сети.',
  },
  {
    q: 'Когда применяется скидка?',
    a: 'Скидка применяется автоматически при оформлении бронирования с оплатой через депозит. Размер скидки соответствует вашему текущему уровню лояльности.',
  },
  {
    q: 'Можно ли потерять уровень?',
    a: 'Нет. Уровень лояльности повышается по мере накопления XP и никогда не понижается. Ваш прогресс сохраняется навсегда.',
  },
  {
    q: 'Что такое пакеты хайдов?',
    a: 'Пакеты хайдов — это виртуальная валюта клуба, которую можно пополнить на депозитный счёт. Оплачивая игру с депозита, вы получаете скидку вашего уровня и не тратите время на расчёты на ресепшене.',
  },
  {
    q: 'Суммируются ли скидки?',
    a: 'Скидка уровня лояльности применяется одна — по вашему текущему уровню. Акционные скидки и специальные предложения описываются отдельно.',
  },
];

// ─── Компонент FAQ ────────────────────────────────────────────────────────────
const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={() => setOpen(!open)}>
        {item.q}
        <span className={`${styles.faqIcon} ${open ? styles.open : ''}`}>+</span>
      </button>
      {open && <div className={styles.faqAnswer}>{item.a}</div>}
    </div>
  );
};

// ─── Скелетон-заглушка ────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`${styles.skeleton} ${className || ''}`} />;

// ─── Главный компонент ────────────────────────────────────────────────────────
const LoyaltyPage = () => {
  const [tab, setTab] = useState('levels');
  const [selectedLevel, setSelected] = useState(0); // индекс в массиве levels
  const [data, setData] = useState({ levels: [], activities: [], packages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: res } = await axios.get(`http://localhost:4444/api/loyalty/info`);
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные о программе лояльности');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { levels, activities, packages } = data;
  const currentLevel = levels[selectedLevel] || null;
  const currentColor = currentLevel ? getLevelColor(currentLevel.level_order) : LEVEL_COLORS[0];

  // Следующий уровень для отображения прогресса
  const nextLevel = levels[selectedLevel + 1] || null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className={styles.hero}>
          <p className={styles.heroBadge}>ПРОГРАММА ЛОЯЛЬНОСТИ</p>
          <h1 className={styles.heroTitle}>Hideout Rewards</h1>
          <p className={styles.heroSub}>
            Играй, накапливай XP и открывай эксклюзивные скидки. Чем выше уровень — тем больше
            выгода.
          </p>

          <div className={styles.tabRow}>
            {[
              ['levels', '🏆 Уровни'],
              ['activities', '⚡ Активности'],
              ['packages', '💎 Пакеты'],
              ['faq', '❓ FAQ'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`${styles.tabBtn} ${tab === key ? styles.active : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ошибка ───────────────────────────────────────────────────── */}
        {error && <div className={styles.errorBlock}>⚠️ {error}</div>}

        {/* ════════════════════════════════════════════════════════════════
            TAB: УРОВНИ
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'levels' && (
          <>
            {loading ? (
              <div className={styles.detailCard} style={{ border: '1px solid #222' }}>
                <div className={styles.detailImage}>
                  <Skeleton className={styles.skeletonImage} />
                  <Skeleton className={styles.skeletonBadge} />
                </div>
                <div className={styles.detailInfo}>
                  <Skeleton className={styles.skeletonTitle} />
                  <Skeleton className={styles.skeletonText} />
                  <Skeleton className={styles.skeletonText} />
                </div>
              </div>
            ) : (
              currentLevel && (
                <div
                  className={styles.detailCard}
                  style={{
                    borderColor: currentColor.border,
                    boxShadow: `0 0 40px ${currentColor.bg}`,
                  }}
                >
                  {/* Левая колонка — герой уровня */}
                  <div className={styles.detailImage}>
                    {currentLevel.photo ? (
                      <img
                        src={currentLevel.photo}
                        alt={currentLevel.name}
                        className={styles.heroImage}
                      />
                    ) : (
                      <div
                        className={styles.heroImagePlaceholder}
                        style={{ background: currentColor.bg, borderColor: currentColor.border }}
                      >
                        <span className={styles.heroEmoji}>
                          {
                            ['🥚', '🌱', '⚔️', '💎', '🔥', '👑'][
                              Math.min(currentLevel.level_order - 1, 5)
                            ]
                          }
                        </span>
                      </div>
                    )}

                    <div
                      className={styles.discountBadge}
                      style={{
                        color: currentColor.accent,
                        borderColor: currentColor.border,
                        background: currentColor.bg,
                      }}
                    >
                      <span>🎁</span>
                      <span>−{Math.round(currentLevel.discount * 100)}% скидка</span>
                    </div>
                  </div>

                  {/* Правая колонка — инфо */}
                  <div className={styles.detailInfo}>
                    <div>
                      <p className={styles.levelOrder}>УРОВЕНЬ {currentLevel.level_order}</p>
                      <h2 className={styles.levelName} style={{ color: currentColor.accent }}>
                        {currentLevel.name}
                      </h2>
                    </div>

                    {currentLevel.description && (
                      <p className={styles.levelDescription}>{currentLevel.description}</p>
                    )}

                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <p className={styles.statLabel}>Минимум XP</p>
                        <p className={styles.statValue} style={{ color: currentColor.accent }}>
                          {currentLevel.min_xp.toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className={styles.statCard}>
                        <p className={styles.statLabel}>Макс. XP</p>
                        <p className={styles.statValue}>
                          {currentLevel.max_xp ? currentLevel.max_xp.toLocaleString('ru-RU') : '∞'}
                        </p>
                      </div>
                      <div className={styles.statCard}>
                        <p className={styles.statLabel}>Скидка</p>
                        <p className={styles.statValue} style={{ color: currentColor.accent }}>
                          {Math.round(currentLevel.discount * 100)}%
                        </p>
                      </div>
                      <div className={styles.statCard}>
                        <p className={styles.statLabel}>Уровень</p>
                        <p className={styles.statValue}>
                          {currentLevel.level_order} / {levels.length}
                        </p>
                      </div>
                    </div>

                    {/* Прогресс до следующего уровня */}
                    {nextLevel && (
                      <div className={styles.xpProgress}>
                        <div className={styles.xpLabels}>
                          <span className={styles.xpCurrent} style={{ color: currentColor.accent }}>
                            {currentLevel.name}
                          </span>
                          <span className={styles.xpRange}>
                            до {nextLevel.name}: {nextLevel.min_xp.toLocaleString('ru-RU')} XP
                          </span>
                        </div>
                        <div className={styles.xpBarBg}>
                          <div
                            className={styles.xpBarFill}
                            style={{
                              width: '100%',
                              background: `linear-gradient(90deg, ${currentColor.accent}80, ${currentColor.accent})`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Сетка всех уровней */}
            <p className={styles.timelineTitle}>Все уровни</p>
            <div className={styles.timelineGrid}>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <Skeleton className={styles.skeletonAvatar} />
                        <Skeleton className={styles.skeletonSmall} />
                        <Skeleton className={styles.skeletonSmall} />
                      </div>
                    ))
                : levels.map((lvl, idx) => {
                    const col = getLevelColor(lvl.level_order);
                    const isActive = idx === selectedLevel;
                    return (
                      <div
                        key={lvl.level_id}
                        className={`${styles.timelineItem} ${isActive ? styles.active : ''}`}
                        style={isActive ? { borderColor: col.border, background: col.bg } : {}}
                        onClick={() => setSelected(idx)}
                      >
                        {/* Фото героя или эмодзи */}
                        {lvl.photo ? (
                          <img src={lvl.photo} alt={lvl.name} className={styles.timelineAvatar} />
                        ) : (
                          <div
                            className={styles.timelineAvatarPlaceholder}
                            style={{ background: col.bg, color: col.accent }}
                          >
                            {['🥚', '🌱', '⚔️', '💎', '🔥', '👑'][Math.min(lvl.level_order - 1, 5)]}
                          </div>
                        )}
                        <p
                          className={styles.timelineName}
                          style={isActive ? { color: col.accent } : {}}
                        >
                          {lvl.name}
                        </p>
                        <p className={styles.timelineXp}>
                          от {Number(lvl.min_xp).toLocaleString('ru-RU')} XP
                        </p>
                        <p className={styles.timelineDiscount} style={{ color: col.accent }}>
                          −{Math.round(lvl.discount * 100)}%
                        </p>
                      </div>
                    );
                  })}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: АКТИВНОСТИ
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'activities' && (
          <>
            <div className={styles.activitiesGrid}>
              {loading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className={styles.activityCard}>
                        <Skeleton className={styles.skeletonIcon} />
                        <div style={{ flex: 1 }}>
                          <Skeleton className={styles.skeletonSmall} />
                          <Skeleton className={styles.skeletonText} />
                        </div>
                      </div>
                    ))
                : activities.map((act) => {
                    // Определяем — повторяемая активность или ачивка (один раз)
                    // По названию: если xp_reward небольшой — повторяемая
                    const isRepeat = act.xp_reward <= 100;
                    const icon = ACTIVITY_ICONS[act.name] || ACTIVITY_ICONS.default;
                    const col = isRepeat
                      ? { accent: '#4ecca3', border: '#4ecca340', bg: '#4ecca310' }
                      : { accent: '#a855f7', border: '#a855f740', bg: '#a855f710' };

                    return (
                      <div
                        key={act.activity_id}
                        className={styles.activityCard}
                        style={{ borderLeftColor: col.accent }}
                      >
                        <span className={styles.activityIcon}>{icon}</span>
                        <div className={styles.activityContent}>
                          <div className={styles.activityHeader}>
                            <span className={styles.activityName}>{act.name}</span>
                            <span
                              className={styles.activityXp}
                              style={{
                                color: col.accent,
                                borderColor: col.border,
                                background: col.bg,
                              }}
                            >
                              +{act.xp_reward} XP
                            </span>
                          </div>
                          {act.description && (
                            <p className={styles.activityDesc}>{act.description}</p>
                          )}
                          <span
                            className={`${styles.activityBadge} ${isRepeat ? styles.repeat : styles.once}`}
                          >
                            {isRepeat ? '↻ Повторяемая' : '★ Один раз'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>

            <div className={styles.rulesBlock}>
              <h3>Как это работает</h3>
              <ul>
                <li>
                  <strong>Повторяемые</strong> активности можно выполнять при каждом бронировании
                </li>
                <li>
                  <strong>Одноразовые</strong> ачивки засчитываются только первый раз
                </li>
                <li>
                  XP начисляется <strong>мгновенно</strong> после завершения сеанса
                </li>
                <li>
                  При достижении нового уровня <strong>скидка обновляется автоматически</strong>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: ПАКЕТЫ
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'packages' && (
          <>
            <div className={styles.currencyInfo}>
              <p className={styles.currencyTitle}>💎 Что такое депозит?</p>
              <p className={styles.currencyDesc}>
                Внутренний счёт, которым удобно расплачиваться за бронирование. При оплате с
                депозита автоматически применяется скидка вашего уровня лояльности. Пополнить счёт
                можно наличными на ресепшене или онлайн в личном кабинете.
              </p>
            </div>

            <div className={styles.packagesGrid}>
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className={styles.packageCard}>
                      <Skeleton className={styles.skeletonIcon} />
                      <Skeleton className={styles.skeletonTitle} />
                      <Skeleton className={styles.skeletonText} />
                    </div>
                  ))
              ) : packages.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', gridColumn: '1/-1' }}>
                  Пакеты пока не настроены. Обратитесь на ресепшен.
                </p>
              ) : (
                packages.map((pkg, idx) => {
                  const isPopular = idx === Math.floor(packages.length / 2);
                  const icons = ['🪙', '💰', '💎', '👑'];
                  return (
                    <div
                      key={pkg.package_id}
                      className={`${styles.packageCard} ${isPopular ? styles.popular : ''}`}
                    >
                      {isPopular && <div className={styles.popularBadge}>ПОПУЛЯРНЫЙ</div>}
                      <div className={styles.packageIcon}>
                        {icons[Math.min(idx, icons.length - 1)]}
                      </div>
                      <p className={styles.packageName}>{pkg.name}</p>
                      <p className={`${styles.packagePrice} ${isPopular ? styles.popular : ''}`}>
                        {pkg.price.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className={styles.packageRubHint}>зачисляется на депозит</p>
                      <p className={styles.packageDesc}>
                        Пополните счёт на {pkg.price.toLocaleString('ru-RU')} ₽ и играйте без
                        расчётов на ресепшене
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Пример экономии */}
            {levels.length > 0 && (
              <div className={styles.exampleBlock}>
                <h3>Пример экономии по уровням</h3>
                <div className={styles.exampleGrid}>
                  {levels
                    .filter((l) => Number(l.discount) > 0)
                    .map((lvl) => {
                      const col = getLevelColor(lvl.level_order);
                      const basePrice = 1000;
                      const discountAmt = Math.round(basePrice * Number(lvl.discount));
                      return (
                        <div key={lvl.level_id} className={styles.exampleCard}>
                          <p className={styles.exampleLabel}>{lvl.name} · 1 час бронирования</p>
                          <p className={styles.oldPrice}>{basePrice} ₽</p>
                          <p className={styles.newPrice} style={{ color: col.accent }}>
                            {basePrice - discountAmt} ₽
                          </p>
                          <p className={styles.saved}>экономия {discountAmt} ₽</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: FAQ
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'faq' && (
          <div className={styles.faqContainer}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
