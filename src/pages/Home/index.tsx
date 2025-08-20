import reactLogo from '../../assets/react.svg';
import viteLogo from '/vite.svg';
import styles from './index.module.less';
import { useSetCountThunk } from '../../store/slices/counterSlice';
import { useAppSelector } from '../../store';
import { cn } from '../../utils/cssUtil';

function App() {
  const setCount = useSetCountThunk();

  const count = useAppSelector((state) => state.counter.value);

  return (
    <div className={styles.main}>
      <div className="flex space-x-4 items-center justify-center">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className={cn(styles.logo, styles.react)} alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl">Vite + React</h1>
      <div className={styles.card}>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          count is {count}
        </button>

        <h2 className="text-2xl mt-10 text-left my-4">Technologies Used</h2>
        <ul className="list-disc list-inside mt-4 text-left">
          <li>Redux and Redux-Thunk</li>
          <li>React Router</li>
          <li>Module CSS and LESS</li>
        </ul>

        <p className="my-3">
          Edit <code>src/pages/Home/index.tsx</code> and save to test HMR
        </p>
        <p className={cn(styles['read-the-docs'], 'text-left')}>
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );
}

export default App;
