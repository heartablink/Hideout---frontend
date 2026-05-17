import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ManagerBoard.module.scss';

const SuccessPage = () => {
  return <p>Ваше бронирование успешно подтверждено.</p>;
};

export default SuccessPage;
