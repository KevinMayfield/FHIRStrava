/// <reference path="../../../../node_modules/@types/fhir/index.d.ts" />

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {Observable, Subject, of, throwError, EMPTY} from 'rxjs';



import {
  catchError,
  debounceTime, distinctUntilChanged, map, switchMap
} from 'rxjs/operators';


import {HttpErrorResponse} from '@angular/common/http';

import {NEVER} from "rxjs/internal/observable/never";
import {FhirService} from "../../services/fhir.service";
import {Router} from "@angular/router";



@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: [ './patient-search.component.css' ]
})
export class PatientSearchComponent implements OnInit,AfterViewInit {


  patients$: Observable<fhir4.Patient[]>;
  private searchTerms = new Subject<string>();

  @Output() patientSelected : EventEmitter<fhir4.Patient> = new EventEmitter();

  @Input() serverName: string;

  constructor( private fhirService: FhirService, private router: Router

  ) {}


  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  createObservable(i) {
    return new Observable();
  }


  ngOnInit(): void {

    this.patients$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => {
         return this.fhirService.searchPatients('EMIS',term)
        }

      ),

      map(bundle => {
        var pat$: fhir4.Patient[] = [];
        var i;
        if (bundle !== undefined && bundle.hasOwnProperty("entry")) {
          // @ts-ignore
          for (i = 0; i < bundle.entry.length && i < 10; i++) {
            // @ts-ignore
            pat$[i] = <fhir.Patient>bundle.entry[i].resource;
          }
        }
        return pat$;}
        )
    ),
      catchError((err, caught) => {
      console.log(err);
      return EMPTY;
    });

  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.log('patient search ERROR');

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  selectPatient(patient: fhir4.Patient) {

    this.patientSelected.emit(patient);
    if (patient !== undefined) {
      this.router.navigateByUrl('patient/' + patient.id  );

    }
  }



  logError(title: string) {
      return (message :any) => {
        if(message instanceof HttpErrorResponse) {
          if (message.status == 401) {
            //this.authService.logout();
            //this.messageService.add(title + ": 401 Unauthorised");
          }
          if (message.status == 403) {
            //this.messageService.add(title + ": 403 Forbidden (insufficient scope)");
          }
        }
        console.log("Patient Search error handling "+message);

        return NEVER;

    }
  }

  ngAfterViewInit(): void {

  }
}
