import Observation = fhir.Observation;
import DocumentReference = fhir.DocumentReference;
import Encounter = fhir.Encounter;
import AllergyIntolerance = fhir.AllergyIntolerance;
import Condition = fhir.Condition;
import Immunization = fhir.Immunization;
import Task = fhir.Task;
import Composition = fhir.Composition;
import MedicationRequest = fhir.MedicationRequest;

export interface FHIREvent {
  serverName : string,
  observations?: Observation[];
  documents?: DocumentReference[];
  encounters?: Encounter[];
  allergies?: AllergyIntolerance[];
  conditions?: Condition[];
  immunizations? : Immunization[],
  tasks? : Task[],
  compositions? : Composition[],
  medicationRequests? : MedicationRequest[]
}
