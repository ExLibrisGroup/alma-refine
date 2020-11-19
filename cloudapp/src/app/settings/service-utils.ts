import { RefineServiceField } from "../models/refine-service";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { Settings } from "../models/settings";

export const fieldFormGroup = (field: RefineServiceField = null): FormGroup => {
  if (field == null) field = new RefineServiceField();
  return new FormGroup({
    tag: new FormControl(field.tag, Validators.pattern("^[0-9x]{3}$")),
    subfield: new FormControl(field.subfield, Validators.pattern("^[a-z0-9]{1}$")),
    indexes: new FormControl(field.indexes),
    subfield2: new FormControl(field.subfield2),
    hints: new FormControl(field.hints),
  });
}

export const settingsFormGroup = (settings: Settings): FormGroup => {
  let servicesFormGroups = new FormGroup({});
  Object.entries(settings.refineServices).forEach(([key, value]) => 
    servicesFormGroups.addControl(key, 
      new FormGroup({
        name: new FormControl(value.name, Validators.required),
        url: new FormControl(value.url),
        prefix: new FormControl(value.prefix),
        uriSubfield: new FormControl(value.uriSubfield),
        correctTerm: new FormControl(value.correctTerm),
        fields: new FormArray(value.fields.map( fieldFormGroup ))
      }))
  );
  return new FormGroup({
    applyRefinementsToAllValues: new FormControl(settings.applyRefinementsToAllValues),
    refineServices: servicesFormGroups
  });
}