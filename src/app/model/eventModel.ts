import Observation = fhir4.Observation;
import DocumentReference = fhir4.DocumentReference;
import Encounter = fhir4.Encounter;
import AllergyIntolerance = fhir4.AllergyIntolerance;
import Condition = fhir4.Condition;
import Immunization = fhir4.Immunization;
import Task = fhir4.Task;
import Composition = fhir4.Composition;
import MedicationRequest = fhir4.MedicationRequest;

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
