import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateTypography } from '../../store/slices/settingsSlice';
import { FONT_OPTIONS } from '../../config/fonts';
import { CommonSettingLayout } from '../../components/CommonSettingLayout';

export const FontSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const { typography, isSaving, error } = useAppSelector((state) => state.settings);
  
  const [selectedFontId, setSelectedFontId] = useState(typography.fontFamily);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setSelectedFontId(typography.fontFamily);
  }, [typography.fontFamily]);

  const handleSave = async () => {
    const result = await dispatch(updateTypography({ fontFamily: selectedFontId }));
    if (updateTypography.fulfilled.match(result)) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const selectedFont = FONT_OPTIONS.find(f => f.id === selectedFontId) || FONT_OPTIONS[0];
  const isChinese = i18n.language.startsWith('zh');

  const sidebar = (
    <>
      {FONT_OPTIONS.map((font) => (
        <button
          key={font.id}
          onClick={() => setSelectedFontId(font.id)}
          className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
            selectedFontId === font.id
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span 
            className={`text-base font-medium ${selectedFontId === font.id ? 'text-blue-700' : 'text-gray-900'}`}
            style={{ fontFamily: font.family }}
          >
            {isChinese ? font.name : font.enName}
          </span>
          <span className="mt-1 text-xs text-gray-500 uppercase tracking-wider">
            {font.category}
          </span>
        </button>
      ))}
    </>
  );

  return (
    <CommonSettingLayout
      title={t('nav.typography', { defaultValue: 'Typography' })}
      description={t('navDescriptions.typography', { defaultValue: 'Customize the look and feel of your reading experience.' })}
      sidebar={sidebar}
      onSave={handleSave}
      isSaving={isSaving}
      saveStatus={saveStatus}
      error={error}
    >
      {/* Font Loader for Preview */}
      {selectedFont.url && <link rel="stylesheet" href={selectedFont.url} />}
      
      <div className="flex flex-1 flex-col p-8 overflow-y-auto bg-slate-50/30">
        <div 
          className="mx-auto max-w-2xl w-full space-y-6 bg-white p-10 rounded-xl shadow-sm border border-gray-100"
          style={{ fontFamily: selectedFont.family }}
        >
          <h2 className="text-3xl font-bold border-b pb-4 text-gray-900">
            {isChinese ? '沉浸式阅读体验' : 'Immersive Reading'}
          </h2>
          
          <div className="space-y-4 text-lg leading-relaxed text-gray-800">
            <p>
              {isChinese 
                ? '在这个快节奏的时代，找回阅读的宁静。优秀的排版不仅仅是文字的堆砌，更是对内容的尊重和对读者的关怀。'
                : 'In this fast-paced era, find the tranquility of reading. Great typography is not just about words on a page; it is about respect for content and care for the reader.'}
            </p>
            
            <p>
              {isChinese
                ? '圆体字体（Rounded Fonts）以其温润的触感和亲和力，能有效缓解长时间阅读带来的视觉压力，让每一段文字都散发出柔和的光芒。'
                : 'Rounded fonts, with their warm touch and approachability, can effectively relieve visual pressure from long reading sessions, letting every paragraph shine with a soft light.'}
            </p>

            <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 italic">
              "Typography is the craft of endowing human language with a durable visual form."
              <br />
              <span className="text-sm not-italic mt-2 block">— Robert Bringhurst</span>
            </blockquote>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 text-sm font-medium text-gray-400 uppercase tracking-widest">
              <div>{selectedFont.enName}</div>
              <div className="text-right">Preview Mode</div>
            </div>
          </div>
        </div>
      </div>
    </CommonSettingLayout>
  );
};

export default FontSettingsPage;
