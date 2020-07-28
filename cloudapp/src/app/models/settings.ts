import { defaultRefineServices, RefineServices } from "./refine-service";

export class Settings {
  applyRefinementsToAllValues: boolean = true;
  refineServices: RefineServices = defaultRefineServices;
}