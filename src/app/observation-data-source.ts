import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject, Observable} from 'rxjs';
import {Obs} from "./models/obs";



export class ObservationDataSource extends DataSource<any> {
  constructor(
              public observations: Obs[]
  ) {
    super();
  }

  private dataStore: {
    observations: Obs[]
  };

  connect(): Observable<Obs[]> {

  //  console.log('observations DataSource connect '+this.patientId);

    const _observations: BehaviorSubject<Obs[]> =<BehaviorSubject<Obs[]>>new BehaviorSubject([]);

    this.dataStore = { observations: [] };


   // console.log(this.observations);
    if (this.observations !== [] && this.observations != undefined) {
      for (const questionnaire of this.observations) {
        this.dataStore.observations.push(<Obs> questionnaire);
      }
      _observations.next(Object.assign({}, this.dataStore).observations);
    }
   return _observations.asObservable();
  }

  disconnect() {}
}
