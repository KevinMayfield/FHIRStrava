import { Injectable } from '@angular/core';
import {Moment} from "moment";

@Injectable({
  providedIn: 'root'
})
export class PhrService {

  constructor() {
    this.to = new Date();
    this.from = new Date();
    this.from.setDate(this.to.getDate() - 92);
  }

  private from : Date = undefined;

  private to : Date = undefined;

  private duration = 92;

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
    console.log('PHR Start date - ' + this.from.toISOString());
  }

}
