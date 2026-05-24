import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './ManagerDashboard.module.scss';

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
                Аналитика
              </Link>
            </li>
            <li>
              <Link
                to='/manager/shift'
                className={`${styles.menuLink} ${isActive('/manager/shift')}`}
              >
                Смена
              </Link>
            </li>

            <li>
              <Link
                to='/manager/rooms-managment'
                className={`${styles.menuLink} ${isActive('/manager/rooms-managment')}`}
              >
                Управление комнатами
              </Link>
            </li>
            <li>
              <Link
                to='/manager/bookings'
                className={`${styles.menuLink} ${isActive('/manager/bookings')}`}
              >
                Все бронирования
              </Link>
              <Link
                to='/manager/adminlogs'
                className={`${styles.menuLink} ${isActive('/manager/adminlogs')}`}
              >
                Логи администраторов
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
