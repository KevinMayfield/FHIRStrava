import { Component, OnInit } from '@angular/core';
import {StravaService} from "../services/strava.service";
import {Router} from "@angular/router";
import {WithingsService} from "../services/withings.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private strava: StravaService,
    private withings: WithingsService,
    private route : Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.strava.logout();
    this.withings.logout()
    // TODO tidy
    this.route.navigateByUrl('/');
  }
}
