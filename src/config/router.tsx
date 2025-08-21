import { createBrowserRouter } from 'react-router-dom';
import BookshelfPage from '../pages/BookshelfPage';
import EpubReader from '../pages/EpubReader';
import SettingsPage from '../pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BookshelfPage />,
  },
  {
    path: '/reader/:bookId',
    element: <EpubReader />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
]);

export default router;
