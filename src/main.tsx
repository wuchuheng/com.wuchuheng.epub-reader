import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import { registerSW } from 'virtual:pwa-register';
import { MessageProvider } from './components/Message';
import './index.css';
import './i18n/config';
import App from './App';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification to user
    if (confirm('New version available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <MessageProvider>
      <App />
    </MessageProvider>
  </Provider>
);
