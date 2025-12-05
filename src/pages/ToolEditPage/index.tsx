import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../../components/Container';
import { ToolTypeSelector } from '../ContextMenuSettingsPage/components/ToolTypeSelector';
import { AIToolForm } from '../ContextMenuSettingsPage/components/AIToolForm';
import { IframeToolForm } from '../ContextMenuSettingsPage/components/IframeToolForm';
import { useToolForm } from '../ContextMenuSettingsPage/hooks/useToolForm';
import { useContextMenuSettings } from '../ContextMenuSettingsPage/hooks/useContextMenuSettings';

export const ToolEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('settings');
  const contextMenuSettings = useContextMenuSettings();
  const form = useToolForm();
  const { loadTool } = form;

  const toolIndex = useMemo(() => Number(id), [id]);
  const isValidIndex =
    Number.isInteger(toolIndex) &&
    toolIndex >= 0 &&
    toolIndex < contextMenuSettings.settings.items.length;

  useEffect(() => {
    if (contextMenuSettings.isLoading || !isValidIndex) return;
    const tool = contextMenuSettings.settings.items[toolIndex];
    if (tool) {
      loadTool(tool);
    }
  }, [contextMenuSettings.isLoading, contextMenuSettings.settings.items, isValidIndex, loadTool, toolIndex]);

  const handleSubmit = async () => {
    if (!isValidIndex) return;

    const updatedTool = form.createTool();
    if (!updatedTool) return;

    const success = await contextMenuSettings.saveTool(toolIndex, updatedTool);
    if (success) {
      navigate('/settings/contextmenu');
    }
  };

  const handleCancel = () => {
    navigate('/settings/contextmenu');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Container
      breadcrumbItems={[
        { label: t('breadcrumbs.home'), path: '/' },
        { label: t('breadcrumbs.settings'), path: '/settings' },
        { label: t('breadcrumbs.contextMenu'), path: '/settings/contextmenu' },
        { label: t('toolForm.editBreadcrumb') },
      ]}
      backTo="/settings/contextmenu"
    >
      <div className="min-h-screen bg-white p-4 md:p-6" onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {t('toolForm.editTitle')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            {t('toolForm.editDescription')}
          </p>
        </div>

        {contextMenuSettings.isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center text-gray-500">
            {t('toolForm.loading')}
          </div>
        ) : !isValidIndex ? (
          <div className="mx-auto max-w-2xl rounded-md bg-red-50 p-4 text-red-700">
            {t('toolForm.notFound')}
            <div className="mt-4">
              <button
                onClick={handleCancel}
                className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                {t('toolForm.backToSettings')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <ToolTypeSelector selectedType={form.toolType} onTypeChange={form.setToolType} />
            </div>

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
                {contextMenuSettings.isSaving ? t('toolForm.saving') : t('toolForm.saveChanges')}
              </button>
            </div>

            {contextMenuSettings.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-red-700">{contextMenuSettings.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default ToolEditPage;
