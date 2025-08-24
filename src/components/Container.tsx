import BackButton from './BackButton';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';

type ContainerProps = {
  breadcrumbItems: BreadcrumbItem[];
  backTo: string;
  children?: React.ReactNode;
};
export const Container: React.FC<ContainerProps> = (props) => {
  console.log('Rendering Container component');

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton to={props.backTo} label="" />
              <div>
                <Breadcrumb items={[...props.breadcrumbItems]} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{props.children}</main>
    </div>
  );
};
