import { RefineServiceField } from "../models/refine-service";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { Settings } from "../models/settings";

export const fieldFormGroup = (field: RefineServiceField = null): FormGroup => {
  if (field == null) field = new RefineServiceField();
  return new FormGroup({
    tag: new FormControl(field.tag, Validators.pattern("^[0-9x]{3}$")),
    subfield: new FormControl(field.subfield, Validators.pattern("^[a-z0-9]{1}$")),
    indexes: new FormControl(field.indexes),
    subfield2: new FormControl(field.subfield2)
  });
}

export const settingsFormGroup = (settings: Settings): FormGroup => {
  return new FormGroup({
    applyRefinementsToAllValues: new FormControl(settings.applyRefinementsToAllValues),
    refineServices: new FormArray(
      settings.refineServices.map( s=>new FormGroup({
        name: new FormControl(s.name, Validators.required),
        description: new FormControl(s.description),
        url: new FormControl(s.url),
        prefix: new FormControl(s.prefix),
        fields: new FormArray(s.fields.map( fieldFormGroup ))
      }))
    )
  });
}