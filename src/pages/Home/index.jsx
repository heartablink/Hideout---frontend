import styles from '../Home/Home.module.scss';
import Button from '../../components/Button';
import joystick from '../../assets/images/joystick.svg';
import cup from '../../assets/images/cup.svg';
import map from '../../assets/images/map.svg';
import games from '../../assets/images/games.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';

import bigJoystick from '../../assets/images/bigJoystick.svg';

import Silent from '../../assets/images/silentHill.png';

import GameBlock from '../../components/GameBlock';
import MoreGamesBlock from '../../components/MoreGamesBlock';
import React from 'react';

const Home = () => {
  const [gamesList, setGames] = useState([]);

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:4444/api/games', {
        params: {
          limit: 9,
        },
      });
      setGames(response.data);
    } catch (err) {
      console.log('Не удалось получить комнаты');
    }
  };

  //Вызываем функцию при первом рендере
  useEffect(() => {
    fetchGames();
  }, []); // Пустой массив означает "выполни один раз при загрузке"

  return (
    <div className={styles.wrapper}>
      <div className={styles.homeWrapper}>
        <div className={styles.welcomeBlock}>
          <div className={styles.content}>
            <div>
              <div>
                <h1>Hideout</h1>
                <h2>найди свое убежище</h2>
              </div>
              <p>
                Докажи, что ты достоин высшего звания в главном клубе Краснодара. Пройди весь путь
                от “Новобранца” до “Легенды” и попади на рейтенговую доску лучших членов клуба.
              </p>
              <div className={styles.actions}>
                <Link to='/rooms'>
                  <Button className='frstbttn'>
                    Выбрать убежище
                    <svg
                      width='38'
                      height='16'
                      viewBox='0 0 38 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M29.55 0.75L36.75 7.75L29.55 0.75ZM36.75 7.75L29.55 14.75L36.75 7.75ZM36.75 7.75L0.75 7.75L36.75 7.75Z'
                        fill='black'
                      />
                      <path
                        d='M29.55 0.75L36.75 7.75M36.75 7.75L29.55 14.75M36.75 7.75L0.750001 7.75'
                        stroke='black'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                  </Button>
                </Link>
                <Button variant='simple'>Об уровнях</Button>
              </div>
            </div>
            <div>
              <img src={bigJoystick} />
            </div>
          </div>
        </div>

        <div className={styles.pluses}>
          {[
            { img: joystick, text: 'Топовое оборудование' },
            { img: map, text: 'Комнаты по всему Краснодару' },
            { img: cup, text: 'Система лояльности' },
            { img: games, text: 'Новые игры постоянно' },
          ].map((item, i) => (
            <div key={i}>
              <img src={item.img} alt='icon' />
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.gamesBlock}>
          <h1>У нас более 300 игр на Play Station и для VR</h1>
          <div className={styles.gamesGrid}>
            {gamesList.length > 0
              ? gamesList.map((game, index) => (
                  <GameBlock
                    key={index} // 👈 ВАЖНО: добавляем key!
                    name={game.title}
                    img={game.image_url}
                  />
                ))
              : ''}
            <MoreGamesBlock />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
