import React from 'react';
import root from '../Auth/Auth.module.scss';
import Button from '../../components/Button';
import { PatternFormat } from 'react-number-format';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ onLoginSuccess }) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [formType, setFormType] = React.useState('login');
  return (
    <div className={root.wrapper}>
      <div className={root.form}>
        <div className={root.tabs}>
          <Button
            variant={formType === 'login' ? 'titlebtn_active' : 'titlebtn'}
            onClick={() => setFormType('login')}
          >
            Войти
          </Button>
          <Button
            variant={formType === 'register' ? 'titlebtn_active' : 'titlebtn'}
            onClick={() => setFormType('register')}
          >
            Зарегистрироваться
          </Button>
        </div>
        <div className={root.formContent}>
          {formType === 'login' ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onLoginSuccess }) => {
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const navigate = useNavigate(); //Инициализируем навигацию

  //обрабатывать отправку
  const handleSubmit = async (e) => {
    //отменяет действия браузера по умолчанию
    e.preventDefault();
    const fullPhone = '7' + phone;
    setError(''); // Сбрасываем старую ошибку

    try {
      const response = await axios.post('http://localhost:4444/api/auth/login', {
        phone: fullPhone, // Отправляем чистые цифры
        password: password,
      });

      const { token } = response.data;
      if (token) {
        onLoginSuccess(token);
        navigate('/'); // Теперь это сработает, так как форма не перезагрузится
      }
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  return (
    <form className={root.content} onSubmit={handleSubmit}>
      <p>Телефон</p>
      <PatternFormat
        name='phone'
        format='+7 (###) ###-##-##'
        allowEmptyFormatting
        mask='_'
        type='tel' // Обязательно для вызова экранной клавиатуры и автозаполнения
        autoComplete='tel' // Подсказка браузеру, что это поле для телефона
        className={root.input}
        onValueChange={(values) => {
          setPhone(values.value);
        }}
      />
      <p>Пароль</p>
      <input
        type='password'
        value={password} // Привязываем значение
        onChange={(e) => setPassword(e.target.value)} // Обновляем стейт
        className={root.input}
        required
      />
      <Button type='submit'>Войти в аккаунт</Button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </form>
  );
};

const RegisterForm = ({ onLoginSuccess }) => {
  const navigate = useNavigate(); //Инициализируем навигацию

  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [error, setError] = React.useState('');

  const OnHandleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fullPhone = '7' + phone;

    try {
      const response = await axios.post('http://localhost:4444/api/auth/register', {
        phone: fullPhone,
        password: password,
        name: name,
        surname: surname,
      });

      const { token } = response.data;
      if (token) {
        onLoginSuccess(token);
        navigate('/');
      }
    } catch (err) {
      // Выводим текст ошибки с бэкенда (например, "Неверный пароль")
      setError(err.response?.data?.message);
    }
  };
  return (
    <form className={root.content} onSubmit={OnHandleSubmit}>
      <p>Телефон</p>
      <PatternFormat
        name='phone'
        format='+7 (###) ###-##-##'
        allowEmptyFormatting
        mask='_'
        type='tel' // Обязательно для вызова экранной клавиатуры и автозаполнения
        autoComplete='tel' // Подсказка браузеру, что это поле для телефона
        className={root.input}
        onValueChange={(values) => {
          setPhone(values.value);
        }}
      />
      <p>Пароль</p>
      <input
        type='password'
        value={password} // Привязываем значение
        onChange={(e) => setPassword(e.target.value)} // Обновляем стейт
        className={root.input}
        required
      />
      <p>Имя</p>
      <input
        value={name} // Привязываем значение
        onChange={(e) => setName(e.target.value)} // Обновляем стейт
        className={root.input}
        required
      />
      <p>Фамилия</p>
      <input
        value={surname} // Привязываем значение
        onChange={(e) => setSurname(e.target.value)} // Обновляем стейт
        className={root.input}
        required
      />
      <Button type='submit'>Зарегистрироваться</Button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </form>
  );
};

export default Auth;
