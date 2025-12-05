import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  statusSlot?: React.ReactNode;
  children: React.ReactNode;
  tint?: 'slate' | 'sky' | 'gray';
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Lightweight card wrapper to keep visual grouping consistent between sections.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  statusSlot,
  children,
  tint = 'slate',
  footer,
  className = '',
}) => {
  const background =
    tint === 'sky' ? 'bg-sky-50' : tint === 'gray' ? 'bg-gray-50' : 'bg-slate-50';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          {description && <p className="mt-0.5 text-sm text-gray-600">{description}</p>}
        </div>
        {statusSlot ? <div className="shrink-0">{statusSlot}</div> : null}
      </div>

      <div className={`flex-1 space-y-4 px-5 py-4 ${background}`}>{children}</div>

      {footer ? <div className="border-t border-gray-100 bg-white px-5 py-4">{footer}</div> : null}
    </div>
  );
};

export default SectionCard;
