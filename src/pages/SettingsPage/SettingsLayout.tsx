import React, { useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../../components/Container';

export const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation('settings');

  const navItems = useMemo(
    () => [
      {
        label: t('nav.general'),
        path: '/settings/general',
        description: t('navDescriptions.general'),
      },
      {
        label: t('nav.storage'),
        path: '/settings/storage',
        description: t('navDescriptions.storage'),
      },
      {
        label: t('nav.contextMenu'),
        path: '/settings/contextmenu',
        description: t('navDescriptions.contextMenu'),
      },
      {
        label: t('nav.about'),
        path: '/settings/about',
        description: t('navDescriptions.about'),
      },
    ],
    [t]
  );

  // Determine breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const base = [
      { label: t('breadcrumbs.home'), path: '/' },
      { label: t('breadcrumbs.settings'), path: '/settings' },
    ];
    const current = navItems.find((item) => item.path === location.pathname);
    if (current) {
      base.push({ label: current.label, path: current.path });
    }
    return base;
  };

  return (
    <Container breadcrumbItems={getBreadcrumbs()} backTo="/">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow md:flex-row">
          {/* Left Navigation Rail */}
          <nav
            className="w-full border-b border-gray-200 bg-white md:min-h-[calc(100vh-12rem)] md:w-56 md:border-b-0 md:border-r"
            aria-label={t('breadcrumbs.settings')}
          >
            <div className="flex flex-col space-y-1 p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border border-blue-100 bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Right Content Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SettingsLayout;
