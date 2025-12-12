import { ParsedUrl, QueryParamRow } from './types';

const splitQueryString = (search: string): QueryParamRow[] => {
  if (!search) {
    return [];
  }

  return search
    .split('&')
    .filter((segment) => segment !== '')
    .map((segment) => {
      const equalIndex = segment.indexOf('=');

      if (equalIndex === -1) {
        return { name: segment, value: '' };
      }

      const name = segment.slice(0, equalIndex);
      const value = segment.slice(equalIndex + 1);

      return { name, value };
    });
};

export const parseUrl = (rawUrl: string): ParsedUrl => {
  if (!rawUrl) {
    return { base: '', hash: '', params: [] };
  }

  const hashIndex = rawUrl.indexOf('#');
  const hash = hashIndex === -1 ? '' : rawUrl.slice(hashIndex);
  const withoutHash = hashIndex === -1 ? rawUrl : rawUrl.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf('?');

  if (queryIndex === -1) {
    return { base: withoutHash, hash, params: [] };
  }

  const base = withoutHash.slice(0, queryIndex);
  const search = withoutHash.slice(queryIndex + 1);
  const params = splitQueryString(search);

  return { base, hash, params };
};

export const buildUrl = ({ base, hash, params }: ParsedUrl): string => {
  if (!params.length) {
    return `${base}${hash}`;
  }

  const queryString = params
    .map(({ name, value }) => `${name}=${value ?? ''}`)
    .join('&');

  return `${base}?${queryString}${hash}`;
};
