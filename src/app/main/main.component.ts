import { Component, OnInit } from '@angular/core';
import {StravaService} from "../services/strava.service";
import {Router} from "@angular/router";
import {WithingsService} from "../services/withings.service";
import {IhealthService} from "../services/ihealth.service";
import {HrvService} from "../services/hrv.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private strava: StravaService,
    private withings: WithingsService,
              private hrv : HrvService,
              private ihealth: IhealthService,
    private route : Router) { }

  files: File | FileList;

  withingsConnect = true;

  ihealthConnect = true;
  name: string = 'My PHR';

  ngOnInit(): void {

    this.withings.tokenChange.subscribe(
      token => {
        if (token != undefined) this.withingsConnect = false;
      }
    );
    this.ihealth.tokenChange.subscribe(
      token => {
        if (token != undefined) this.ihealthConnect = false;
      }
    );
    this.strava.athleteChange.subscribe(
      athlete  => {
        console.log(athlete);
        var name = '';
        if (athlete.firstname != undefined) {
          name = athlete.firstname + ' ';
        }
        if (athlete.lastname != undefined) {
          name += athlete.lastname;
        }
        this.name = name;
      }
    );
  }

  logout() {
    this.strava.logout();
    this.withings.logout()
    // TODO tidy
    this.route.navigateByUrl('/');
  }
  connectWithings() {
    this.withings.authorise(window.location.href);
  }

  connectIHealth() {
    this.ihealth.authorise(window.location.href);
  }


  selectEvent(files: FileList | File): void {
    if (files instanceof FileList) {
      console.log('Files '+ files);
    } else if (files instanceof File) {

      var file : File = files;
      //  console.log('file ' +  file);
      this.hrv.postCSVFile(file);
    }
  };

  selectSPO2Event(files: File | FileList) {
    if (files instanceof FileList) {
      console.log('Files '+ files);
    } else if (files instanceof File) {

      var file : File = files;
      //  console.log('file ' +  file);
      this.ihealth.postCSVFile(file);
    }
  }
}
