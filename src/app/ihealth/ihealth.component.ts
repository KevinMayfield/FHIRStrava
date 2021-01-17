import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {WithingsService} from "../services/withings.service";
import {IhealthService} from "../services/ihealth.service";

@Component({
  selector: 'app-ihealth',
  templateUrl: './ihealth.component.html',
  styleUrls: ['./ihealth.component.scss']
})
export class IhealthComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private iHealth: IhealthService,
              private router: Router) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      var code = params.get('code');
      var state = params.get('state');
      this.doSetup(code, state);
    });
  }

  doSetup(authorisationCode, state) {

    this.iHealth.tokenChange.subscribe(
      token => {
        this.router.navigateByUrl('/');
      }
    );
    this.iHealth.getOAuth2AccessToken(authorisationCode);
  }

}
