import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PhrService} from "./phr.service";
import {FhirService} from "./fhir.service";

@Injectable({
  providedIn: 'root'
})
export class IhealthService {

  /// Web https://developer.ihealthlabs.eu/index.htm

  clientId = '5b2b8d7fb66744c8951be697f34a4948';
  clientSecret = '8bf97e5cbd1f406dbbe6a0848d2f1974';
  //clientId = 'c4ffde29e84b4deca55dcdfc5f803983';

  //clientSecret = '25be0a575d7a4339a7bfc57da7f3c85d';
  tokenChange: EventEmitter<any> = new EventEmitter();


  iHealthChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService,
              ) { }

  authorise(routeUrl: string) {
    if (routeUrl.substring(routeUrl.length - 1,1) === '/') {
      routeUrl = routeUrl.substring(0, routeUrl.length - 1);
    }

    localStorage.setItem('appRoute', routeUrl);
    window.location.href = 'https://oauthuser.ihealthlabs.eu/OpenApiV2/OAuthv2/userauthorization'
      + '?response_type=code'
      + '&client_id=' +this.clientId
      + '&redirect_uri=' +routeUrl+'\ihealth'
      + '&APIName=OpenApiSpO2';

  }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'text/html');
    return headers;
  }

  public postCSVFile(body : any) {

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();


    return this.http.post<any>(this.phr.serviceUrl+ '/services/ihealth', body, { 'headers' : headers} ).subscribe(result => {
      this.iHealthChange.emit(result);
    });

  }

}
