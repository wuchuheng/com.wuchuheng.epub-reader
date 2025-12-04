import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import store from './store';
import { RouterProvider } from 'react-router-dom';
import router from './config/router';
import { registerSW } from 'virtual:pwa-register';

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
    <RouterProvider router={router} />
  </Provider>
);
