import { useState } from 'react';
import styles from './Transactionshistory.module.scss';

const PREVIEW_COUNT = 10;

// operation_id из БД
const OPERATION_CONFIG = {
  1: { label: 'Списание за бронирование', sign: '-', className: 'debit', icon: '🎮' },
  2: { label: 'Покупка пакета валюты', sign: '+', className: 'topup', icon: '💳' },
  3: { label: 'Возврат средств', sign: '+', className: 'refund', icon: '↩' },
};

const formatAmount = (amount) => {
  const num = Number(amount);
  return Math.abs(num).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const TransactionsHistory = ({ transactions = [] }) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? transactions : transactions.slice(0, PREVIEW_COUNT);
  const hidden = transactions.length - PREVIEW_COUNT;

  // Считаем итоги
  const totalTopup = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalSpent = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span>💰</span> История транзакций
        </h3>
        <span className={styles.count}>{transactions.length} операций</span>
      </div>

      {/* Мини-статистика */}
      {transactions.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Пополнено всего</span>
            <span className={`${styles.statValue} ${styles.topupColor}`}>
              +{totalTopup.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Потрачено всего</span>
            <span className={`${styles.statValue} ${styles.debitColor}`}>
              -{totalSpent.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🪙</span>
          <p>Транзакций пока нет</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {visible.map((t) => {
              const amount = Number(t.amount);
              const isPositive = amount > 0;
              const config = OPERATION_CONFIG[t.operation_type_id] || {
                label: t.type_name || 'Операция',
                sign: isPositive ? '+' : '-',
                className: isPositive ? 'topup' : 'debit',
                icon: '💱',
              };

              return (
                <div key={t.transaction_id} className={styles.row}>
                  {/* Иконка */}
                  <div className={`${styles.iconWrap} ${styles[config.className + 'Icon']}`}>
                    <span>{config.icon}</span>
                  </div>

                  {/* Описание */}
                  <div className={styles.info}>
                    <span className={styles.opName}>{config.label}</span>
                    {t.comment && <span className={styles.comment}>{t.comment}</span>}
                    <span className={styles.date}>
                      {formatDate(t.created_at)} · {formatTime(t.created_at)}
                    </span>
                  </div>

                  {/* Сумма + баланс */}
                  <div className={styles.amountWrap}>
                    <span className={`${styles.amount} ${styles[config.className + 'Color']}`}>
                      {config.sign}
                      {formatAmount(t.amount)} ₽
                    </span>
                    <span className={styles.balance}>
                      остаток: {Number(t.current_balance).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {transactions.length > PREVIEW_COUNT && (
            <div className={styles.showMoreWrap}>
              <button className={styles.showMoreBtn} onClick={() => setShowAll((v) => !v)}>
                {showAll ? (
                  <>
                    Свернуть <span className={styles.arrow}>↑</span>
                  </>
                ) : (
                  <>
                    Показать ещё {hidden} {declineOps(hidden)}{' '}
                    <span className={styles.arrow}>↓</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

function declineOps(n) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return 'операций';
  if (last === 1) return 'операцию';
  if (last >= 2 && last <= 4) return 'операции';
  return 'операций';
}

export default TransactionsHistory;
