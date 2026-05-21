import React from 'react';
import logo from '../../assets/images/logo.svg';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import { initAsyncCompiler } from 'sass';
import Button from '../Button';

const Header = ({ isAuth, userRole }) => {
  return (
    <div className={styles.root}>
      <Link to='/'>
        <div className={styles.logoBox}>
          <img className={styles.logo} src={logo} />
          <h1>Hideout</h1>
        </div>
      </Link>
      <div>
        <ul>
          <li>
            <Link to='/rooms'>Комнаты</Link>
          </li>
          <li>
            <a>Программа лояльности</a>
          </li>
          <li>
            <Link to='/games'>Игры</Link>
          </li>
          <li>
            <a>Адреса</a>
          </li>
          {userRole === 'Администратор' && <Link to='/admin'>Управление</Link>}
          {userRole === 'Управляющий' && <Link to='/manager'>Анализ</Link>}
          <li></li>
        </ul>
      </div>
      {isAuth ? (
        <div className={styles.profbox}>
          <a>
            <Link to='/profile'>Профиль</Link>
          </a>
        </div>
      ) : (
        <div className={styles.authBox}>
          <Link to='/Auth'>
            <ul>
              <li>Войти</li>
              <li>/</li>
              <li>Зарегистрироваться</li>
            </ul>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;
