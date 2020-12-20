import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject, Observable} from 'rxjs';
import {SummaryActivity} from "./models/summary-activity";



export class ActivityDataSource extends DataSource<any> {
  constructor(
              public contains: SummaryActivity[]
  ) {
    super();
  }

  private dataStore: {
    contains: SummaryActivity[]
  };

  connect(): Observable<SummaryActivity[]> {

  //  console.log('contains DataSource connect '+this.patientId);

    const _contains: BehaviorSubject<SummaryActivity[]> =<BehaviorSubject<SummaryActivity[]>>new BehaviorSubject([]);

    this.dataStore = { contains: [] };


   // console.log(this.contains);
    if (this.contains !== [] && this.contains != undefined) {
      for (const activity of this.contains) {
        this.dataStore.contains.push(<SummaryActivity> activity);
      }
      _contains.next(Object.assign({}, this.dataStore).contains);
    }
   return _contains.asObservable();
  }

  disconnect() {}
}
