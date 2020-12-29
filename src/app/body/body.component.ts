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
import {IhealthComponent} from "../ihealth/ihealth.component";
import {IhealthService} from "../services/ihealth.service";

import {HrvService} from "../services/hrv.service";

// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Bundle = fhir.Bundle;
import {PhrService} from "../services/phr.service";
import {FhirService} from "../services/fhir.service";


@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(private strava: StravaService,
              private withings: WithingsService,
              private hrv: HrvService,
              private ihealth: IhealthService,
              private phr: PhrService,
              private _loadingService: TdLoadingService,
              private fhirService : FhirService) {

  }

  weight = true;
  pwv = false;
  overlayStarSyntax: boolean = false;


  athlete: Athlete;

  stravaConnect = true;

  stravaComplete = false;

  datepipe: DatePipe = new DatePipe('en-GB')

  charts: any[];
  hrvcharts: any[];
  ihealthcharts: any[];
  bars: any[];

  activityDisplayedColumns = ['link', 'start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_cadence', 'average_heartrate', 'weighted_average_watts', 'kilojoules', 'suffer_score', 'intensity'];

  activities: SummaryActivity[] = [];

  measures: MeasureGroups[] = [];

  showMeasures = false;

  obs: Obs[] = [];

  activityDataSource: MatTableDataSource<SummaryActivity>;
  activityMap = new Map();

  tabValue: string = 'strava';


  intensityRange = {
    "tough": 95,
    "medium": 80,
    "low": 65
  };
  sufferRange = {
    "tough": 400,
    "medium": 200,
    "low": 50
  };
  enerygRange = {
    "tough": 1500,
    "medium": 1000,
    "low": 600
  }

  @ViewChild(MatSort) sort: MatSort;

  sleepscore = false;
  bp = false;


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


    this.obs = [];
    // this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

    this.activities = [];
    this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);

    this.ihealth.tokenChange.subscribe(
      token => {
        this.showMeasures = true;

      }
    )
    this.withings.tokenChange.subscribe(
      token => {
        this.showMeasures = true;
        this.getWithingsObservations();
        this.getWithingsWorkouts();
        this.getWithingsSleep();

      }
    )
    this.strava.tokenChange.subscribe(
      token => {
        if (token != undefined) this.stravaConnect = false;
        this.stravaLoad();
      }
    );
    this.hrv.hrvChange.subscribe(result => {
      this.processHRVObs(result);
      this.fhirService.prepareTransaction(result);
    })

    this.ihealth.iHealthChange.subscribe(result => {
      this.processIHealthObs(result);
      this.fhirService.prepareTransaction(result);
    })

    this.strava.connect();
    this.withings.connect();
  }

  stravaLoad() {


    this.getAthlete();
    this.stravaComplete = false;
    this._loadingService.register('overlayStarSyntax');
    this.getActivities()
  }


  pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  hhmm(num) {
    var min = Math.round(num / 60);
    var mins = this.pad(Math.round((min % 60)), 2)
    return Math.trunc(min / 60) + ':' + mins.substring(0, 2);
  }

  ratio(kj, suffer) {
    if (kj != +kj) return '';
    if (suffer != +suffer) return '';
    var ratio = +(kj / suffer);
    ratio = Math.round(ratio * 10) / 10;
    return ratio;
  }

  isNum(val) {
    return (val === +val);
  }


  intensity(pwr) {
    if (pwr != +pwr) return '';
    if (this.athlete.ftp == undefined) return '';

    return Math.round((pwr / this.athlete.ftp) * 100);
  }

  connectStrava() {

    this.athlete = undefined;
    this.activities = undefined;

    this.strava.authorise(window.location.href);
  }


  getAthlete() {

    this.strava.getAthlete().subscribe(
      result => {
        this.athlete = result;
        this.strava.setAthlete(result);

      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.stravaConnect = true;
        }
      }
    );

  }

  getActivities(page?) {
    this.strava.getActivities(page).subscribe(
      result => {
        if (page == undefined) page = 0;
        page++;
        this.processStravaObs(result);
        if (result.length > 0) {
          this.getActivities(page)
        } else {
          this.stravaComplete = true;
          this._loadingService.resolve('overlayStarSyntax');
          this.activityDataSource.data = this.activities;
          this.processGraph();

        }
        ;
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.stravaConnect = true;
        }
      }
    );
  }

  processStravaObs(result) {
    for (const activity of result) {
      var date = new Date(activity.start_date).toISOString();
      activity.intensity = this.intensity(activity.weighted_average_watts);
      if (this.activityMap.get(activity.id) == undefined) {
        this.activityMap.set(activity.id, activity);
        this.activities.push(activity);

        var obs: Obs = {
          'obsDate': new Date(date),
          'name': activity.name,
          'suffer': activity.suffer_score,
          'energy': activity.kilojoules,
          'average_heartrate': activity.average_heartrate,
          'weighted_average_watts': activity.weighted_average_watts,
          'distance': activity.distance / 1000,
          'duration': Math.round(activity.moving_time),
          'intensity': activity.intensity
        }
        this.obs.push(obs);
      } else {
        console.log('Duplicate Id = ' + this.activityMap.get(activity.id))
      }
    }
  }

  round(num) {
    return Math.round(num);
  }

  getWithingsSleep() {
    this.withings.getSleep().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }
        if (result.status == 403) {
          console.log('Withings 403 - Need to ask for permission');

        }
        this.processWithingsSleep(result);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }


  getWithingsObservations() {
    this.withings.getMeasures().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }
        this.measures = result.body.measuregrps;

        this.processWithingsObs();
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }
  getWithingsWorkouts() {
    this.withings.getWorkouts().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }
        this.processWithingsWorkout(result);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }

  processWithingsWorkout(activityData) {

    for (const activity of activityData.body.series) {
      var obs: Obs = {
        'obsDate': new Date(activity.date)
      }
      if (activity.data.manual_calories != undefined && activity.data.manual_calories > 0) {
        obs.calories =activity.data.manual_calories;
      }
      if (activity.data.duration != undefined) {
        obs.duration =activity.data.duration;
        console.log(obs.duration);
      }
      if (activity.data.effduration != undefined) {
        obs.duration =activity.data.effduration;
      }
      if (activity.data.steps != undefined) {
        obs.steps =activity.data.steps;
        obs.name = activity.data.steps + ' steps';
      }
      if (activity.data.distance != undefined) {
        obs.distance =activity.data.distance / 1000;
      }
      if (obs.name === undefined) {

      }
      // Should not be necessary as date range should prevent it
      if (obs.obsDate > this.phr.getLowerDate()) this.obs.push(obs);
    }
  }
  processWithingsSleep(sleepData) {
    for (const sleep of sleepData.body.series) {
      var obs: Obs = {
        'obsDate': new Date(sleep.date)
      }
      if (sleep.data.durationtosleep != undefined) {
        obs.durationtosleep = sleep.data.durationtosleep;
      }
      if (sleep.data.deepsleepduration != undefined) {
        obs.deepsleepduration = sleep.data.deepsleepduration;
      }
      if (sleep.data.breathing_disturbances_intensity != undefined) {
        obs.breathing_disturbances_intensity = sleep.data.breathing_disturbances_intensity;
      }
      if (sleep.data.wakeupcount != undefined) {
        obs.wakeupcount = sleep.data.wakeupcount;
      }
      if (sleep.data.sleep_score != undefined) {
        obs.sleep_score = sleep.data.sleep_score;
      }
      if (sleep.data.remsleepduration != undefined) {
        obs.remsleepduration = sleep.data.remsleepduration;
      }
      if (sleep.data.lightsleepduration != undefined) {
        obs.lightsleepduration = sleep.data.lightsleepduration;
      }
      this.obs.push(obs);
    }
  }

  processWithingsObs() {

    for (const grp of this.measures) {
      var date = new Date(+grp.date * 1000).toISOString();

      var obs: Obs = {
        'obsDate': new Date(date)
      }
      // console.log(obs);
      for (const measure of grp.measures) {
        switch (measure.type) {
          case 1:
            obs.weight = +measure.value / 1000;
            break;
          case 76:
            obs.muscle_mass = +measure.value / 100;
            break;
          case 5 :
            // free fat mass
            break;
          case 8:
            obs.fat_mass = +measure.value / 100;
            break;
          case 77:
            obs.hydration = +measure.value / 100;
            break;
          case 91:
            obs.pwv = +measure.value / 1000;
            break;
          case 9 :
            obs.diastolic = +measure.value / 1000;
            break;
          case 10 :
            obs.systolic = +measure.value / 1000;
            break;
        }
      }

      this.obs.push(obs);
    }


  }


  openStrava(id) {

    window.open(
      'https://www.strava.com/activities/' + id,
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  openPowerCC(id) {

    window.open(
      'https://power-meter.cc/activities/' + id + '/power-analysis',
      '_blank' // <- This is what makes it open in a new window.
    )
  }

  processGraph() {

    var charts = [
      {
        "unit": "Kg",
        "name": "Weight",
        "chart": [

          {
            "name": "Weight",
            "series": []
          }]
      },
      {
        "unit": "kJ",
        name: "Energy",
        "chart": [{
          name: "Energy",
          series: []
        }]
      },
      {
        "unit": "m/s",
        "name": "Pulse Wave Velocity",
        "chart": [{
          "name": "Pulse Wave Velocity",
          "series": []
        }]
      },
      {
        "unit": "Kg",
        "name": "Hydration",
        "chart": [{
          "name": "Hydration",
          "series": []
        }]
      },
      {
        "unit": "Kg",
        "name": "Muscle Mass",
        "chart": [

          {
            "name": "Muscle Mass",
            "series": []
          }]
      },
      {
        "unit": "Kg",
        "name": "Fat Mass",
        "chart": [

          {
            "name": "Fat Mass",
            "series": []
          }]
      },
      {
        "unit": "score",
        "name": "Sleep Score",
        "chart": [

          {
            "name": "Sleep Score",
            "series": []
          }]
      },
      {
        "unit": "mmHg",
        "name": "Blood Pressure",
        "chart": [
          {
            "name": "Systolic Blood Pressure",
            "series": []
          },
          {
            "name": "Diastolic Blood Pressure",
            "series": []
          }
        ]
      }
    ];

    var bars = [
      {
        "unit": "kJ",
        "name": "Energy and Duration",
        "chart": [
          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }
        ]
      },
      {
        "unit": "Score",
        "name": "Suffer and Duration",
        "chart": [
          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }]
      },
      {
        "unit": "time",
        "name": "Duration and Intensity",
        "chart": [

          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }]
      }
    ];


    for (const obs of this.obs) {
      if (obs.weight != undefined) {
        charts[0].chart[0].series.push({
          name: obs.obsDate,
          value: obs.weight
        })
      }
      /*
            if (obs.energy != undefined ) {
              charts[1].chart[0].series.push({
                name : obs.obsDate,
                value : obs.energy
              })
            }*/
      if (obs.pwv != undefined) {
        charts[2].chart[0].series.push({
          name: obs.obsDate,
          value: obs.pwv
        })
      }

      if (obs.hydration != undefined) {
        charts[3].chart[0].series.push({
          name: obs.obsDate,
          value: obs.hydration
        })
      }
      if (obs.muscle_mass != undefined) {
        charts[4].chart[0].series.push({
          name: obs.obsDate,
          value: obs.muscle_mass
        })
      }
      if (obs.fat_mass != undefined) {
        charts[5].chart[0].series.push({
          name: obs.obsDate,
          value: obs.fat_mass
        })
      }
      if (obs.sleep_score != undefined) {
        charts[6].chart[0].series.push({
          name: obs.obsDate,
          value: obs.sleep_score
        })
      }
      if (obs.diastolic != undefined && obs.systolic != undefined) {
        charts[7].chart[1].series.push({
          name: obs.obsDate,
          value: obs.diastolic
        });
        charts[7].chart[0].series.push({
          name: obs.obsDate,
          value: obs.systolic
        });
      }
      var chartNum = 0;
      if (obs.energy != undefined && obs.duration != undefined) {
        var energy = obs.energy / (obs.duration/ 600);
        if (energy < 80) {
          chartNum = 0;
        } else if (energy < 110) {
          chartNum = 1;
        } else if (energy < 130) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[0].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: obs.energy,
          r: energy
        })
      }
      if (obs.suffer != undefined && obs.duration != undefined) {
        var suffer = obs.suffer / (obs.duration/600);
        if (suffer < 10) {
          chartNum = 0;
        } else if (suffer < 20) {
          chartNum = 1;
        } else if (suffer < 30) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[1].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: obs.suffer,
          r: suffer
        })
      }
      if (obs.intensity != undefined && this.isNum(obs.intensity) && obs.duration != undefined) {

        if (obs.intensity < this.intensityRange.low) {
          chartNum = 0;
        } else if (obs.intensity < this.intensityRange.medium) {
          chartNum = 1;
        } else if (obs.intensity < this.intensityRange.tough) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[2].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: obs.duration * 10,
          r: obs.intensity
        });
      }
    }

    this.charts = [];
    for (const chart of charts) {
      if (chart.chart.length > 0) {
        this.charts.push(chart);
      }
    }
    this.bars = [];
    for (const bar of bars) {
      if (bar.chart.length > 0) {
        this.bars.push(bar);
      }
    }
  }

  togglePWV() {
    this.pwv = !this.pwv;
  }

  toggleWeight() {
    this.weight = !this.weight;
  }

  toggleSleep() {
    this.sleepscore = !this.sleepscore;
  }

  toggleBP() {
    this.bp = !this.bp;
  }


  toggle(chart: any) {
    if (chart.ticked == undefined) chart.ticked = false;
    chart.ticked = !chart.ticked;

  }


  processHRVObs(bundle: Bundle) {
    var lastUpdate = this.phr.getLowerDate();
    var process = false;
    for (const entry of bundle.entry) {
      process = true;
      const fhirobs: Observation = entry.resource;
      var datetime = new Date(fhirobs.effectiveDateTime);
      if (datetime > lastUpdate) {
        //  console.log(fhirobs);
        var obs: Obs = {
          obsDate: datetime
        }

        if (fhirobs.code.coding[0].code === "8867-4") {
          obs.sdnn = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "60842-2") {
          obs.vo2max = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "Recovery_Points") {
          obs.recoverypoints = fhirobs.valueQuantity.value;
        }
        this.obs.push(obs);
      }
    }
    this.processHRVGraph();
  }

  processIHealthObs(bundle: Bundle) {
    var lastUpdate = this.phr.getLowerDate();
    var process = false;
    for (const entry of bundle.entry) {
      process = true;
      const fhirobs: Observation = entry.resource;
      var datetime = new Date(fhirobs.effectiveDateTime);
      if (datetime > lastUpdate) {
        //  console.log(fhirobs);
        var obs: Obs = {
          obsDate: datetime
        }

        if (fhirobs.code.coding[0].code === "73794-0") {
          obs.pi = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "103228002") {
          obs.spo2 = fhirobs.valueQuantity.value;
        }
        this.obs.push(obs);
      }
    }
    this.processIHealthGraph();
  }

  processHRVGraph() {

    var charts = [
      {
        "unit": "SDNN",
        "name": "HRV",
        "chart": [

          {
            "name": "SDNN",
            "series": []
          }]
      },
      {
        "unit": "points",
        name: "Recovery",
        "chart": [{
          name: "Recovery",
          series: []
        }]
      },
      {
        "unit": "mL/(kg·min)",
        name: "VO2 Max",
        "chart": [{
          name: "Recovery",
          series: []
        }]
      },

    ];


    for (const obs of this.obs) {
      if (obs.sdnn != undefined) {
        charts[0].chart[0].series.push({
          name: obs.obsDate,
          value: obs.sdnn
        })
      }
      if (obs.recoverypoints != undefined) {
        charts[1].chart[0].series.push({
          name: obs.obsDate,
          value: obs.recoverypoints
        })
      }
      if (obs.vo2max != undefined) {
        charts[2].chart[0].series.push({
          name: obs.obsDate,
          value: obs.vo2max
        })
      }
    }

    this.hrvcharts = [];
    for (const chart of charts) {
      if (chart.chart.length > 0) {
        this.hrvcharts.push(chart);
      }
    }
  }

  processIHealthGraph() {

    var charts = [
      {
        "unit": "%",
        "name": "SPO2",
        "chart": [

          {
            "name": "SPO2",
            "series": []
          }]
      },
      {
        "unit": "ratio",
        name: "Perfusion Index",
        "chart": [{
          name: "Perfusion Index",
          series: []
        }]
      }

    ];


    for (const obs of this.obs) {
      if (obs.spo2 != undefined) {
        charts[0].chart[0].series.push({
          name: obs.obsDate,
          value: obs.spo2
        })
      }
      if (obs.pi != undefined) {
        charts[1].chart[0].series.push({
          name: obs.obsDate,
          value: obs.pi
        })
      }

      this.ihealthcharts = [];
      for (const chart of charts) {
        if (chart.chart.length > 0) {
          this.ihealthcharts.push(chart);
        }
      }
    }
  }
}
