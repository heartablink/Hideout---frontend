import React from 'react';
import logo from '../../assets/images/logo.svg';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import { initAsyncCompiler } from 'sass';
import Button from '../Button';

const Header = ({ isAuth }) => {
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
            <a>Игры</a>
          </li>
          <li>
            <a>Адреса</a>
          </li>
          <li></li>
        </ul>
      </div>
      {isAuth ? (
        <a>
          <Link to='/profile'>Профиль</Link>
        </a>
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
