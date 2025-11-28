type MessageItemContainerProps = {
  roleName: string;
  children: React.ReactNode;
  hideRoleLabel?: boolean;
};

export const MessageItemContainer: React.FC<MessageItemContainerProps> = ({
  roleName,
  children,
  hideRoleLabel = false,
}) => (
  <div className="py-2">
    {!hideRoleLabel && (
      <header className="mb-2 text-sm font-semibold text-gray-600">ROLE: {roleName}</header>
    )}
    <main className="prose prose-sm w-full max-w-none">{children}</main>
  </div>
);
