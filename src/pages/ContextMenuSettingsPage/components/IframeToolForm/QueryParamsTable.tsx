import React from 'react';
import { useTranslation } from 'react-i18next';
import { QueryParamRow } from './types';

interface QueryParamsTableProps {
  rows: QueryParamRow[];
  onRowChange: (index: number, field: 'name' | 'value', value: string) => void;
}

export const QueryParamsTable: React.FC<QueryParamsTableProps> = ({ rows, onRowChange }) => {
  const { t } = useTranslation('settings');

  return (
    <div className="mt-4 rounded-lg border border-gray-100">
      <div
        className="flex flex-col gap-1 border-b border-gray-100 px-3 py-2 sm:flex-row sm:items-center
        sm:justify-between"
      >
        <p className="text-sm font-medium text-gray-700">
          {t('contextMenu.iframeForm.queryParamsTitle')}
        </p>
        <p className="text-xs text-gray-500">{t('contextMenu.iframeForm.queryParamsHint')}</p>
      </div>

      <div className="divide-y divide-gray-100">
        <div
          className="grid grid-cols-2 gap-3 bg-gray-50 px-3 py-2 text-xs font-medium uppercase
          tracking-wide text-gray-500"
        >
          <span>{t('contextMenu.iframeForm.queryParamName')}</span>
          <span>{t('contextMenu.iframeForm.queryParamValue')}</span>
        </div>
        {rows.map((param, index) => (
          <div
            key={`query-param-${index}`}
            className="grid grid-cols-2 gap-3 px-3 py-2"
          >
            <input
              type="text"
              value={param.name}
              onChange={(e) => onRowChange(index, 'name', e.target.value)}
              placeholder={t('contextMenu.iframeForm.queryParamNamePlaceholder')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500
              focus:outline-none focus:ring-blue-500"
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => onRowChange(index, 'value', e.target.value)}
              placeholder={t('contextMenu.iframeForm.queryParamValuePlaceholder')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500
              focus:outline-none focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
