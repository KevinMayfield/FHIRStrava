import Observation = fhir.Observation;
import DocumentReference = fhir.DocumentReference;
import Encounter = fhir.Encounter;

export interface FHIREvent {
  serverName : string,
  observations?: Observation[];
  documents?: DocumentReference[];
  encounters?: Encounter[];
}
