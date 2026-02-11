import { createBrowserRouter, Navigate } from 'react-router-dom';
import BookshelfPage from '../pages/HomePage';
import { EpubReader } from '../pages/EpubReader';
import SettingsLayout from '../pages/SettingsPage/SettingsLayout';
import GeneralPage from '../pages/SettingsPage';
import FontSettingsPage from '../pages/SettingsPage/FontSettingsPage';
import AboutPage from '../pages/SettingsPage/AboutPage';
import StoragePage from '../pages/SettingsPage/StoragePage';
import ContextMenuSettingsPage from '../pages/ContextMenuSettingsPage';
import ToolExtractPage from '../pages/ToolExtractPage';
import ToolEditPage from '../pages/ToolEditPage';

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
    element: <SettingsLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="general" replace />,
      },
      {
        path: 'general',
        element: <GeneralPage />,
      },
      {
        path: 'typography',
        element: <FontSettingsPage />,
      },
      {
        path: 'storage',
        element: <StoragePage />,
      },
      {
        path: 'contextmenu',
        element: <ContextMenuSettingsPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '/settings/contextmenu/:id/edit',
    element: <ToolEditPage />,
  },
  {
    path: '/settings/contextmenu/add-tool',
    element: <ToolExtractPage />,
  },
]);

export default router;
