import {Component, OnInit, ViewChild} from '@angular/core';
import {StravaService} from "../strava.service";
import {Athlete} from "../models/athlete";
import {SummaryActivity} from "../models/summary-activity";
import {ActivityDataSource} from "../activity-data-source";
import {DatePipe} from "@angular/common";
import {WithingsService} from "../withings.service";
import {MeasureGroups} from "../models/measure-groups";
import {Obs} from "../models/obs";

import {MatSort, MatSortable} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";


@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(private strava: StravaService,
              private withings: WithingsService) {

  }


  athlete : Athlete;

  connect = true;

  withingsConnect = true;



  datepipe: DatePipe = new DatePipe('en-GB')

  activityDisplayedColumns = ['link', 'date', 'type', 'name',  'powerlink',  'distance','duration', 'average_heartrate','weighted_average_watts','energy', 'suffer'];

  observationDisplayedColumns = ['obsDate', 'weight', 'muscle','fat', 'hydration', 'pwv', 'energy', 'suffer' ];

  activities : SummaryActivity[] = [];

  measures : MeasureGroups[] = [];

  obs: Obs[] = [];

  obsDataSource: MatTableDataSource<Obs>;

  activityDataSource: MatTableDataSource<SummaryActivity>;

  tabValue: string = 'strava';

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {

    if (localStorage.getItem('accessToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('accessToken'));
       if (token != undefined) {
         this.strava.accesToken = token.access_token;

       }
    }

    if (localStorage.getItem('withingsToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('withingsToken'));
      if (token != undefined) {
        this.withings.accesToken = token.access_token;
      }
    }

    this.obs = [];
    this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

    this.activities = [];
    this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);

    if (this.withings.accesToken != undefined) {
      this.withingsConnect = false;
        this.getObservations();
    }

    if (this.strava.accesToken != undefined) {
      this.connect = false;

      this.getAthlete();
      this.getActivities()
    }
  }

  sortIt() {

    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      this.obsDataSource.sort = this.sort;
    }
  }


  pad(num:number, size:number): string {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
  hhmm(num) {
    var min = Math.round(num/60);
    var mins = this.pad(Math.round((min%60) ),2)
    return Math.trunc(min/60) + ':' + mins.substring(0,2);
  }
  connectStrava() {

    this.athlete = undefined;
    this.activities = undefined;

    this.strava.authorise(window.location.href);
  }

  connectWithings() {
    this.withings.authorise(window.location.href);
  }

  openStrava(id) {

    window.open(
      'https://www.strava.com/activities/'+id,
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  openPowerCC(id) {

    window.open(
      'https://power-meter.cc/activities/'+id+'/power-analysis',
      '_blank' // <- This is what makes it open in a new window.
    )
  }

  getAthlete() {

    this.strava.getAthlete().subscribe(
      result => {
        this.athlete = result;

      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.connect = true;
        }
      }
    );

  }
  getActivities(page?) {
    this.strava.getActivities(page).subscribe(
      result => {
        if (page== undefined) page = 0;
        console.log(page);
        page++;
        this.processStravaObs(result);
        if (result.length > 0) this.getActivities(page);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.connect = true;
        }
      }
    );
  }

  processStravaObs(result) {
    for (const activity of result) {
      var date = new Date(activity.start_date).toISOString();
      this.activities.push(activity);

      var obs : Obs = {
        'obsDate' : new Date(date),
        'suffer' : activity.suffer_score,
        'energy' : activity.kilojoules,
        'average_heartrate' : activity.average_heartrate,
        'weighted_average_watts': activity.weighted_average_watts
      }
      this.obs.push(obs);
    }
    this.activityDataSource.data = this.activities;
    this.obsDataSource.data = this.obs;
    this.sortIt();
  }

  round(num) {
    return Math.round(num);
  }

  getObservations() {
    this.withings.getWeight().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');
          localStorage.removeItem('withingsToken');
        }
       this.measures = result.body.measuregrps;

        this.processObs();
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.withingsConnect = true;
        }
      }
    );
  }


  sorter(ev) {
    console.log(ev);
  }
  processObs() {

    for (const grp of this.measures) {
      var date = new Date(+grp.date * 1000).toISOString();

       var obs : Obs = {
          'obsDate' : new Date(date)
       }
       for (const measure of grp.measures) {
         switch (measure.type) {
           case 1:
             obs.weight = +measure.value / 1000;
             break;
           case 76:
             obs.muscle_mass =+measure.value / 1000;
             break;
           case 5:
             obs.fat_mass =+measure.value / 1000;
             break;
           case 77:
             obs.hydration =+measure.value / 1000;
             break;
           case 91:
             obs.pwv =+measure.value / 1000;
             break;
         }
       }

       this.obs.push(obs);
    }
    this.obsDataSource.data = this.obs;
    this.sortIt();
  }

}
