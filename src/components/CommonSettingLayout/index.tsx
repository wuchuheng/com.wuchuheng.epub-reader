import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CommonSettingLayoutProps {
  title: string;
  description: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  error?: string | null;
  childrenStyle?: React.CSSProperties | undefined;
}

export const CommonSettingLayout: React.FC<CommonSettingLayoutProps> = ({
  title,
  description,
  sidebar,
  children,
  onSave,
  isSaving,
  saveStatus,
  error,
  childrenStyle,
}) => {
  const { t } = useTranslation('settings');

  return (
    <div className="flex h-full flex-col space-y-6 text-black">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {/* Main Grid: Sidebar + Content/Preview */}
      <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar */}
        <div className="flex flex-col space-y-2 overflow-y-auto pr-2">{sidebar}</div>

        {/* Right Content / Preview Area */}
        <div
          className="relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          style={childrenStyle}
        >
          {children}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="min-w-[120px] rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? t('contextMenu.actions.saving') : t('contextMenu.actions.save')}
          </button>

          <div className="absolute right-4 text-sm">
            {saveStatus === 'success' && (
              <span className="font-medium text-green-600">
                {t('contextMenu.messages.settingsSaved')}
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="font-medium text-red-600">
                {t('contextMenu.messages.settingsSaveError')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
