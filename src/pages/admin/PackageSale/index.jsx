import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PackageSale.module.scss';

const PackageSale = () => {
  const [phone, setPhone] = useState('');
  const [client, setClient] = useState(null);
  const [clientError, setClientError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);

  // Шаги: 'search' | 'select' | 'confirm' | 'success'
  const [step, setStep] = useState('search');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get('http://localhost:4444/api/packages', { headers })
      .then((r) => setPackages(r.data))
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    try {
      setIsSearching(true);
      setClientError('');
      setClient(null);
      const { data } = await axios.get(
        `http://localhost:4444/api/packages/search-client?phone=${phone}`,
        { headers },
      );
      setClient(data);
      setStep('select');
    } catch (err) {
      setClientError(err.response?.data?.message || 'Клиент не найден');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        'http://localhost:4444/api/packages/purchase',
        { userId: client.userId, packageId: selectedPkg.package_id },
        { headers },
      );
      setResult(data);
      setStep('success');
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при покупке');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setClient(null);
    setSelectedPkg(null);
    setClientError('');
    setResult(null);
    setStep('search');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Продажа пакетов хайдов</h2>

      {/* ШАГ 1 — поиск клиента */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>1. Клиент</p>
        <div className={styles.searchRow}>
          <input
            className={styles.input}
            placeholder='+7 (999) 999-99-99'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className={styles.searchBtn}
            onClick={handleSearch}
            disabled={isSearching || !phone.trim()}
          >
            {isSearching ? 'Поиск...' : 'Найти'}
          </button>
        </div>

        {clientError && <p className={styles.error}>{clientError}</p>}

        {client && (
          <div className={styles.clientCard}>
            <div className={styles.clientAvatar}>
              {client.name ? client.name[0].toUpperCase() : '?'}
            </div>
            <div className={styles.clientInfo}>
              <strong>{client.name || 'Без имени'}</strong>
              <span>{client.phone}</span>
            </div>
            <div className={styles.clientMeta}>
              <div className={styles.metaItem}>
                <span>Уровень</span>
                <strong>{client.levelName}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>Баланс</span>
                <strong>{client.balance.toLocaleString('ru-RU')} ₽</strong>
              </div>
              <div className={styles.metaItem}>
                <span>XP</span>
                <strong>{client.xp.toLocaleString('ru-RU')}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ШАГ 2 — выбор пакета */}
      {(step === 'select' || step === 'confirm') && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>2. Пакет</p>
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <button
                key={pkg.package_id}
                className={`${styles.pkgCard} ${selectedPkg?.package_id === pkg.package_id ? styles.pkgSelected : ''}`}
                onClick={() => {
                  setSelectedPkg(pkg);
                  setStep('confirm');
                }}
              >
                <span className={styles.pkgName}>{pkg.name}</span>
                <span className={styles.pkgPrice}>
                  {Number(pkg.price).toLocaleString('ru-RU')} ₽
                </span>
                <span className={styles.pkgSub}>
                  {Number(pkg.price).toLocaleString('ru-RU')} хайдов на счёт
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ШАГ 3 — подтверждение оплаты */}
      {step === 'confirm' && selectedPkg && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>3. Подтверждение оплаты</p>
          <div className={styles.confirmCard}>
            <div className={styles.cashIcon}>💵</div>
            <div className={styles.confirmInfo}>
              <p>Попросите клиента передать оплату наличными</p>
              <div className={styles.confirmAmount}>
                {Number(selectedPkg.price).toLocaleString('ru-RU')} ₽
              </div>
              <p className={styles.confirmSub}>
                Пакет «{selectedPkg.name}» — {Number(selectedPkg.price).toLocaleString('ru-RU')}{' '}
                хайдов будут зачислены на счёт клиента
              </p>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setSelectedPkg(null);
                setStep('select');
              }}
            >
              Назад
            </button>
            <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? 'Обработка...' : '✓ Оплата получена'}
            </button>
          </div>
        </div>
      )}

      {/* ШАГ 4 — успех */}
      {step === 'success' && result && (
        <div className={styles.successBlock}>
          <div className={styles.successIcon}>✓</div>
          <h3>Пакет успешно продан!</h3>
          <p>
            Клиенту <strong>{client.name}</strong> зачислено{' '}
            <strong>{result.amount.toLocaleString('ru-RU')} ₽</strong>
          </p>
          <p className={styles.newBalance}>
            Новый баланс: <strong>{result.newBalance.toLocaleString('ru-RU')} ₽</strong>
          </p>
          <button className={styles.confirmBtn} onClick={handleReset}>
            Новая продажа
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageSale;
