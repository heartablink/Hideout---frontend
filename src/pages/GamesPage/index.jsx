import styles from './GamesPage.module.scss';
import axios from 'axios';
import React from 'react';

import GameBlock from '../../components/GameBlock';
import RoomSkeleton from '../../components/roomsComponents/RoomSkeleton';
import Filters from '../../components/roomsComponents/RoomFilters';
import Sort from '../../components/roomsComponents/RoomSort';
import GameModal from '../../modals/GameModal';

const Games = () => {
  const [isLoading, setLoading] = React.useState(true);
  const [gamesList, setGames] = React.useState([]);
  const [selectedGame, setSelectedGame] = React.useState([]);
  const [isModalOpen, setOpen] = React.useState(false);

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

  const OnClick = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const OnClose = () => {
    setSelectedGame(null);
    setOpen(false);
  };

  const games = gamesList.map((game, index) => (
    <GameBlock key={index} game={game} onGameClick={() => OnClick(game)} />
  ));
  const skeleton = [...new Array(6)].map((_, index) => <RoomSkeleton key={index} />);

  return (
    <>
      {isModalOpen && <GameModal game={selectedGame} onClose={() => OnClose()} />}
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <h1>Игры</h1>
        </div>
        <span>Всего игр: {games.length}</span>
        <div className={styles.games}>{isLoading ? skeleton : games}</div>
      </div>
    </>
  );
};
export default Games;
