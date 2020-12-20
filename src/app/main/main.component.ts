import { Component, OnInit } from '@angular/core';
import {StravaService} from "../strava.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private strava: StravaService
    , private route : Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.strava.logout();
    // TODO tidy
    this.route.navigateByUrl('/');
  }
}
