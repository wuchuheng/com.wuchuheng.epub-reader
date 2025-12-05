import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../../components/Container';
import { ToolTypeSelector } from '../ContextMenuSettingsPage/components/ToolTypeSelector';
import { AIToolForm } from '../ContextMenuSettingsPage/components/AIToolForm';
import { IframeToolForm } from '../ContextMenuSettingsPage/components/IframeToolForm';
import { useToolForm } from '../ContextMenuSettingsPage/hooks/useToolForm';
import { useContextMenuSettings } from '../ContextMenuSettingsPage/hooks/useContextMenuSettings';

/**
 * Tool Extract Page component.
 * Dedicated page for adding new AI or iframe tools.
 * Optimized for mobile devices with full-page form layout.
 * Follows high cohesion and low coupling principles.
 */
export const ToolExtractPage: React.FC = () => {
  // 1. Navigation and hooks
  const navigate = useNavigate();
  const contextMenuSettings = useContextMenuSettings();
  const form = useToolForm();
  const { resetForm } = form;
  const { t } = useTranslation('settings');

  // 2. Effects
  // 2.1 Reset form when component mounts
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  // 3. Event handlers
  // 3.1 Handle form submission
  const handleSubmit = async () => {
    const newTool = form.createTool();
    if (newTool) {
      // Add the tool
      const success = await contextMenuSettings.addTool(newTool);
      if (success) {
        // Navigate back to context menu settings
        navigate('/settings/contextmenu');
      }
    }
  };

  // 3.2 Handle cancel
  const handleCancel = () => {
    navigate('/settings/contextmenu');
  };

  // 3.3 Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  // 4. Render
  return (
    <Container
      breadcrumbItems={[
        { label: t('breadcrumbs.home'), path: '/' },
        { label: t('breadcrumbs.settings'), path: '/settings' },
        { label: t('breadcrumbs.contextMenu'), path: '/settings/contextmenu' },
        { label: t('toolForm.addBreadcrumb') },
      ]}
      backTo="/settings/contextmenu"
    >
      <div className="min-h-screen bg-white p-4 md:p-6" onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {t('toolForm.addTitle')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">{t('toolForm.description')}</p>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Tool Type Selection */}
          <div className="rounded-lg bg-gray-50 p-4">
            <ToolTypeSelector selectedType={form.toolType} onTypeChange={form.setToolType} />
          </div>

          {/* Tool Name */}
          <div className="rounded-lg bg-gray-50 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('toolForm.toolName')}
            </label>
            <input
              type="text"
              value={form.toolName}
              onChange={(e) => form.setToolName(e.target.value)}
              placeholder={t('toolForm.toolNamePlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-blue-500
              focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* Short Name */}
          <div className="rounded-lg bg-gray-50 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('toolForm.shortName')}{' '}
              <span className="text-xs text-gray-500">{t('toolForm.shortNameHint')}</span>
            </label>
            <input
              type="text"
              value={form.toolShortName}
              onChange={(e) => form.setToolShortName(e.target.value)}
              placeholder={t('toolForm.shortNamePlaceholder')}
              maxLength={15}
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-blue-500
              focus:outline-none focus:ring-blue-500"
            />
            <p className="mt-2 text-xs text-gray-500">{t('toolForm.shortNameHelper')}</p>
          </div>

          {/* Enabled Toggle */}
          <div className="rounded-lg bg-gray-50 p-4">
            <button
              type="button"
              onClick={() => form.setEnabled(!form.enabled)}
              aria-pressed={form.enabled}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                form.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                  form.enabled ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dynamic Fields Based on Tool Type */}
          <div className="rounded-lg bg-gray-50 p-4">
            {form.toolType === 'AI' ? (
              <AIToolForm
                prompt={form.toolPrompt}
                reasoningEnabled={form.reasoningEnabled}
                supportsSingleWord={form.supportsSingleWord}
                supportsMultiWord={form.supportsMultiWord}
                supportsDisabled={!form.enabled}
                onPromptChange={form.setToolPrompt}
                onReasoningToggle={form.setReasoningEnabled}
                onSupportChange={(target, enabled) =>
                  target === 'single'
                    ? form.setSupportsSingleWord(enabled)
                    : form.setSupportsMultiWord(enabled)
                }
              />
            ) : (
              <IframeToolForm
                url={form.toolUrl}
                supportsSingleWord={form.supportsSingleWord}
                supportsMultiWord={form.supportsMultiWord}
                supportsDisabled={!form.enabled}
                onUrlChange={form.setToolUrl}
                onSupportChange={(target, enabled) =>
                  target === 'single'
                    ? form.setSupportsSingleWord(enabled)
                    : form.setSupportsMultiWord(enabled)
                }
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-base font-medium text-gray-700
              transition-colors hover:bg-gray-100"
            >
              {t('toolForm.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.isValid() || contextMenuSettings.isSaving}
              className="flex-1 rounded-md bg-blue-500 px-4 py-3 text-base font-medium text-white transition-colors
              hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {contextMenuSettings.isSaving ? t('toolForm.adding') : t('toolForm.addAction')}
            </button>
          </div>

          {/* Error State */}
          {contextMenuSettings.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-red-700">{contextMenuSettings.error}</div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

// Default export for router
export default ToolExtractPage;
