import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StravaService} from "../services/strava.service";

@Component({
  selector: 'app-exchange-token',
  templateUrl: './exchange-token.component.html',
  styleUrls: ['./exchange-token.component.scss']
})
export class ExchangeTokenComponent implements OnInit {

  constructor( private route: ActivatedRoute,
               private strava: StravaService,
               private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      console.log(params);
      var code = params.get('code');
      this.doSetup(code);
    });
  }

  doSetup(authorisationCode)  {

    console.log(authorisationCode);
    this.strava.getAccessToken(authorisationCode).subscribe(
      token => {

        localStorage.setItem('stravaToken', JSON.stringify(token));
        this.strava.accesToken = token.access_token;
        this.router.navigateByUrl('/');
      }
    );
  }

}
