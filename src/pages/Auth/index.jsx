import React from 'react';
import root from '../Auth/Auth.module.scss';
import Button from '../../components/Button';
import { PatternFormat } from 'react-number-format';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EyePass from '../../assets/svg/EyePass';
import NoEyePass from '../../assets/svg/NoEyePass';

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
          {formType === 'login' ? (
            <LoginForm onLoginSuccess={onLoginSuccess} />
          ) : (
            <RegisterForm onLoginSuccess={onLoginSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onLoginSuccess }) => {
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const [isVisible, setIsVisible] = React.useState(false);

  const navigate = useNavigate(); //Инициализируем навигацию

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
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
      <div className={root.passBlock}>
        <input
          className={root.passBox}
          type={isVisible ? 'text' : 'password'}
          value={password} // Привязываем значение
          onChange={(e) => setPassword(e.target.value)} // Обновляем стейт
          className={root.input}
          required
        />
        <button
          type='button'
          onClick={toggleVisibility}
          style={{
            position: 'absolute',
            right: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isVisible ? <NoEyePass /> : <EyePass />}
        </button>
      </div>
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

  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
      console.error(err); // для отладки
      let errorMessage = 'Ошибка регистрации. Попробуйте позже.';

      if (err.response && err.response.data) {
        const data = err.response.data;

        // 1. Если пришёл массив ошибок (как у вас на скриншоте)
        if (Array.isArray(data) && data.length > 0 && data[0].msg) {
          errorMessage = data[0].msg;
        }
        // 2. Если пришёл объект с полем msg
        else if (data.msg) {
          errorMessage = data.msg;
        }
        // 3. Если пришёл объект с полем message
        else if (data.message) {
          errorMessage = data.message;
        }
        // 4. Если пришла просто строка
        else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
      <div className={root.passBlock}>
        <input
          className={root.passBox}
          type={isVisible ? 'text' : 'password'}
          value={password} // Привязываем значение
          onChange={(e) => setPassword(e.target.value)} // Обновляем стейт
          className={root.input}
          required
        />
        <button
          type='button'
          onClick={toggleVisibility}
          style={{
            position: 'absolute',
            right: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isVisible ? <NoEyePass /> : <EyePass />}
        </button>
      </div>
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
