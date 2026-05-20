import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './AdminDashboard.module.scss';

const ManagerDashboard = () => {
  const location = useLocation();

  // Функция для подсветки активного пункта меню
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' ? styles.active : '';
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
              <Link to='/admin' className={`${styles.menuLink} ${isActive('/admin')}`}>
                Смена
              </Link>
            </li>
            <li>
              <Link
                to='/admin/currentBookings'
                className={`${styles.menuLink} ${isActive('/admin/currentBookings')}`}
              >
                Текущие бронирования
              </Link>
            </li>

            <li>
              <Link
                to='/admin/packageSale'
                className={`${styles.menuLink} ${isActive('/admin/packageSale')}`}
              >
                Продажа пакетов хайдов
              </Link>
            </li>
            <li>
              <Link
                to='/admin/transactions'
                className={`${styles.menuLink} ${isActive('/admin/transactions')}`}
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
