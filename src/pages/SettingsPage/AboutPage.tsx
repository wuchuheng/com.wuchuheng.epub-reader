import React from 'react';
// Assuming version can be retrieved from package.json or environment variable
// For now hardcoding or using a placeholder as per instruction "derive from package.json version or a constant"
const APP_VERSION = '0.0.9';

export const AboutPage: React.FC = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">About</h3>
        <p className="mt-1 text-sm text-gray-500">
          Information about the application.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-900">Immersive Reader</h4>
            <p className="mt-1 text-sm text-gray-500">
              An offline-first EPUB reader with AI-powered context enhancements.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            v{APP_VERSION}
          </span>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
           <p className="text-sm text-gray-500">
             Built with React, TypeScript, and Tailwind CSS.
           </p>
        </div>
      </div>
    </div>
);

export default AboutPage;
