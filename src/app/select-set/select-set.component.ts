import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { switchMap, debounceTime, tap, finalize, startWith } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { Set, Sets } from '../models/set';

@Component({
  selector: 'app-select-set',
  templateUrl: './select-set.component.html',
  styleUrls: ['./select-set.component.css']
})
export class SelectSetComponent implements OnInit {
  @Output() setSelected = new EventEmitter();
  formControl = new FormControl();
  filteredOptions: Sets = <Sets>{};
  isLoading = false;

  constructor( private configService: ConfigService) { }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.configService.searchSets(value)
          .pipe( finalize(() => this.isLoading = false) )
        )  
      ).subscribe( sets => this.filteredOptions = sets);
  }

  displayFn(set?: Set): string | undefined {
    return set ? set.name : undefined;
  }
}
