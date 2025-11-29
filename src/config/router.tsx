import { createBrowserRouter, Navigate } from 'react-router-dom';
import BookshelfPage from '../pages/HomePage';
import { EpubReader } from '../pages/EpubReader';
import SettingsLayout from '../pages/SettingsPage/SettingsLayout';
import GeneralPage from '../pages/SettingsPage';
import AboutPage from '../pages/SettingsPage/AboutPage';
import StoragePage from '../pages/SettingsPage/StoragePage';
import ChangelogPage from '../pages/SettingsPage/ChangelogPage';
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
        path: 'storage',
        element: <StoragePage />,
      },
      {
        path: 'contextmenu',
        element: <ContextMenuSettingsPage />,
      },
      {
        path: 'changelog',
        element: <ChangelogPage />,
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
