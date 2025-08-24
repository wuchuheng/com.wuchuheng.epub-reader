import { createBrowserRouter } from 'react-router-dom';
import BookshelfPage from '../pages/BookshelfPage';
import { EpubReader } from '../pages/EpubReader';
import SettingsPage from '../pages/SettingsPage';
import ContextMenuSettingsPage from '../pages/ContextMenuSettingsPage';
import ToolExtractPage from '../pages/ToolExtractPage';

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
  {
    path: '/settings/contextmenu',
    element: <ContextMenuSettingsPage />,
  },
  {
    path: '/settings/contextmenu/add-tool',
    element: <ToolExtractPage />,
  },
]);

export default router;
