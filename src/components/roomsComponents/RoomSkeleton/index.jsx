import React from 'react';
import ContentLoader from 'react-content-loader';
import styles from './RoomSkeleton.module.scss'; // создайте файл стилей

const RoomSkeleton = (props) => (
  <div className={styles.skeleton}>
    <ContentLoader
      speed={0}
      width={400}
      height={420}
      viewBox='0 0 400 420'
      backgroundColor='#27262c'
      foregroundColor='#27262c'
      {...props}
    >
      <rect x='0' y='0' rx='20' ry='20' width='400' height='300' />
      <rect x='0' y='310' rx='20' ry='20' width='400' height='105' />
    </ContentLoader>
  </div>
);

export default RoomSkeleton;
