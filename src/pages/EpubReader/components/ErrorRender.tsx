import { useTranslation } from 'react-i18next';

type InvalidBookErrorProps = {
  error?: string | null;
};
/**
 * InvalidBookError component to display an error message for invalid book IDs
 * @param param0 - Props containing the error message
 * @returns JSX.Element
 */
export const InvalidBookError: React.FC<InvalidBookErrorProps> = ({ error }) => {
  const { t } = useTranslation('reader');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{t('invalidBook.title')}</h1>
        <p className="text-gray-600">{t('invalidBook.message')}</p>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};
