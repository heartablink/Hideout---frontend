import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AnalyticsPage.module.scss';
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

// Форматирование подписей оси X — показываем не каждый день
const formatDay = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const tickEvery = (data, n) =>
  data.map((d, i) => ({ ...d, _label: i % n === 0 ? formatDay(d.date) : '' }));

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontSize: 13 }}>
          {p.name}: {prefix}
          {Math.round(p.value).toLocaleString('ru-RU')}
          {suffix}
        </p>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' | 'visitors'

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const { data: res } = await axios.get(
          `http://localhost:4444/api/manager/analytics?period=${period}`,
          { headers },
        );
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p>Загрузка аналитики...</p>
      </div>
    );
  }

  if (!data) return <p className={styles.error}>Не удалось загрузить данные</p>;

  const { kpi, dailyStats, roomStats, categoryStats, hourStats } = data;

  // Прореживаем подписи оси X
  const n = period === '7d' ? 1 : period === '30d' ? 5 : 10;
  const chartData = tickEvery(dailyStats, n);

  return (
    <div className={styles.wrapper}>
      {/* Заголовок + переключатель периода */}
      <div className={styles.header}>
        <h2 className={styles.title}>Аналитика клуба</h2>
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
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.06)' />
            <XAxis
              dataKey='_label'
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (chartMode === 'revenue' ? `${(v / 1000).toFixed(0)}к` : v)}
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

      {/* Нижняя сетка: по комнатам + по часам + по категориям */}
      <div className={styles.bottomGrid}>
        {/* Выручка по комнатам */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Выручка по комнатам</p>
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
                content={<CustomTooltip suffix=' ₽' />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey='revenue' name='Выручка' fill='#4ecca3' radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Загрузка по часам */}
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
                content={<CustomTooltip suffix=' броней' />}
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
