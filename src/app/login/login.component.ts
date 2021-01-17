import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  //https://medium.com/better-programming/create-a-fully-functioning-user-authentication-with-aws-cognito-and-amplify-with-angular-complete-a3ce58df1b74

  //https://console.developers.google.com/apis/credentials?project=watchful-augury-234308&folder=&organizationId=

  constructor(private route: ActivatedRoute,
              private auth : AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      var code = params.get('code');
      var state = params.get('state');
      this.doSetup(code, state);
    });
  }

  doSetup(authorisationCode, state) {

    this.auth.tokenChange.subscribe(
      token => {
        this.router.navigateByUrl('/');
      }
    );
    this.auth.getOAuth2AccessToken(authorisationCode);
  }

  pushTheButton() {
    console.log('push the button');
  }
  async federatedSignIn(option) {
    console.log('federatedSignIn');
    const socialResult =
      await this.auth.googleSocialSignIn();
    console.log('google Result:', socialResult);
  }
}
