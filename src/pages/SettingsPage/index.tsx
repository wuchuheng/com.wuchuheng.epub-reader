import React from 'react';

export const GeneralPage: React.FC = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure general application preferences.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
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
            <span>Theme Customization</span>
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
            <span>Language Selection</span>
          </div>
        </div>
      </div>
    </div>
);

export default GeneralPage;