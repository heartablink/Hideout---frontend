import styles from './Rooms.module.scss';
import axios from 'axios';
import React from 'react';

import RoomBlock from '../../components/roomsComponents/RoomBlock';
import RoomSkeleton from '../../components/roomsComponents/RoomSkeleton';
import Filters from '../../components/roomsComponents/RoomFilters';
import Sort from '../../components/roomsComponents/RoomSort';

const Rooms = () => {
  const [isLoading, setLoading] = React.useState(true);
  const [roomList, setRoomList] = React.useState([]);

  const [categories, setCategories] = React.useState([]);
  const [branches, setBranches] = React.useState([]);

  //константа фильтров
  const INITIAL_FILTERS = {
    category: 0,
    maxPeople: '',
    branch: '',
    sortBy: '',
  };

  const [filters, setFilters] = React.useState(INITIAL_FILTERS);

  // Загрузка списков для фильтров (категории и филиалы) при монтировании
  React.useEffect(() => {
    //инициализация
    const fetchFilterOptions = async () => {
      try {
        const [catRes, branchRes] = await Promise.all([
          axios.get('http://localhost:4444/api/categories'),
          axios.get('http://localhost:4444/api/branches'),
        ]);
        setCategories(catRes.data);
        setBranches(branchRes.data);
      } catch (err) {
        console.error('Ошибка загрузки опций фильтров', err);
      }
    };
    //вызов
    fetchFilterOptions();
  }, []);

  // Запрос комнат с текущими фильтрами
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4444/api/rooms', {
        params: {
          category: filters.category === 0 ? '' : filters.category,
          maxPeople: filters.maxPeople,
          branch: filters.branch,
          sortBy: filters.sortBy,
        },
      });
      setRoomList(response.data);
    } catch (err) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // Запрашиваем комнаты при изменении любого фильтра
  React.useEffect(() => {
    fetchRooms();
  }, [filters.category, filters.maxPeople, filters.branch, filters.sortBy]);

  // Обновление конкретного фильтра
  //Использование колбэка (prev) => ... гарантирует, что мы работаем с самым актуальным предыдущим состоянием,хорошая практика для предотвращения багов.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Формирование опций для фильтров
  const categoryOptions = [
    { value: 0, label: 'Все' },
    ...categories.map((cat) => ({ value: cat.category_id, label: cat.name })),
  ];
  const branchOptions = [
    { value: '', label: 'Все филиалы' },
    ...branches.map((b) => ({ value: b.branch_id, label: b.address })),
  ];
  const maxPeopleOptions = [
    { value: '', label: 'Любое' },
    { value: 2, label: 'до 2' },
    { value: 4, label: 'до 4' },
    { value: 6, label: 'до 6' },
  ];
  const sortOptions = [
    { value: '', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Сначала дешёвые' },
    { value: 'price_desc', label: 'Сначала дорогие' },
  ];

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const rooms = roomList.map((room, index) => <RoomBlock key={index} room={room} />);
  const skeleton = [...new Array(6)].map((_, index) => <RoomSkeleton key={index} />);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <h1>Комнаты</h1>
        <button className={styles.resetButton} onClick={resetFilters}>
          × Сбросить фильтры
        </button>
      </div>
      <div className={styles.filters}>
        <Filters
          label='Категория'
          options={categoryOptions}
          value={filters.category}
          onChange={(val) => updateFilter('category', val)}
        />
        <Filters
          label='Количество человек'
          options={maxPeopleOptions}
          value={filters.maxPeople}
          onChange={(val) => updateFilter('maxPeople', val)}
        />
        <div className={styles.sort}>
          <Sort
            label='Филиалы'
            options={branchOptions}
            value={filters.branch}
            onChange={(val) => updateFilter('branch', val)}
          />
          <Sort
            label='Сортировка по'
            options={sortOptions}
            value={filters.sortBy}
            onChange={(val) => updateFilter('sortBy', val)}
          />
        </div>
      </div>
      <span>Всего найдено комнат: {rooms.length}</span>
      <div className={styles.rooms}>{isLoading ? skeleton : rooms}</div>
    </div>
  );
};
export default Rooms;
