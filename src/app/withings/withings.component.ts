import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StravaService} from "../services/strava.service";
import {WithingsService} from "../services/withings.service";

@Component({
  selector: 'app-withings',
  templateUrl: './withings.component.html',
  styleUrls: ['./withings.component.scss']
})
export class WithingsComponent implements OnInit {



  constructor( private route: ActivatedRoute,
               private withings: WithingsService,
               private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      console.log(params);
      var code = params.get('code');
      var state = params.get('state');
      this.doSetup(code, state);
    });
  }

  doSetup(authorisationCode, state) {

    console.log(authorisationCode);
    this.withings.getAccessToken(authorisationCode).subscribe(
      token => {
        console.log(token);
        localStorage.setItem('withingsToken', JSON.stringify(token));
        this.withings.accesToken = token.access_token;
        this.router.navigateByUrl('/');
      }
    );
  }

}
