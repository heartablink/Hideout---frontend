import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import logo from '../../assets/images/logo.svg';

// Если есть иконки соцсетей, импортируй их. Если нет — можно текстом.
import Address from '../../assets/svg/AddressSvg';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Блок 1: Лого и Слоган */}
          <div className={styles.brand}>
            <Link to='/' className={styles.logoLink}>
              <img src={logo} alt='Hideout Logo' className={styles.logo} />
              <span className={styles.brandName}>Hideout</span>
            </Link>
            <p className={styles.slogan}>
              Твое идеальное пространство для погружения в другие реальности. Лучшие игровые зоны в
              городе.
            </p>
          </div>

          {/* Блок 2: Навигация */}
          <div className={styles.links}>
            <h4>Навигация</h4>
            <ul>
              <li>
                <Link to='/rooms'>Все комнаты</Link>
              </li>
              <li>
                <Link to='/games'>Каталог игр</Link>
              </li>
              <li>
                <Link to='/loyalty'>Программа лояльности</Link>
              </li>
              <li>
                <Link to='/about'>О нас</Link>
              </li>
            </ul>
          </div>

          {/* Блок 3: Контакты */}
          <div className={styles.contacts}>
            <h4>Контакты</h4>
            <ul>
              <li>
                <Address />
                <span>г. Москва, ул. Примерная, 12</span>
              </li>
              <li>
                <a href='tel:+79990000000'>+7 (999) 000-00-00</a>
              </li>
              <li>
                <a href='mailto:info@hideout.ru'>info@hideout.ru</a>
              </li>
            </ul>
          </div>

          {/* Блок 4: Соцсети */}
          <div className={styles.socials}>
            <h4>Мы в сети</h4>
            <div className={styles.socialIcons}>
              <a href='#' target='_blank' rel='noreferrer'>
                VK
              </a>
              <a href='#' target='_blank' rel='noreferrer'>
                Telegram
              </a>
              <a href='#' target='_blank' rel='noreferrer'>
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Hideout Gaming Hub. Все права защищены.</p>
          <div className={styles.legal}>
            <a href='#'>Политика конфиденциальности</a>
            <a href='#'>Публичная оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
