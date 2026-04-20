import styles from './RoomBlock.module.scss';

import { Link } from 'react-router-dom';

import PlayStation from '../../../assets/svg/PlayStationSvg';
import Vr from '../../../assets/svg/VrSvg';
import Address from '../../../assets/svg/AddressSvg';
import People from '../../../assets/svg/PeopleSvg';
import roomSkelet from '../../../assets/images/roomSkelet.jpg';

const Room = ({ room }) => {
  console.log(room.category_name);
  return (
    <div className={styles.content}>
      <Link to={`/room/${room.room_id}`}>
        <div className={styles.imageblock}>
          <img src={room.image || roomSkelet} alt='room' />
        </div>
        <div className={styles.inforoom}>
          <div className={styles.info}>
            <h4>{room.name}</h4>
            <p>
              <People />
              {room.price} ₽/час
            </p>
            <p>{room.max_poeple}</p>
            <p>
              <Address />
              {room.address}
            </p>
          </div>
          <div className={styles.typeRoom}>
            {room.category_name == 'VR' ? <Vr /> : <PlayStation />}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Room;
