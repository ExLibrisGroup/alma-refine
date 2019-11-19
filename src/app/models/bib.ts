export interface Bib {
  link: string,
  mms_id: string;
  title: string;
  anies: any;
  refineFields?: {[key: string]: RefineField}[];
}

export interface Bibs {
  bib: Bib[];
  total_record_count: number;
}

export interface RefineField {
  tag: string;
  subfield: string;
  value: string;
  indexes?: string | string[],
  refineOptions?: RefineOption[],
  selectedRefineOption?: RefineOption 
}

export interface RefineOption {
  value: string;
  uri: string;
  previewUrl: string;
}

export interface Refinements {
  [key: string]: RefineField[]
}