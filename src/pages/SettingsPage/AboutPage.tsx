import React from 'react';
import { Link } from 'react-router-dom';
import { LATEST_CHANGELOG } from '../../config/changelog';

export const AboutPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">About</h3>
      <p className="mt-1 text-sm text-gray-500">Information about the application.</p>
    </div>

    <div className="rounded-lg border border-gray-200 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900">Immersive Reader</h4>
            <p className="mt-1 text-sm text-gray-500">
              An offline-first EPUB reader with AI-powered context enhancements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              v{LATEST_CHANGELOG.version}
            </span>
            <span>Released {LATEST_CHANGELOG.releasedAt}</span>
          </div>
        </div>
        <Link
          to="/settings/changelog"
          className="inline-flex items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          View changelog
        </Link>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500">Built with React, TypeScript, and Tailwind CSS.</p>
      </div>
    </div>
  </div>
);

export default AboutPage;
