import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string; // Optional for navigation
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component
 * Shows the current location in the settings hierarchy
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav className="flex items-center space-x-2 text-sm">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="text-gray-400">/</span>}
        {item.path ? (
          <Link to={item.path} className="text-blue-600 transition-colors hover:text-blue-800">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-900">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// Default export
export default Breadcrumb;
