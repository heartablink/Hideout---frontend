import styles from './RoomFilters.module.scss';

const Filters = ({ label, options, value, onChange }) => {
  return (
    <div className={styles.filterblock}>
      <span className={styles.filterLabel}>{label}</span>
      <ul>
        {options.map((option) => (
          <li
            key={option.value}
            className={value == option.value ? styles.active : ''}
            onClick={() => {
              console.log('value:', value, typeof value);
              console.log('option.value:', option.value, typeof option.value);
              onChange(option.value);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Filters;
