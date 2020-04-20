import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Bib, Refinements, RefineField } from '../models/bib';
import { BehaviorSubject, Observable, of, from, iif } from 'rxjs';
import { BibsService } from '../services/bibs.service';
import { mergeMap, map, tap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineService } from '../services/refine.service';
import { Utils } from '../utilities';
import { RefineServiceField } from '../models/refine-service';

const MAX_PARALLEL_CALLS = 5;

export class RefineTableDataSource implements DataSource<Bib> {

  private _setId: string;
  private _mmsIds: string[];
  private shouldApplyRefinementsToAllValues: boolean;

  /* Subjects and Observables */
  private bibsSubject = new BehaviorSubject<Bib[]>([]);
  private refinements: Refinements = <Refinements>{};
  private refinementsSubject = new BehaviorSubject<Refinements>(this.refinements);
  public  refinements$ = this.refinementsSubject.asObservable();
  public  recordCount: number;

  constructor(
    private bibsService: BibsService, 
    private configService: ConfigService,
    private refineService: RefineService, 
    private mmsIds = [], 
    private setId = null) {
      this._setId = setId;
      this._mmsIds = mmsIds;
      this.configService.getSettings()
        .subscribe(settings=>this.shouldApplyRefinementsToAllValues=settings.applyRefinementsToAllValues)
    }

  connect(collectionViewer: CollectionViewer): Observable<Bib[]> {
    return this.bibsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.bibsSubject.complete();
    this.refinementsSubject.complete();
  }

  loadBibs( { pageIndex = 0, pageSize = 10 } = {} ) {
    return iif(() => this._setId != null,  
      this.bibsService.getMmsIdsFromSet(this.setId, pageIndex, pageSize)
        .pipe(
          tap(members=>this.recordCount = members.total_record_count),
          map(members=>members.member ? members.member.map(m=>m.id) : [])
        ),
      of(this._mmsIds.slice(pageSize*pageIndex, pageSize*(pageIndex+1)))
        .pipe(
          tap(() =>this.recordCount = this._mmsIds.length)
        )
      ).pipe(
        mergeMap(mmsIds => this.bibsService.getBibs(mmsIds)),
        tap(bibs => {
          this.loadRefinements(bibs.bib);
          this.bibsSubject.next(bibs.bib);
        })
      )
  }

  loadRefinements( bibs: Bib[] ) {
    bibs.forEach(bib=>this.refinements[bib.mms_id]=this.refinements[bib.mms_id] || this.extractRefineFields(bib.anies, this.configService.selectedRefineService.fields));
    let refinements = Utils.pick(bibs.map(b=>b.mms_id))(this.refinements);
    this.applyRefinementsToAllValues(refinements);
    this.refinementsSubject.next(refinements);
    this.refineService.callRefineService(refinements, this.configService.selectedRefineService).subscribe(data=>refinements=data);
  }

  compareField(field1: RefineField, field2: RefineField) {
    return field1.tag === field2.tag && field1.subfield === field2.subfield && field1.value === field2.value;
  }

  /**
   * Applies refinements to all fields with the same value
   * @param target - The BIBs to which the specified refinements should be applied. Limit when BIBs are loaded.
   * @param field - The field to check in the target. Specified when a refinement is selected. Default is to check all refined fields.
   */
  applyRefinementsToAllValues(target: Refinements, field: RefineField = null) {
    if (this.shouldApplyRefinementsToAllValues) {
      Object.values(target).forEach(b=>b.forEach(f=>{
        if (field) {
          if (this.compareField(field, f))
            f.selectedRefineOption = field.selectedRefineOption;
        } else {
          /* Apply all refined fields */
          const refinedFields: RefineField[] = [].concat(...Object.values(this.refinements)).filter(f=>f.selectedRefineOption);
          if (refinedFields.some(rf=>this.compareField(rf, f)))
            f.selectedRefineOption = refinedFields.find(rf=>this.compareField(rf, f)).selectedRefineOption
        }
      }))
    }
  }

  onRefinementSelected(field: RefineField) {
    this.applyRefinementsToAllValues(this.refinements, field);
  }

  /** Return refinements for those which have 1 or more refined fields */
  get updates() {
    return Utils.filter(Utils.combine(Object.entries(this.refinements).map(([k, v]) => ({[k]: v.filter(b=>b.selectedRefineOption)}))) as Refinements, update => update.length > 0);
  }

  saveRefinements() {
    return from(Object.entries(this.updates))
      .pipe(
        mergeMap(([mmsId, fields]) => this.applyRefinements(mmsId, fields), MAX_PARALLEL_CALLS),
        mergeMap(bib=>this.bibsService.updateBib(bib), MAX_PARALLEL_CALLS),
        map(bib=>bib.mms_id)
      )
  }

  private applyRefinements( mmsId: string, refinements: RefineField[]): Observable<Bib> {
    return this.bibsService.getBib(mmsId).pipe( map( bib => {
      const doc = new DOMParser().parseFromString(bib.anies, "application/xml");
      refinements.forEach(field=>{
        let datafield = Utils.select(doc, `/record/datafield[@tag='${field.tag}']/subfield[@code='${field.subfield}' and text()='${field.value}']`, { single: true }).singleNodeValue;
        if (datafield) {
          if (field.selectedRefineOption) {
            datafield.textContent=field.selectedRefineOption.value;
            /* Add subfield 0 if not exists */
            let uri = Utils.select(doc, 'subfield[@code="0"]', { context: datafield.parentNode, single: true }).singleNodeValue;
            if (uri) {
              uri.textContent = field.selectedRefineOption.uri
            } else {
              Utils.dom("subfield", { parent: datafield.parentNode, text: field.selectedRefineOption.uri, attributes: [ ["code", "0"] ]});
            }
          }
        }
      }) 
      bib.anies = new XMLSerializer().serializeToString(doc.documentElement);
      return bib;
    }))
  }

  private extractRefineFields( marcxml: any, fields: RefineServiceField[]): RefineField[] {
    const doc = new DOMParser().parseFromString(marcxml, "application/xml");

    let refineFields = new Array<RefineField>();
    
    fields.forEach(field=>{
      let xpath = [];
      for (var i = 0; i < field.tag.length; i++) {
        if (field.tag.charAt(i)!='x') {
          xpath.push(`substring(@tag,${i+1},1)="${field.tag.charAt(i)}"`);
        }
      }
      if (field.subfield2.length!=0)
        xpath.push(`contains("${field.subfield2.join(' ')}", subfield[@code="2"]) and string-length(subfield[@code="2"]) != 0`);

        let datafields = Utils.select(doc, `/record/datafield[${xpath.join(' and ')}]`);
      let datafield: Element, subfield: Element;
      while (datafield=datafields.iterateNext() as Element) {
        let subfields = Utils.select(doc, `subfield[@code="${field.subfield}"]`, {context: datafield});
        let uri = Utils.select(doc, 'subfield[@code="0"]', {context: datafield, single: true});
        if(subfield=subfields.iterateNext() as Element) {
          refineFields.push({
            tag: datafield.getAttribute('tag'),
            subfield: field.subfield, 
            value: subfield.textContent,
            selectedRefineOption: uri.singleNodeValue ? { uri: uri.singleNodeValue.textContent, value: null, previewUrl: null } : null,
            indexes: field.indexes
          })
        }
      };
    })    
    return refineFields;
  }

}