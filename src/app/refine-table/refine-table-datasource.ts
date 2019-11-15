import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Bib, Bibs, Refinements, RefineField } from '../models/bib';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { BibsService } from '../services/bibs.service';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineService } from '../services/refine.service';
import { Utils } from '../utilities';

export class RefineTableDataSource implements DataSource<Bib> {

  private _setId: string;

  /* Subjects and Observables */
  private bibsSubject = new BehaviorSubject<Bib[]>([]);
  private refinements: Refinements = <Refinements>{};
  private refinementsSubject = new BehaviorSubject<Refinements>(this.refinements);
  public  refinements$ = this.refinementsSubject.asObservable();
  private status: RefineDataSourceStatus = { isLoading: false, recordCount: 0, percentComplete: -1 };
  private statusSubject = new BehaviorSubject<RefineDataSourceStatus>(this.status);
  public  status$ = this.statusSubject.asObservable();

  constructor(private bibsService: BibsService, private configService: ConfigService,
    private refineService: RefineService) {}

  connect(collectionViewer: CollectionViewer): Observable<Bib[]> {
    return this.bibsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.bibsSubject.complete();
    this.refinementsSubject.complete();
    this.statusSubject.complete();
  }

  async loadBibs( { setId = this._setId, pageIndex = 0, pageSize = 10 } = {} ) {
    this._setId = setId;
    this.statusSubject.next(this.setStatus({isLoading: true}));
    let setMembers = await this.bibsService.getMmsIdsFromSet(setId, pageIndex, pageSize).toPromise();
    this.statusSubject.next(this.setStatus({recordCount: setMembers.total_record_count}));
    this.bibsService.getBibs(setMembers.member.map(m=>m.id))
      .pipe(
        catchError(() => of (<Bibs>{})), 
        finalize(()=>this.statusSubject.next(this.setStatus({isLoading: false})))
      )
      .subscribe(bibs=>{ 
        this.loadRefinements(bibs.bib); 
        this.bibsSubject.next(bibs.bib);
      });
  }

  async loadRefinements( bibs: Bib[] ) {
    bibs.forEach(bib=>this.refinements[bib.mms_id]=this.refinements[bib.mms_id] || this.extractRefineFields(bib.anies, this.configService.selectedRefineService.fields));
    let refinements = Utils.pick(bibs.map(b=>b.mms_id))(this.refinements);
    this.refinementsSubject.next(refinements);
    refinements = await this.refineService.callRefineService(refinements, this.configService.selectedRefineService);
  }

  async saveRefinements() {
    this.statusSubject.next(this.setStatus({percentComplete: 0, isLoading: true}))
    /* Filter refinements for those which have 1 or more refined fields */
    let updates = Utils.filter(Utils.combine(Object.entries(this.refinements).map(([k, v]) => ({[k]: v.filter(b=>b.selectedRefineOption)}))) as Refinements, update => update.length > 0);
    if (Object.keys(updates).length > 0) {
      let bibs = await this.bibsService.getBibs(Object.keys(updates)).toPromise();
      let applied = bibs.bib.map(bib => this.applyRefinements(bib, updates[bib.mms_id]));
      let complete = 0;
      /* Chunk into 10 updates at at time */
      await Utils.asyncForEach(Utils.chunk(applied, 10), async (batch) => await Promise.all(batch.map(bib => this.bibsService.createBib(bib).toPromise()))
        .then(data=> { 
          complete += data.length; 
          this.statusSubject.next(this.setStatus({percentComplete: (complete/applied.length)*100}))
          console.log('Created ' + data.map(b=>b.mms_id).join(', '))
        }));
    }
    this.statusSubject.next(this.setStatus({isLoading: false, percentComplete: -1}));
  }

  private setStatus(options: { isLoading?: boolean, percentComplete?: number, recordCount?: number}): RefineDataSourceStatus {
    Object.entries(options).forEach(([key, value]) => this.status[key] = value);
    return this.status;
  }

  private applyRefinements( bib: Bib, refinements: RefineField[]): Bib {
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
  }

  private extractRefineFields( marcxml: any, fields: string[]): RefineField[] {
    const doc = new DOMParser().parseFromString(marcxml, "application/xml");

    let refineFields = new Array<RefineField>();
    
    fields.forEach(field=>{
      let [tag, subfieldCode = 'a'] = field.split('$');
      let xpath = [];
      for (var i = 0; i < tag.length; i++) {
        if (tag.charAt(i)!='x') {
          xpath.push(`substring(@tag,${i+1},1)="${tag.charAt(i)}"`);
        }
      }
      let datafields = Utils.select(doc, `/record/datafield[${xpath.join(' and ')}]`);
      let datafield: Element, subfield: Element;
      while (datafield=datafields.iterateNext() as Element) {
        let subfields = Utils.select(doc, `subfield[@code="${subfieldCode}"]`, {context: datafield});
        let uri = Utils.select(doc, 'subfield[@code="0"]', {context: datafield, single: true});
        if(subfield=subfields.iterateNext() as Element) {
          refineFields.push({
            tag: datafield.getAttribute('tag'),
            subfield: subfieldCode, 
            value: subfield.textContent,
            selectedRefineOption: uri.singleNodeValue ? { uri: uri.singleNodeValue.textContent, value: null, previewUrl: null } : null
          })
        }
      };
    })    
    return refineFields;
  }

}

export interface RefineDataSourceStatus {
  isLoading: boolean;
  recordCount: number;
  percentComplete: number;
}