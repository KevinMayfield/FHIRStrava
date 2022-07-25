import {DataSource} from "@angular/cdk/table";
import {BehaviorSubject, Observable} from "rxjs";


export class PatientDataSource extends DataSource<any> {
  constructor(
              public patients: fhir4.Patient[],
              public patientObservable : Observable<fhir4.Patient[]>,
              public useObservable: boolean = false
  ) {
    super();

  }

  private dataStore: {
    patients: fhir4.Patient[]
  };

  connect(): Observable<fhir4.Patient[]> {

    //
 //   console.log('calling data service');
    if (this.useObservable) {
   //   console.log('Patient Observable ');
      return this.patientObservable;
    }


    let _patients : BehaviorSubject<fhir4.Patient[]> =<BehaviorSubject<fhir4.Patient[]>>new BehaviorSubject([]);

    this.dataStore = { patients: [] };

    if (this.patients != []) {
      for (let patient of this.patients) {
        this.dataStore.patients.push(<fhir4.Patient> patient);
      }
      _patients.next(Object.assign({}, this.dataStore).patients);
    }

   return _patients.asObservable();
  }

  disconnect() {}
}
