import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

import style from './Profile.module.scss';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Вызываем функцию из App.js
    navigate('/'); // Опционально: редирект на главную после выхода
  };

  return (
    <div className={style.wrapper}>
      <Button onClick={handleLogoutClick}>Выйти</Button>
    </div>
  );
};

export default Profile;
