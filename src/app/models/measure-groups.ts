import {Measure} from "./measure";

export interface MeasureGroups {

  attrib: string;
  category: string;
  comment: string;
  created: string;
  date: string;
  deviceid: string;
  grpid: string;
  hash_deviceid: string;
  measures: Measure[];
}
