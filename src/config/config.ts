import { ContextMenuItem } from '@/types/epub';

export const menuItemDefaultConfig: ContextMenuItem[] = [
  {
    type: 'iframe',
    name: 'Eudic',
    shortName: 'Eud',
    url: 'https://dict.eudic.net/dicts/MiniDictSearch2?word={words}&context={context}',
  },
];
