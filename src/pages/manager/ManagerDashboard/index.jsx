import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './Managerdashboard.module.scss';

const ManagerDashboard = () => {
  const location = useLocation();

  // Функция для подсветки активного пункта меню
  const isActive = (path) => {
    if (path === '/manager') {
      return location.pathname === '/manager' ? styles.active : '';
    }
    return location.pathname.startsWith(path) ? styles.active : '';
  };

  return (
    <div className={styles.managerLayout}>
      {/* Боковое меню */}
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Управление</h3>
        <nav>
          <ul className={styles.menuList}>
            <li>
              <Link to='/manager' className={`${styles.menuLink} ${isActive('/manager')}`}>
                Смена
              </Link>
            </li>
            <li>
              <Link
                to='/manager/currentBookings'
                className={`${styles.menuLink} ${isActive('/manager/currentBookings')}`}
              >
                Текущие бронирования
              </Link>
            </li>

            <li>
              <Link
                to='/manager/shifts'
                className={`${styles.menuLink} ${isActive('/manager/shifts')}`}
              >
                Покупка пакетов хайдов
              </Link>
            </li>
            <li>
              <Link
                to='/manager/transactions'
                className={`${styles.menuLink} ${isActive('/manager/transactions')}`}
              >
                Создание бронирования
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Основная область — здесь будут вложенные страницы */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerDashboard;
