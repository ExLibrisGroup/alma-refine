export interface RefineServiceDef {
  name: string,
  url: string,
  prefix?: string,
  fields: RefineServiceField[],
  uriSubfield?: string,
  correctTerm?: boolean,
  serviceDetails?: any
}

export interface RefineServices {
  [key: string]: RefineServiceDef
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

export const defaultRefineServices: RefineServices = {
  "getty" : {
    "name": "Getty Vocabularies",
    "url": "https://services.getty.edu/vocab/reconcile/",
    "prefix": "http://vocab.getty.edu/",
    "fields": [
      { "tag": "1xx", "subfield": "a", "indexes": ["/ulan"], "subfield2": [] },
      { "tag": "6xx", "subfield": "a", "indexes": ["/all"], "subfield2": ["ulan", "aat", "tgn"] },
      { "tag": "7xx", "subfield": "a", "indexes": ["/ulan"], "subfield2": ["ulan"] }
    ],
    "uriSubfield": "0",
    "correctTerm": true,
  },
  "wikidata": {
    "name": "Wikidata",
    "url": "https://wdreconcile.toolforge.org/en/api",
    "prefix": "http://www.wikidata.org/entity/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": [], "subfield2": [] }
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "geonames" : {
    "name": "GeoNames",
    "url": "https://api.exldevnetwork.net/geonames-openrefine/reconcile",
    "prefix": "http://sws.geonames.org/",
    "fields": [
      { "tag": "751", "subfield": "a", "indexes": [], "subfield2": [] }
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "gnd" : {
    "name": "GND",
    "url": "https://lobid.org/gnd/reconcile",
    "prefix": "https://d-nb.info/gnd/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": [], "subfield2": [] },
      { "tag": "650", "subfield": "a", "indexes": [], "subfield2": ["gnd"] },
    ],
    "uriSubfield": "0",
    "correctTerm": true,
  },
  "bnf" : {
    "name": "BNF",
    "url": "https://conciliator.herokuapp.com/reconcile/viafproxy/BNF",
    "prefix": "https://data.bnf.fr/",
    "fields": [
      { "tag": "1xx", "subfield": "a", "indexes": [], "subfield2": [] },
      { "tag": "6xx", "subfield": "a", "indexes": [], "subfield2": [] },
      { "tag": "7xx", "subfield": "a", "indexes": [], "subfield2": [] },
    ],
    "uriSubfield": "0",
    "correctTerm": true,
  }
}
