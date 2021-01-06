import {EventEmitter, Injectable} from '@angular/core';
import {Moment} from "moment";
import {Charts} from "../models/charts";
// @ts-ignore
import Flag = fhir.Flag;

@Injectable({
  providedIn: 'root'
})
export class PhrService {

  serviceUrl = 'https://srv.mayfield-is.co.uk';
  //serviceUrl = 'http://localhost:8187';

  alerts : Flag[] = [];

  charts : Charts[] = [
    {
      "unit": "Kg",
      "name": "Weight",
      "chart": []
    },
    {
      "unit": "%",
      "name": "Body Composition",
      "chart": []
    },
    {
      "unit": "m/s",
      "name": "Pulse Wave Velocity",
      "chart": []
    },
    {
      "unit": "score",
      "name": "Sleep Score",
      "chart": []
    },
    {
      "unit": "mmHg",
      "name": "Blood Pressure",
      "chart": []
    },
    {
      "unit": "h",
      "name": "Sleep Duration",
      "chart": []
    },
    {
      "unit": "h",
      "name": "Sleep Composition",
      "chart": []
    },
    {
      "unit": "SDNN",
      "name": "HRV",
      "chart": [
      ]
    },
    {
      "unit": "points",
      name: "Recovery",
      "chart": []
    },
    {
      "unit": "mL/(kg·min)",
      name: "VO2 Max",
      "chart": []
    },
    {
      "unit": "%",
      "name": "SPO2",
      "chart": []
    },
    {
      "unit": "ratio",
      name: "Perfusion Index",
      "chart": []
    },
    {
      "unit": "C",
      "name": "Body Temperature",
      "chart": []
    }
  ];




  bars : Charts[] = [
    {
      "unit": "kJ",
      "name": "Energy",
      "chart": [
      ]
    },
    {
      "unit": "Score",
      "name": "Suffer",
      "chart": [
      ]
    },
    {
      "unit": "hour",
      "name": "Intensity (Power)",
      "chart": []
    },
    {
      "unit": "hour",
      "name": "Intensity (HR)",
      "chart": []
    }
  ];


  constructor() {
    this.to = new Date();
    this.from = new Date();
    this.from.setDate(this.to.getDate() - this.duration);
  }

  private from : Date = undefined;

  private to : Date = undefined;

  dateRangeChange: EventEmitter<any> = new EventEmitter();

  private duration = 28;

  maxhr = 175;

  getDuration() {
    return this.duration;
  }

  getFromDate() : Date {
    return this.from;

 /*   var date = new Date();
    date.setDate(date.getDate() - 99);
    return date;*/
  }
  getToDate() {
    return this.to;
  }
  setToDate(date : Moment, ) {
    this.to = date.toDate();
    console.log('PHR End date - ' + this.to.toISOString());
    this.from = date.toDate();
    this.setFromDuration();

  }
  setFromDuration(duration? : number) {

    if (duration != undefined) this.duration = duration;
    console.log('PHR duraton = ' + this.duration);
    this.from = new Date(this.to);
    this.from.setDate(this.to.getDate() - this.duration);
    this.dateRangeChange.emit(this.from.toISOString());
  }

}
