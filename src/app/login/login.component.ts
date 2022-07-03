import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import { Amplify, Auth, Hub } from 'aws-amplify';
import {AuthenticatorService} from "@aws-amplify/ui-angular";

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
              private awsService : AuthenticatorService,
              private router: Router) { }



  go() {
    this.router.navigateByUrl('/');
  }
  ngOnInit(): void {

    Hub.listen("auth",({ payload: { event, data } }) => {
      console.log(event);
      console.log(data);
      switch (event) {
        case "signIn":
          this.router.navigateByUrl('/');
          break;
      }
    });

    Auth.currentAuthenticatedUser().then(
      data => {
        this.auth.getOAuth2AccessToken();
        this.auth.isLoggedIn = true;
        this.router.navigateByUrl('/');
      }
    );

  }
}
