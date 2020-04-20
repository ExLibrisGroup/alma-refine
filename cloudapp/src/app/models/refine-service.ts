export interface RefineServiceDef {
  name: string,
  description: string,
  url: string,
  prefix?: string,
  fields: RefineServiceField[],
  serviceDetails?: any
}

export class RefineServiceField {
  tag: string = "";
  subfield: string = "a";
  subfield2: string[] = [];
  indexes: string[] = [];
}

export interface RefineQuery {
  query: string,
  limit?: number,
  type?: string | string[]
}

export interface RefineQueries {
  [key: string]: RefineQuery[]
}

export interface RefineResponse {
  [key: string]: { result: RefineResult[] }
}

export interface RefineResult {
  id: string, 
  match: boolean,
  name: string,
  score: number
}