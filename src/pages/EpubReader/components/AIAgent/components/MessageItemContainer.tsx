type MessageItemContainerProps = {
  roleName: 'Me' | 'Agent';
  children: React.ReactNode;
  hideRoleLabel?: boolean;
  onContentClick?: (event: React.MouseEvent<HTMLElement>) => void;
  contentRef?: React.RefObject<HTMLDivElement>;
};

export const MessageItemContainer: React.FC<MessageItemContainerProps> = ({
  roleName,
  children,
  hideRoleLabel = false,
  onContentClick,
  contentRef,
}) => (
  <div className={['p-2', roleName === 'Me' ? 'rounded-md bg-slate-100' : ''].join(' ')}>
    {!hideRoleLabel && (
      <header className="mb-2 text-sm font-semibold text-gray-600">{roleName}: </header>
    )}
    <main ref={contentRef} onClick={onContentClick} className="prose prose-sm w-full max-w-none">
      {children}
    </main>
  </div>
);
