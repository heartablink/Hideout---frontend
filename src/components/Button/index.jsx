import styles from './Button.module.scss';
import clsx from 'classnames'; // Рекомендую библиотеку clsx или classnames

const Button = ({ children, variant, onClick }) => {
  return (
    <button
      className={clsx(styles.btn, {
        [styles.simple]: variant === 'simple',
        [styles.titlebtn]: variant === 'titlebtn',
        [styles.titlebtn_active]: variant === 'titlebtn_active',
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
export default Button;
