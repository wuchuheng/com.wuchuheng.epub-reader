import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/Container';

/**
 * Settings page component
 * Landing page for settings with navigation to specific settings pages
 */
export const SettingsPage: React.FC = () => (
  <Container breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Settings' }]} backTo="/">
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Settings Categories</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/settings/contextmenu"
            className="block rounded-lg border border-gray-200 p-6 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Context Menu</h3>
                <p className="text-sm text-gray-500">Configure AI providers and custom tools</p>
              </div>
            </div>
          </Link>

          <div className="block rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Reading Preferences</h3>
                <p className="text-sm text-gray-500">Font size, theme, and layout settings</p>
              </div>
            </div>
          </div>

          <div className="block rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Appearance</h3>
                <p className="text-sm text-gray-500">Colors, margins, and visual settings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-gray-900">Coming Soon</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Keyboard shortcuts</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Import/Export settings</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Cloud synchronization</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Advanced analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
);

// Default export for router
export default SettingsPage;
