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
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public  isLoading = this.loadingSubject.asObservable();
  private recordCountSubject = new BehaviorSubject<number>(0);
  public  recordCount = this.recordCountSubject.asObservable();

  constructor(private bibsService: BibsService, private configService: ConfigService,
    private refineService: RefineService) {}

  connect(collectionViewer: CollectionViewer): Observable<Bib[]> {
    return this.bibsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.bibsSubject.complete();
    this.loadingSubject.complete();
    this.recordCountSubject.complete();
    this.refinementsSubject.complete();
  }

  async loadBibs( { setId = this._setId, pageIndex = 0, pageSize = 10 } = {} ) {
    this._setId = setId;
    this.loadingSubject.next(true);
    let setMembers = await this.bibsService.getMmsIdsFromSet(setId, pageIndex, pageSize).toPromise();
    this.recordCountSubject.next(setMembers.total_record_count), 
    this.bibsService.getBibs(setMembers.member.map(m=>m.id))
      .pipe(
        catchError(() => of (<Bibs>{})), 
        finalize(()=>this.loadingSubject.next(false))
      )
      .subscribe(bibs=>{ 
        this.loadRefinements(bibs.bib); 
        this.bibsSubject.next(bibs.bib);
      });
  }

  async loadRefinements( bibs: Bib[] ) {
    // TODO: Set selected field if $0 exists
    bibs.forEach(bib=>this.refinements[bib.mms_id]=this.extractRefineFields(bib.anies, this.configService.selectedRefineService.fields));
    let refinements: Refinements = Utils.pick(bibs.map(b=>b.mms_id))(this.refinements);
    this.refinementsSubject.next(refinements);
    refinements = await this.refineService.callRefineService(refinements, this.configService.selectedRefineService);
  }

  async saveRefinements() {
    this.loadingSubject.next(true);
    /* Filter refinements for those which have 1 or more refined fields */
    let updates = Utils.filter(Object.assign({}, ...Object.entries(this.refinements).map(([k, v]) => ({[k]: v.filter(b=>b.selectedRefineOption)}))), update => update.length > 0);
    let bibs: Bibs = await this.bibsService.getBibs(Object.keys(updates)).toPromise();
    let applied: Bib[] = bibs.bib.map(bib => this.applyRefinements(bib, updates[bib.mms_id]));
    /* Chunk into 10 updates at at time */
    await Utils.asyncForEach(Utils.chunk(applied, 10), async (batch) => await Promise.all(batch.map(bib => this.bibsService.createBib(bib).toPromise())));
    this.loadingSubject.next(false);
  }

  private applyRefinements( bib: Bib, refinements: RefineField[]): Bib {
    const doc = new DOMParser().parseFromString(bib.anies, "application/xml");
    refinements.forEach(field=>{
      let datafields = Utils.select(doc, `/record/datafield[@tag='${field.tag}']/subfield[@code='${field.subfield}' and text()='${field.value}']`)
      let datafield;
      if (datafield=datafields.iterateNext()) {
        if (field.selectedRefineOption) {
          datafield.textContent=field.selectedRefineOption.value;
          let element = doc.createElement("subfield");
          element.setAttribute('code','0');
          let txt = doc.createTextNode(field.selectedRefineOption.uri);
          element.appendChild(txt);
          datafield.parentNode.appendChild(element);
        }
      }
    }) 
    bib.anies = new XMLSerializer().serializeToString(doc.documentElement);
    return bib;
  }

  private extractRefineFields( marcxml: any, fields: string[]): RefineField[] {
    const doc = new DOMParser().parseFromString(marcxml, "application/xml");

    let refineFields = [];
    
    fields.forEach(field=>{
      let [tag, subfieldCode = 'a'] = field.split('$');
      let xpath = [];
      for (var i = 0; i < tag.length; i++) {
        if (tag.charAt(i)!='x') {
          xpath.push(`substring(@tag,1,1)="${tag.charAt(i)}"`);
        }
      }
      let datafields = Utils.select(doc, `/record/datafield[${xpath.join(' or ')}]`);
      let datafield, subfield: Node;
      while (datafield=datafields.iterateNext()) {
        let subfields = Utils.select(doc, `subfield[@code="${subfieldCode}"]`, datafield);
        if(subfield=subfields.iterateNext()) {
          refineFields.push({
            tag: datafield.getAttribute('tag'),
            subfield: subfieldCode, 
            value: subfield.textContent
          })
        }
      };
    })    
    return refineFields;
  }

}

