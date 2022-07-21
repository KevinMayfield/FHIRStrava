import {Component, Input, OnInit} from '@angular/core';
import Reference = fhir.Reference;
import {FhirService} from "../../services/fhir.service";
import PractitionerRole = fhir.PractitionerRole;

@Component({
  selector: 'app-practitioner-role',
  templateUrl: './practitioner-role.component.html',
  styleUrls: ['./practitioner-role.component.scss']
})
export class PractitionerRoleComponent implements OnInit {

  @Input()
  practitionerRole : Reference

  @Input() serverName: string;

  role : PractitionerRole = undefined

  constructor(private fhir: FhirService) { }

  ngOnInit(): void {
    if (this.practitionerRole !== undefined) {
      this.fhir.getPractitionerRole(this.serverName,this.practitionerRole).subscribe(bundle => {
        this.role = this.fhir.extractPractitionerRole(bundle);
      })
    }
  }

}
