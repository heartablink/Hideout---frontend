import styles from './GamesPage.module.scss';
import axios from 'axios';
import React from 'react';

import GameBlock from '../../components/GameBlock';
import RoomSkeleton from '../../components/roomsComponents/RoomSkeleton';
import Filters from '../../components/roomsComponents/RoomFilters';
import Sort from '../../components/roomsComponents/RoomSort';

const Games = () => {
  const [isLoading, setLoading] = React.useState(true);
  const [gamesList, setGames] = React.useState([]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4444/api/games');
      setGames(response.data);
    } catch (err) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // Запрашиваем комнаты при изменении любого фильтра
  React.useEffect(() => {
    fetchGames();
  }, []);

  const games = gamesList.map((game, index) => <GameBlock key={index} game={game} />);
  const skeleton = [...new Array(6)].map((_, index) => <RoomSkeleton key={index} />);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <h1>Игры</h1>
      </div>
      <span>Всего игр: {games.length}</span>
      <div className={styles.games}>{isLoading ? skeleton : games}</div>
    </div>
  );
};
export default Games;
