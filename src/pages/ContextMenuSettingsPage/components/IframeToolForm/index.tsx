import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryParamsTable } from './QueryParamsTable';
import { buildUrl, parseUrl } from './urlUtils';
import { QueryParamRow } from './types';

/**
 * Props for iframe tool form component.
 */
interface IframeToolFormProps {
  /** Current URL value. */
  url: string;
  /** Whether single-word selections are supported. */
  supportsSingleWord: boolean;
  /** Whether multi-word selections are supported. */
  supportsMultiWord: boolean;
  /** Whether support controls are disabled. */
  supportsDisabled: boolean;
  /** Handler for URL changes. */
  onUrlChange: (url: string) => void;
  /** Handler for support toggles. */
  onSupportChange: (target: 'single' | 'multi', enabled: boolean) => void;
}

/**
 * Form component specific to iframe tool configuration.
 * Encapsulates all iframe-related form fields and logic.
 */
export const IframeToolForm: React.FC<IframeToolFormProps> = ({
  url,
  supportsSingleWord,
  supportsMultiWord,
  supportsDisabled,
  onUrlChange,
  onSupportChange,
}) => {
  const { t } = useTranslation('settings');
  const parsedUrl = useMemo(() => parseUrl(url), [url]);
  const queryRows = useMemo<QueryParamRow[]>(
    () => [...parsedUrl.params, { name: '', value: '' }],
    [parsedUrl.params]
  );

  const handleQueryChange = useCallback(
    (index: number, field: 'name' | 'value', value: string) => {
      const current = parseUrl(url);
      const params = [...current.params];
      const target = params[index] ?? { name: '', value: '' };
      const updated = { ...target, [field]: value };

      params[index] = updated;

      const cleanedParams = params
        .filter((param) => param.name.trim() !== '')
        .map((param) => ({
          ...param,
          name: param.name.trim(),
        }));

      const nextUrl = buildUrl({
        base: current.base,
        hash: current.hash,
        params: cleanedParams,
      });

      onUrlChange(nextUrl);
    },
    [onUrlChange, url]
  );

  return (
    <>
      {/* URL */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('contextMenu.iframeForm.url')}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={t('contextMenu.iframeForm.urlPlaceholder', {
            words: '{{words}}',
            context: '{{context}}',
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500
          focus:outline-none focus:ring-blue-500"
        />

        <div className="mt-2 text-sm">
          <div className="mb-1 font-medium text-gray-700">
            {t('contextMenu.iframeForm.tipsTitle')}
          </div>
          <ul className="list-inside list-disc space-y-1 text-xs text-gray-500">
            <li>
              <span className="font-medium">{'{{words}}'}</span>:{' '}
              {t('contextMenu.iframeForm.tipsWords', { words: '{{words}}' })}
            </li>
            <li>
              <span className="font-medium">{'{{context}}'}</span>:{' '}
              {t('contextMenu.iframeForm.tipsContext', { context: '{{context}}' })}
            </li>
          </ul>
        </div>

        <QueryParamsTable rows={queryRows} onRowChange={handleQueryChange} />
      </div>

      {/* Selection support */}
      <div className="mt-4 border-t border-gray-100 pt-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('contextMenu.iframeForm.selectionSupport')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={supportsSingleWord}
              disabled={supportsDisabled}
              onChange={(e) => onSupportChange('single', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{t('contextMenu.iframeForm.singleWord')}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={supportsMultiWord}
              disabled={supportsDisabled}
              onChange={(e) => onSupportChange('multi', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{t('contextMenu.iframeForm.multiWord')}</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">{t('contextMenu.iframeForm.selectionHint')}</p>
      </div>
    </>
  );
};
