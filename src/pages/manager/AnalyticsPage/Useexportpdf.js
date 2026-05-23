import { useRef, useCallback } from 'react';

/**
 * Хук для экспорта аналитики в PDF.
 * Использует только браузерные API (window.print / CSS @media print)
 * без внешних зависимостей — работает в любом окружении.
 *
 * Альтернатива: если хочешь jsPDF, установи:
 *   npm install jspdf html2canvas
 * и используй вариант с jsPDF ниже (закомментирован).
 */
export const useExportPdf = () => {
  const reportRef = useRef(null);

  const exportPdf = useCallback(
    (kpi, dailyStats, roomStats, categoryStats, period, branchAddress) => {
      const periodLabels = { '7d': '7 дней', '30d': '30 дней', '90d': '90 дней' };
      const periodLabel = periodLabels[period] || period;

      const now = new Date();
      const dateStr = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      // Строим HTML-таблицу по комнатам
      const roomRows = roomStats
        .map(
          (r) => `
      <tr>
        <td>${r.name}</td>
        <td>${r.bookings}</td>
        <td>${Math.round(r.revenue).toLocaleString('ru-RU')} ₽</td>
        <td>${r.bookings > 0 ? Math.round(r.revenue / r.bookings).toLocaleString('ru-RU') : 0} ₽</td>
      </tr>
    `,
        )
        .join('');

      // Строим мини-график выручки по дням как ASCII-бар
      const maxRev = Math.max(...dailyStats.map((d) => d.revenue), 1);
      const chartRows = dailyStats
        .filter((d) => d.revenue > 0 || d.visitors > 0)
        .map((d) => {
          const barLen = Math.round((d.revenue / maxRev) * 30);
          const bar = '█'.repeat(barLen) + '░'.repeat(30 - barLen);
          const date = new Date(d.date);
          const label = `${date.getUTCDate()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
          return `
          <tr>
            <td style="white-space:nowrap;color:#888;font-size:11px">${label}</td>
            <td style="font-family:monospace;font-size:9px;color:#4ecca3;letter-spacing:-1px">${bar}</td>
            <td style="text-align:right;white-space:nowrap;font-size:11px">${Math.round(d.revenue).toLocaleString('ru-RU')} ₽</td>
            <td style="text-align:right;white-space:nowrap;font-size:11px;color:#888">${d.visitors} чел.</td>
          </tr>
        `;
        })
        .join('');

      const categoryRows = categoryStats
        .map(
          (c) => `
      <tr>
        <td>${c.name}</td>
        <td>${c.bookings}</td>
        <td>${Math.round(c.revenue).toLocaleString('ru-RU')} ₽</td>
      </tr>
    `,
        )
        .join('');

      const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <title>Отчёт Hideout — ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
      color: #1a1a1d;
      background: #fff;
      padding: 40px;
      font-size: 13px;
      line-height: 1.5;
    }

    /* Шапка */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1a1a1d;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .brand { display: flex; flex-direction: column; gap: 2px; }
    .brand-name { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .brand-sub  { font-size: 12px; color: #666; }
    .report-meta { text-align: right; font-size: 12px; color: #666; }
    .report-meta strong { display: block; font-size: 14px; color: #1a1a1d; margin-bottom: 2px; }

    /* KPI */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .kpi-card {
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
    .kpi-value { font-size: 22px; font-weight: 700; color: #1a1a1d; margin-top: 4px; }
    .kpi-green { color: #2d9e7a; }
    .kpi-blue  { color: #2563eb; }

    /* Секции */
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #888;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #eee;
    }

    /* Таблицы */
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 8px 10px;
      font-size: 12px;
      border-bottom: 1px solid #f5f5f5;
      color: #1a1a1d;
    }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafafa; }

    /* График */
    .chart-table td { padding: 4px 8px; }

    /* Футер */
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #aaa;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 20px; }
      .kpi-grid { grid-template-columns: repeat(4, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-name">HIDEOUT</div>
      <div class="brand-sub">Аналитический отчёт</div>
      ${branchAddress ? `<div class="brand-sub" style="margin-top:4px">📍 ${branchAddress}</div>` : ''}
    </div>
    <div class="report-meta">
      <strong>Период: ${periodLabel}</strong>
      Сформирован: ${dateStr}<br/>
      ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <!-- KPI -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Выручка</div>
      <div class="kpi-value kpi-green">${kpi.totalRevenue.toLocaleString('ru-RU')} ₽</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Посетителей</div>
      <div class="kpi-value">${kpi.totalVisitors}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Средний чек</div>
      <div class="kpi-value kpi-blue">${kpi.avgCheck.toLocaleString('ru-RU')} ₽</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Загрузка комнат</div>
      <div class="kpi-value">${kpi.occupancyRate}%</div>
    </div>
  </div>

  <!-- Выручка по дням -->
  ${
    chartRows
      ? `
  <div class="section">
    <div class="section-title">Динамика по дням (только активные дни)</div>
    <table class="chart-table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Выручка (визуально)</th>
          <th style="text-align:right">Выручка</th>
          <th style="text-align:right">Посетители</th>
        </tr>
      </thead>
      <tbody>${chartRows}</tbody>
    </table>
  </div>`
      : ''
  }

  <!-- Выручка по комнатам -->
  ${
    roomRows
      ? `
  <div class="section">
    <div class="section-title">Выручка по комнатам</div>
    <table>
      <thead>
        <tr>
          <th>Комната</th>
          <th>Броней</th>
          <th>Выручка</th>
          <th>Средний чек</th>
        </tr>
      </thead>
      <tbody>${roomRows}</tbody>
    </table>
  </div>`
      : ''
  }

  <!-- По категориям -->
  ${
    categoryRows
      ? `
  <div class="section">
    <div class="section-title">По категориям комнат</div>
    <table>
      <thead>
        <tr>
          <th>Категория</th>
          <th>Броней</th>
          <th>Выручка</th>
        </tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>`
      : ''
  }

  <div class="footer">
    <span>Hideout Gaming Hub — Система управления клубом</span>
    <span>Отчёт сформирован автоматически · ${dateStr}</span>
  </div>
</body>
</html>`;

      // Открываем в новом окне и вызываем print (браузер предложит сохранить как PDF)
      const win = window.open('', '_blank', 'width=900,height=700');
      win.document.write(html);
      win.document.close();
      win.focus();
      // Небольшая задержка чтобы шрифты и стили успели загрузиться
      setTimeout(() => {
        win.print();
        // win.close(); // раскомментируй если хочешь автозакрытие после печати
      }, 400);
    },
    [],
  );

  return { exportPdf, reportRef };
};
