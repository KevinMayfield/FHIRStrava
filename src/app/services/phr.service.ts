import { Injectable } from '@angular/core';
import {Moment} from "moment";

@Injectable({
  providedIn: 'root'
})
export class PhrService {

  constructor() {
    this.to = new Date();
    this.from = new Date();
    this.from.setDate(this.from.getDate() - 99);
  }

  private from : Date = undefined;

  private to : Date = undefined;

  getFromDate() : Date {
    return this.from;

 /*   var date = new Date();
    date.setDate(date.getDate() - 99);
    return date;*/
  }
  getToDate() {
    return this.to;
  }
  setToDate(date : Moment) {
    this.to = date.toDate();
  }
  setFromDate(date : Moment) {
    this.from = date.toDate();
  }
}
