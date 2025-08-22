type InvalidBookErrorProps = {
  error?: string | null;
};
/**
 * InvalidBookError component to display an error message for invalid book IDs
 * @param param0 - Props containing the error message
 * @returns JSX.Element
 */
export const InvalidBookError: React.FC<InvalidBookErrorProps> = ({ error }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Invalid Book ID</h1>
      <p className="text-gray-600">Please select a valid book to read.</p>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  </div>
);
