import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Bib, Bibs, Refinements, RefineField } from '../models/bib';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { BibsService } from '../services/bibs.service';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

export class RefineTableDataSource implements DataSource<Bib> {

  private _setId: string;

  /* Subjects and Observables */
  private bibsSubject = new BehaviorSubject<Bib[]>([]);
  private _refinements: Refinements = <Refinements>{};
  private refinementsSubject = new BehaviorSubject<Refinements>(this._refinements);
  public  refinements = this.refinementsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public  isLoading = this.loadingSubject.asObservable();
  private recordCountSubject = new BehaviorSubject<number>(0);
  public  recordCount = this.recordCountSubject.asObservable();

  constructor(private bibsService: BibsService, private configService: ConfigService) {}

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
    let mmsIds = await this.bibsService.getMmsIdsFromSet(setId, pageIndex, pageSize);
    this.bibsService.getBibs(mmsIds)
      .pipe(
        catchError(() => of (<Bibs>{})), 
        finalize(()=>this.loadingSubject.next(false))
      )
      .subscribe(bibs=>{ 
        this.loadRefinements(bibs.bib); 
        this.recordCountSubject.next(bibs.total_record_count), 
        this.bibsSubject.next(bibs.bib)
      });
  }

  async loadRefinements( bibs: Bib[] ) {
    // TODO: Don't override if already retrieved?
    bibs.forEach(bib=>this._refinements[bib.mms_id]=this.extractRefineFields(bib.anies, this.configService.selectedRefineService.fields))
    this.refinementsSubject.next(this._refinements);
    // now retrieve options from refinement service
    // show "loading" in UI while refinement service is working
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
      let datafields = this.xpath(doc, `/record/datafield[${xpath.join(' or ')}]`);
      let datafield, subfield: Node;
      while (datafield=datafields.iterateNext()) {
        let subfields = this.xpath(doc, `subfield[@code="${subfieldCode}"]`, datafield);
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

  private xpath(doc: Document, expression: string, context: Node = null ) {
    return doc.evaluate(expression, context || doc, null, XPathResult.ANY_TYPE, null);  
  }
}
