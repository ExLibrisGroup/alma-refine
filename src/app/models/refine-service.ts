export interface RefineServiceDef {
  name: string,
  description: string,
  url: string,
  fields: string[],
  serviceDetails: any
}

export interface RefineQuery {
  query: string,
  limit?: number,
  type?: string
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