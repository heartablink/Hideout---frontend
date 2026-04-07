import React from 'react';
import styles from '../GameBlock/GameBlock.module.scss';

const GameBlock = ({ name, img }) => {
  return (
    <div className={styles.wrapper}>
      <img src={img} alt={name} />
      <p className={styles.gameInfo}>{name}</p>
    </div>
  );
};

export default GameBlock;
