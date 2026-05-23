import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AnalyticsPage.module.scss';
import { useExportPdf } from './Useexportpdf';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
];

const PIE_COLORS = ['#4ecca3', '#fc90c2', '#7b6ef6', '#f6c94e', '#60a5fa'];

const formatAxisDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getUTCDate()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const formatTooltipDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
};

const CustomTooltip = ({ active, payload, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  const dateStr = payload[0]?.payload?.date;
  return (
    <div className={styles.tooltip}>
      {dateStr && <p className={styles.tooltipLabel}>{formatTooltipDate(dateStr)}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontSize: 13 }}>
          {p.name}:{' '}
          {suffix === ' ₽'
            ? Math.round(p.value).toLocaleString('ru-RU') + ' ₽'
            : Math.round(p.value)}
          {suffix !== ' ₽' ? suffix : ''}
        </p>
      ))}
    </div>
  );
};

const makeTickFormatter = (period) => {
  const n = period === '7d' ? 1 : period === '30d' ? 5 : 10;
  return (dateStr, index) => (index % n === 0 ? formatAxisDate(dateStr) : '');
};

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [chartMode, setChartMode] = useState('revenue');
  const [error, setError] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  const { exportPdf } = useExportPdf();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Пробуем получить адрес филиала из профиля сотрудника
    axios
      .get('http://localhost:4444/api/staff/me', { headers })
      .then((r) => setBranchAddress(r.data?.branch_address || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError('');
        const { data: res } = await axios.get(
          `http://localhost:4444/api/manager/analytics?period=${period}`,
          { headers },
        );
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные аналитики');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  const handleExport = () => {
    if (!data) return;
    setIsExporting(true);
    try {
      exportPdf(
        data.kpi,
        data.dailyStats,
        data.roomStats,
        data.categoryStats,
        period,
        branchAddress,
      );
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p>Загрузка аналитики...</p>
      </div>
    );
  }

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return null;

  const { kpi, dailyStats, roomStats, categoryStats, hourStats } = data;
  const tickFormatter = makeTickFormatter(period);

  return (
    <div className={styles.wrapper}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h2 className={styles.title}>Аналитика клуба</h2>
        <div className={styles.headerRight}>
          <div className={styles.periodTabs}>
            {PERIOD_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`${styles.periodBtn} ${period === o.value ? styles.periodActive : ''}`}
                onClick={() => setPeriod(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Кнопка экспорта */}
          <button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting || !data}
            title='Скачать отчёт PDF'
          >
            {isExporting ? (
              <>
                <span className={styles.exportSpinner} />
                Формируем...
              </>
            ) : (
              <>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' />
                  <polyline points='7 10 12 15 17 10' />
                  <line x1='12' y1='15' x2='12' y2='3' />
                </svg>
                Выгрузить PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI карточки */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Выручка</span>
          <span className={styles.kpiValue}>{kpi.totalRevenue.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Посетителей</span>
          <span className={styles.kpiValue}>{kpi.totalVisitors}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Средний чек</span>
          <span className={styles.kpiValue}>{kpi.avgCheck.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Загрузка комнат</span>
          <span className={styles.kpiValue}>{kpi.occupancyRate}%</span>
        </div>
      </div>

      {/* Основной график */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <p className={styles.chartTitle}>
            {chartMode === 'revenue' ? 'Выручка по дням' : 'Посетители по дням'}
          </p>
          <div className={styles.chartTabs}>
            <button
              className={`${styles.chartTab} ${chartMode === 'revenue' ? styles.chartTabActive : ''}`}
              onClick={() => setChartMode('revenue')}
            >
              Выручка
            </button>
            <button
              className={`${styles.chartTab} ${chartMode === 'visitors' ? styles.chartTabActive : ''}`}
              onClick={() => setChartMode('visitors')}
            >
              Посетители
            </button>
          </div>
        </div>

        <ResponsiveContainer width='100%' height={240}>
          <LineChart data={dailyStats} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.06)' />
            <XAxis
              dataKey='date'
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={tickFormatter}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                chartMode === 'revenue' ? `${(v / 1000).toFixed(0)}к` : String(v)
              }
            />
            <Tooltip content={<CustomTooltip suffix={chartMode === 'revenue' ? ' ₽' : ''} />} />
            {chartMode === 'revenue' ? (
              <Line
                type='monotone'
                dataKey='revenue'
                name='Выручка'
                stroke='#4ecca3'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#4ecca3' }}
              />
            ) : (
              <Line
                type='monotone'
                dataKey='visitors'
                name='Посетители'
                stroke='#fc90c2'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#fc90c2' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Нижняя сетка */}
      <div className={styles.bottomGrid}>
        {/* По комнатам */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Выручка по комнатам</p>
          {roomStats.length === 0 ? (
            <p className={styles.empty}>Нет данных</p>
          ) : (
            <ResponsiveContainer width='100%' height={200}>
              <BarChart
                data={roomStats}
                layout='vertical'
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.06)'
                  horizontal={false}
                />
                <XAxis
                  type='number'
                  tick={{ fill: '#666', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tick={{ fill: '#ccc', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className={styles.tooltip}>
                        <p className={styles.tooltipLabel}>{payload[0]?.payload?.name}</p>
                        <p style={{ color: '#4ecca3', margin: '2px 0', fontSize: 13 }}>
                          Выручка: {Math.round(payload[0]?.value).toLocaleString('ru-RU')} ₽
                        </p>
                        <p style={{ color: '#888', margin: '2px 0', fontSize: 12 }}>
                          Броней: {payload[0]?.payload?.bookings}
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey='revenue' name='Выручка' fill='#4ecca3' radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* По часам */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Популярные часы</p>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={hourStats} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.06)'
                vertical={false}
              />
              <XAxis
                dataKey='hour'
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className={styles.tooltip}>
                      <p className={styles.tooltipLabel}>{payload[0]?.payload?.hour}</p>
                      <p style={{ color: '#7b6ef6', margin: '2px 0', fontSize: 13 }}>
                        Броней: {payload[0]?.value}
                      </p>
                    </div>
                  );
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey='bookings' name='Броней' fill='#7b6ef6' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* По категориям */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>По категориям</p>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width='100%' height={200}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey='revenue'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryStats.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${Math.round(v).toLocaleString('ru-RU')} ₽`, 'Выручка']}
                />
                <Legend
                  iconType='circle'
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#aaa', fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
