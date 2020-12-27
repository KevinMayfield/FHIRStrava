import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhrService {

  constructor() { }

  getLowerDate() : Date {
    var date = new Date();
    date.setDate(date.getDate() - 99);
    return date;
  }
}
