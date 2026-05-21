import React from 'react';
import styles from '../GameBlock/GameBlock.module.scss';

const GameBlock = ({ game }) => {
  return (
    <div className={styles.wrapper}>
      <img src={game.image_url} alt={game.title} />
      <p className={styles.gameInfo}>{game.title}</p>
    </div>
  );
};

export default GameBlock;
