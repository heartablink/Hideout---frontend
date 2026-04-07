import React from 'react';
import styles from '../MoreGamesBlock/MoreGameBlock.module.scss';

const GameBlock = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.gameInfo}>
        Перейти к списку игр
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
      </p>
    </div>
  );
};

export default GameBlock;
