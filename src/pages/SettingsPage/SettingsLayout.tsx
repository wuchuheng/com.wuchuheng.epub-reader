import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Container } from '../../components/Container';

interface SettingsNavCallback {
  label: string;
  description?: string;
  path: string;
}

const navItems: SettingsNavCallback[] = [
  {
    label: 'General',
    path: '/settings/general',
    description: 'General application settings',
  },
  {
    label: 'Storage',
    path: '/settings/storage',
    description: 'Local cache overview and reset',
  },
  {
    label: 'Context Menu',
    path: '/settings/contextmenu',
    description: 'Configure AI providers and custom tools',
  },
  {
    label: 'Changelog',
    path: '/settings/changelog',
    description: 'Recent releases and change history',
  },
  {
    label: 'About',
    path: '/settings/about',
    description: 'App information and version',
  },
];

export const SettingsLayout: React.FC = () => {
  const location = useLocation();

  // Determine breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const base = [{ label: 'Home', path: '/' }, { label: 'Settings', path: '/settings' }];
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
            className="w-full border-b border-gray-200 bg-white md:w-56 md:min-h-[calc(100vh-12rem)] md:border-b-0 md:border-r"
            aria-label="Settings sections"
          >
            <div className="flex flex-col p-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
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
