//ДЛЯ ПРОВЕРКИ РОЛИ ВО ВРЕМЯ ПОПЫТКИ ЗАЙТИ НА ЗАЩИЩЕННУЮ СТРАНИЦУ
//
//
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = Cookies.get('token');
  if (!token) return <Navigate to='/auth' replace />;

  // Декодируем токен, чтобы получить роль
  let role = null;

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
    role = payload.role;
  } catch (e) {
    return <Navigate to='/auth' replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Если роль не разрешена, можно отправить на домашнюю или страницу "Доступ запрещён"
    return <Navigate to='/' replace />;
  }

  return children;
};

export default ProtectedRoute;
