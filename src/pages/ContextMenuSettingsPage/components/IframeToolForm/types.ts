export interface QueryParamRow {
  name: string;
  value: string;
}

export interface ParsedUrl {
  base: string;
  hash: string;
  params: QueryParamRow[];
}
