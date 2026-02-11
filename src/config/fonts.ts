export interface FontOption {
  id: string;
  name: string;
  enName: string;
  family: string;
  url?: string;
  category: 'sans' | 'serif' | 'rounded' | 'script';
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'system',
    name: '系统默认',
    enName: 'System Default',
    family: 'system-ui, -apple-system, sans-serif',
    category: 'sans',
  },
  {
    id: 'noto-serif-sc',
    name: '思源宋体',
    enName: 'Noto Serif SC',
    family: '"Noto Serif SC", serif',
    url: '/fonts/noto-serif-sc.css',
    category: 'serif',
  },
  {
    id: 'quicksand-chill',
    name: '亲和圆体',
    enName: 'Soft Rounded',
    family: '"Quicksand", "ZCOOL KuaiLe", sans-serif',
    url: '/fonts/quicksand-zh.css',
    category: 'rounded',
  },
  {
    id: 'inter-harmony',
    name: '清新黑体',
    enName: 'Clean Sans',
    family: '"Inter", "Noto Sans SC", sans-serif',
    url: '/fonts/inter-zh.css',
    category: 'sans',
  },
  {
    id: 'amazon-ember',
    name: 'Kindle 圆体',
    enName: 'Kindle Rounded',
    family: '"Amazon Ember", sans-serif',
    url: '/fonts/amazon-ember.css',
    category: 'rounded',
  },
  {
    id: 'ms-yahei',
    name: '微软雅黑',
    enName: 'Microsoft YaHei',
    family: '"Microsoft YaHei", sans-serif',
    url: '/fonts/microsoft-yahei.css',
    category: 'sans',
  },
  {
    id: 'fz-zhunyuan',
    name: '方正准圆',
    enName: 'FZZhunYuan',
    family: '"FZZhunYuan", sans-serif',
    url: '/fonts/fz-zhunyuan.css',
    category: 'rounded',
  },
  {
    id: 'bookerly',
    name: 'Bookerly',
    enName: 'Bookerly',
    family: '"Bookerly", serif',
    url: '/fonts/bookerly.css',
    category: 'serif',
  },
];

export const DEFAULT_FONT_ID = 'system';
