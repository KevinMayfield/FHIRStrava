import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  //https://medium.com/better-programming/create-a-fully-functioning-user-authentication-with-aws-cognito-and-amplify-with-angular-complete-a3ce58df1b74

  //https://console.developers.google.com/apis/credentials?project=watchful-augury-234308&folder=&organizationId=

  constructor(private auth : AuthService) { }

  ngOnInit(): void {
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
