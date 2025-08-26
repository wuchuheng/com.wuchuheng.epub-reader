import { PiDropSimple } from 'react-icons/pi';

type MessageItemContainerProps = {
  roleName: string;
  children: React.ReactNode;
};

export const MessageItemContainer: React.FC<MessageItemContainerProps> = ({
  roleName,
  children,
}) => (
  <div className="py-2">
    <header className="mb-2 text-sm font-semibold text-gray-600">ROLE: {roleName}</header>
    <main className="prose prose-sm w-full max-w-none">{children}</main>
  </div>
);
