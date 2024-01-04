import { RefineService } from "../services/refine.service";

export const ORCID_URL: string = "view/orcidForAlmaRefineCloudApp";

export interface RefineServiceDef {
  name: string,
  url: string,
  prefix?: string,
  fields: RefineServiceField[],
  uriSubfield?: string,
  correctTerm?: boolean,
  serviceDetails?: any
  convert?: (id: string) => string
}

export interface RefineServices {
  [key: string]: RefineServiceDef
}

export class RefineServiceField {
  tag: string = "";
  subfield: string = "a";
  subfield2: string[] = [];
  indexes: string[] = [];
  hints: string[] = [];
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
      { "tag": "1xx", "subfield": "a", "indexes": ["/ulan"], "subfield2": [], "hints": [] },
      { "tag": "6xx", "subfield": "a", "indexes": ["/all"], "subfield2": ["ulan", "aat", "tgn"], "hints": [] },
      { "tag": "7xx", "subfield": "a", "indexes": ["/ulan"], "subfield2": ["ulan"], "hints": [] }
    ],
    "uriSubfield": "0",
    "correctTerm": true,
  },
  "wikidata": {
    "name": "Wikidata",
    "url": "https://wikidata.reconci.link/en/api",
    "prefix": "http://www.wikidata.org/entity/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": [], "subfield2": [], "hints": [] }
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "geonames" : {
    "name": "GeoNames",
    "url": "https://api.exldevnetwork.net/geonames-openrefine/reconcile",
    "prefix": "http://sws.geonames.org/",
    "fields": [
      { "tag": "751", "subfield": "a", "indexes": [], "subfield2": [], "hints": [] }
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "gnd" : {
    "name": "GND",
    "url": "https://lobid.org/gnd/reconcile",
    "prefix": "https://d-nb.info/gnd/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": [], "subfield2": [], "hints": [] },
      { "tag": "650", "subfield": "a", "indexes": [], "subfield2": ["gnd"], "hints": [] },
    ],
    "uriSubfield": "0",
    "correctTerm": true,
  },
  "bnf" : {
    "name": "BNF",
    "url": "https://conciliator.herokuapp.com/reconcile/viafproxy/BNF",
    "prefix": "https://data.bnf.fr/",
    "fields": [
      { "tag": "1xx", "subfield": "a", "indexes": [], "subfield2": [], "hints": ["b", "d"] },
      { "tag": "6xx", "subfield": "a", "indexes": [], "subfield2": [], "hints": [] },
      { "tag": "75x", "subfield": "a", "indexes": ["/location/location"], "subfield2": [], "hints": ["b", "d"] },
      { "tag": "7xx", "subfield": "a", "indexes": [], "subfield2": [], "hints": ["b", "d"] },
    ],
    "uriSubfield": "1",
    "correctTerm": false,
    /* If ID begins with FRBNF, remove string and last character */
    "convert": id => { const result = id.match(/^(?:FRBNF)(\d*).$|(?!FRBNF)(.+)$/); return result[1] || result [2] }
  },
  "sudoc" : {
    "name": "SUDOC",
    "url": "https://conciliator.herokuapp.com/reconcile/viafproxy/SUDOC",
    "prefix": "https://www.idref.fr/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": ["/people/person"], "subfield2": [], "hints": ["b", "c", "d"] },
      { "tag": "130", "subfield": "a", "indexes": ["/book/book", "/book/book edition"], "subfield2": [], "hints": [] },
      { "tag": "700", "subfield": "a", "indexes": ["/people/person", "/book/book", "/book/book edition"], "subfield2": [], "hints": ["b", "c", "d"] },
      { "tag": "710", "subfield": "a", "indexes": ["/organization/organization", "/book/book", "/book/book edition"], "subfield2": [], "hints": ["b", "c", "d"] },
      { "tag": "600", "subfield": "a", "indexes": ["/people/person", "/book/book", "/book/book edition"], "subfield2": [], "hints": [] },
      { "tag": "610", "subfield": "a", "indexes": ["/organization/organization", "/book/book", "/book/book edition"], "subfield2": [], "hints": ["t"] },
      { "tag": "610", "subfield": "a", "indexes": ["/book/book", "/book/book edition"], "subfield2": [], "hints": [] },
      { "tag": "651", "subfield": "a", "indexes": ["/location/location"], "subfield2": [], "hints": [] },
      { "tag": "751", "subfield": "a", "indexes": ["/location/location"], "subfield2": [], "hints": [] },
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "orcid": {
    "name": "ORCID",
    "url": ORCID_URL,//ORCID hostname is added as a prefix, while using this value.
    "prefix": "https://orcid.org/",
    "fields": [
      { "tag": "100", "subfield": "a", "indexes": ["/people/person"], "subfield2": [], "hints": [] },
      { "tag": "700", "subfield": "a", "indexes": ["/people/person"], "subfield2": [], "hints": ["b", "c", "d"] }
      
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  },
  "homosaurus": {
    "name": "HOMOSAURUS",
    "url": "https://homosaurus.org/reconcile",
    "prefix": "https://homosaurus.org/v3/",
    "fields": [
      { "tag": "650", "subfield": "a", "indexes": [''], "subfield2": ["homoit"], "hints": [] },
      { "tag": "655", "subfield": "a", "indexes": [''], "subfield2": ["homoit"], "hints": [] },
      { "tag": "670", "subfield": "a", "indexes": [''], "subfield2": ["homoit"], "hints": [] }
    ],
    "uriSubfield": "1",
    "correctTerm": false,
  }
}
