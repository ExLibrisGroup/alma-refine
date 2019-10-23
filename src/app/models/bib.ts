export interface Bib {
  link: string,
  mmsId: string;
  title: string;
  //dataFields: {[key: string]: string}[];
  dataFields?: object
  //dataFields: [string, string][];
}

export interface Bibs {
  bibs: Bib[];
  total_record_count: number;
}
