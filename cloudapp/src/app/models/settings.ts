import { RefineServiceDef } from "./refine-service";

import defaultRefineServices from '../models/refineServices.json';

export class Settings {
  applyRefinementsToAllValues: boolean = true;
  refineServices: RefineServiceDef[] = defaultRefineServices;
}