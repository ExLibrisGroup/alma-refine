export interface RefineServiceDef {
  name: string,
  description: string,
  url: string,
  prefix?: string,
  fields: (string|RefineServiceField)[],
  serviceDetails: any
}

export interface RefineServiceField {
  field: string, 
  subfield2?: string | string[],
  indexes: string | string[]
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