import logo from './logo.svg';
import './App.css';
import Cookies from 'js-cookie';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';

import './scss/main.scss';

import Home from '../src/pages/Home';
import Auth from './pages/Auth/';
import React from 'react';
import Profile from './pages/Profile';
import Roomspg from './pages/Rooms';
import RoomPage from './pages/RoomPage';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import ShiftPage from './pages/manager/ShiftPage';
import CurrentBookgns from './pages/manager/CurrentBookings';

function App() {
  // Проверяем куки при загрузке: если токен есть, значит залогинены
  const [isAuth, setIsAuth] = React.useState(!!Cookies.get('token'));
  const [userRole, setUserRole] = React.useState();

  const location = useLocation(); // получаем текущий путь
  const isHome = location.pathname === '/';

  const onLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 7, path: '/' }); // Сохраняем на неделю
    console.log(Cookies.get('token'));

    // Декодируем токен и извлекаем роль
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); // JWT использует base64url, исправляем символы

      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        ),
      );

      // Проверяем, не истёк ли токен
      if (payload.exp * 1000 > Date.now()) {
        setUserRole(payload.role);
        setIsAuth(true);
      } else {
        // Токен просрочен – сбрасываем авторизацию
        Cookies.remove('token');
        localStorage.removeItem('token');
        setUserRole(null); // Меняем состояние, чтобы Header обновился
        setIsAuth(false);
      }
    } catch (e) {
      console.error('Не удалось декодировать токен', e);
      // Токен повреждён – тоже сброс
      Cookies.remove('token');
      localStorage.removeItem('token');
      setUserRole(null);
      setIsAuth(false);
    }
  };

  React.useEffect(() => {
    try {
      const token = Cookies.get('token');
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); // JWT использует base64url, исправляем символы

      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        ),
      );

      // Проверяем, не истёк ли токен
      if (payload.exp * 1000 > Date.now()) {
        setUserRole(payload.role);
        setIsAuth(true);
      } else {
        // Токен просрочен – сбрасываем авторизацию
        Cookies.remove('token');
        localStorage.removeItem('token');
        setUserRole(null); // Меняем состояние, чтобы Header обновился
        setIsAuth(false);
      }
    } catch (e) {
      console.error('Не удалось декодировать токен', e);
      // Токен повреждён – тоже сброс
      Cookies.remove('token');
      localStorage.removeItem('token');
      setUserRole(null);
      setIsAuth(false);
    }
  }, []);

  const logout = () => {
    Cookies.remove('token');
    setIsAuth(false);
  };

  return (
    <div className='app-wrapper'>
      <Header isAuth={isAuth} onLogout={logout} userRole={userRole} />
      <div className={`content ${!isHome ? 'content--with-padding' : ''}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth' element={<Auth onLoginSuccess={onLoginSuccess} />} />
          <Route
            path='/profile'
            element={isAuth ? <Profile onLogout={logout} /> : <Navigate to='/auth' />}
          />
          <Route path='/rooms' element={<Roomspg />} />
          <Route path='/room/:roomId' element={<RoomPage isAuth={isAuth} />} />
          {/* <Route 
  path='/auth' 
  element={isAuth ? <Navigate to="/" /> : <Auth onLoginSuccess={login} />} 
/> */}
          <Route path='/booking/success/:bookingId' element={<Roomspg />} />

          {/* Раздел управляющего только для manager */}
          {/* Панель управляющего – только manager */}
          <Route
            path='/manager/*'
            element={
              <ProtectedRoute allowedRoles={['Менеджер']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<ShiftPage />} />
            <Route path='currentBookings' element={<CurrentBookgns />} />
            {/*             <Route path='prices' element={<ManagerPrices />} /> */}
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
