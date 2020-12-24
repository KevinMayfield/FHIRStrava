import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {StravaService} from "../services/strava.service";
import {Athlete} from "../models/athlete";
import {SummaryActivity} from "../models/summary-activity";
import {DatePipe} from "@angular/common";
import {WithingsService} from "../services/withings.service";
import {MeasureGroups} from "../models/measure-groups";
import {Obs} from "../models/obs";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {TdLoadingService} from "@covalent/core/loading";


@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(private strava: StravaService,
              private withings: WithingsService,
              private _loadingService: TdLoadingService) {

  }
  overlayStarSyntax: boolean = false;

  athlete : Athlete;

  connect = true;

  withingsConnect = true;

  stravaComplete = false;

  datepipe: DatePipe = new DatePipe('en-GB')

  charts: any[];
  bars: any[];

  activityDisplayedColumns = ['link', 'start_date', 'type', 'name',  'powerlink',  'distance','moving_time','average_cadence', 'average_heartrate','weighted_average_watts','kilojoules', 'suffer_score', 'ratio'];

  activities : SummaryActivity[] = [];

  measures : MeasureGroups[] = [];

  obs: Obs[] = [];

  activityDataSource: MatTableDataSource<SummaryActivity>;
  activityMap = new Map();

  tabValue: string = 'strava';

  sufferRange = {
    "tough" : 400,
    "medium": 200,
    "low": 50
  };
  enerygRange = {
    "tough" : 1500,
    "medium": 1000,
    "low": 600
  }

  @ViewChild(MatSort) sort: MatSort;


  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      this.activityDataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  ngOnInit(): void {

    if (localStorage.getItem('stravaToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('stravaToken'));
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
   // this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

    this.activities = [];
    this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);


    if (this.withings.accesToken != undefined) {
      this.withingsConnect = false;
        this.getWithingsObservations();
    }

    if (this.strava.accesToken != undefined) {
      this.connect = false;

      this.getAthlete();
      this.stravaComplete=false;
      this._loadingService.register('overlayStarSyntax');
      this.getActivities()
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

  ratio(kj, suffer) {
     if (kj != + kj) return '';
    if (suffer != + suffer) return '';
     var ratio = +(kj/ suffer);
     ratio = Math.round(ratio*10) / 10;
     return ratio;
  }

  connectStrava() {

    this.athlete = undefined;
    this.activities = undefined;

    this.strava.authorise(window.location.href);
  }

  connectWithings() {
    this.withings.authorise(window.location.href);
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
        page++;
        this.processStravaObs(result);
        if (result.length > 0) { this.getActivities(page) }
        else {
          this.stravaComplete = true;
          this._loadingService.resolve('overlayStarSyntax');
          this.activityDataSource.data = this.activities;
          this.processGraph();

        };
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

      if (this.activityMap.get(activity.id) == undefined) {
        this.activityMap.set(activity.id,activity);
        this.activities.push(activity);

        var obs: Obs = {
          'obsDate': new Date(date),
          'name': activity.name,
          'suffer': activity.suffer_score,
          'energy': activity.kilojoules,
          'average_heartrate': activity.average_heartrate,
          'weighted_average_watts': activity.weighted_average_watts,
          'distance' :activity.distance / 1000,
          'duration': Math.round(activity.moving_time / 600)
        }

        this.obs.push(obs);
      } else {
        console.log('Duplicate Id = '+this.activityMap.get(activity.id))
      }
    }
  }

  round(num) {
    return Math.round(num);
  }

  getWithingsObservations() {
    this.withings.getWeight().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');
          localStorage.removeItem('withingsToken');
        }
       this.measures = result.body.measuregrps;

        this.processWithingsObs();
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.withingsConnect = true;
        }
      }
    );
  }

  processWithingsObs() {

    for (const grp of this.measures) {
      var date = new Date(+grp.date * 1000).toISOString();

       var obs : Obs = {
          'obsDate' : new Date(date)
       }
       // console.log(obs);
       for (const measure of grp.measures) {
         switch (measure.type) {
           case 1:
             obs.weight = +measure.value / 1000;
             break;
           case 76:
             obs.muscle_mass =+measure.value / 100;
             break;
           case 5 :
             // free fat mass
             break;
           case 8:
             obs.fat_mass =+measure.value / 100;
             break;
           case 77:
             obs.hydration =+measure.value / 100;
             break;
           case 91:
             obs.pwv =+measure.value / 1000;
             break;
         }
       }

       this.obs.push(obs);
    }


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

  processGraph(){

    var charts = [
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Weight",
            "series": []
          }]
      },
      {
        "name": "kJ",
        "chart": [{
          name: "Energy",
          series: []
        }]
      },
      {
        "name": "m/s",
        "chart": [{
          "name": "Pulse Wave Velocity",
          "series": [
          ]
        }]},
      {
        "name": "Kg",
        "chart": [{
          "name": "Hydration",
          "series": [
          ]
        }]},
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Muscle Mass",
            "series": []
          }]
      },
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Fat Mass",
            "series": []
          }]
      },
      {
        "name": "beats/min",
        "chart": [

          {
            "name": "Avg. Heart Rate",
            "series": []
          }]
      },
      {
        "name": "W",
        "chart": [

          {
            "name": "Average (Normalised) Power",
            "series": []
          }]
      },
    ];

    var bars = [
      {
        "name": "kJ",
        "chart": [{
          name: "Energy and Duration",
          series: [
          ]
        }]
      },
      {
        "name": "Score",
        "chart": [

          {
            "name": "Suffer and Duration",
            "series": []
          }]
      }
      ];


    for (const obs of this.obs) {
      if (obs.weight != undefined ) {
        charts[0].chart[0].series.push({
          name : obs.obsDate,
          value : obs.weight
        })
      }
/*
      if (obs.energy != undefined ) {
        charts[1].chart[0].series.push({
          name : obs.obsDate,
          value : obs.energy
        })
      }*/
      if (obs.pwv != undefined ) {
        charts[2].chart[0].series.push({
          name : obs.obsDate,
          value : obs.pwv
        })
      }

      if (obs.hydration != undefined ) {
        charts[3].chart[0].series.push({
          name : obs.obsDate,
          value : obs.hydration
        })
      }
      if (obs.muscle_mass != undefined ) {
        charts[4].chart[0].series.push({
          name : obs.obsDate,
          value : obs.muscle_mass
        })
      }
      if (obs.fat_mass != undefined ) {
        charts[5].chart[0].series.push({
          name : obs.obsDate,
          value : obs.fat_mass
        })
      }

      if (obs.energy != undefined && obs.duration != undefined ) {
        bars[0].chart[0].series.push({
          name : obs.name,
          x: obs.obsDate,
          y: obs.energy,
          r: obs.energy /obs.duration
        })
      }
      if (obs.suffer != undefined && obs.duration != undefined ) {
        bars[1].chart[0].series.push({
          name : obs.name,
          x: obs.obsDate,
          y: obs.suffer,
          r: obs.suffer /obs.duration
        })
      }
    }

    this.charts=[];
    for (const chart of charts) {
      if (chart.chart.length>0) {
        this.charts.push(chart);
      }
    }
    this.bars =[];
    for (const bar of bars) {
      if (bar.chart.length>0) {
        this.bars.push(bar);
      }
    }
  }

}
