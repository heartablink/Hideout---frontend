import logo from './logo.svg';
import './App.css';
import Cookies from 'js-cookie';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import './scss/main.scss';

import Home from '../src/pages/Home';
import Auth from './pages/Auth/';
import React from 'react';
import Profile from './pages/Profile';
import Roomspg from './pages/Rooms';
import RoomPage from './pages/RoomPage';

function App() {
  // Проверяем куки при загрузке: если токен есть, значит залогинены
  const [isAuth, setIsAuth] = React.useState(!!Cookies.get('token'));

  const location = useLocation(); // получаем текущий путь
  const isHome = location.pathname === '/';

  const onLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 7, path: '/' }); // Сохраняем на неделю
    console.log(Cookies.get('token'));
    setIsAuth(true); // Меняем состояние, чтобы Header обновился
  };

  const logout = () => {
    Cookies.remove('token');
    setIsAuth(false);
  };

  return (
    <div className='app-wrapper'>
      <Header isAuth={isAuth} onLogout={logout} />
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
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
