import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private auth : AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.auth.signOut();

    this.router.navigateByUrl('/');
  }

}
