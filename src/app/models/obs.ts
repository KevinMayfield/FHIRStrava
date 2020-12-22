export interface Obs {
  obsDate : Date;
  weight? : number;
  height? : number;
  fat_mass? : number;
  muscle_mass? : number;
  hydration? : number;
  bone_mass? : number;
  pwv? : number;
  suffer? : number;
  energy? : number;
  average_heartrate?: number;
  weighted_average_watts? : number;
  /*
  1	Weight (kg)
  4	Height (meter)
  5	Fat Free Mass (kg)
  76	Muscle Mass (kg)
  77	Hydration (kg)
  88	Bone Mass (kg)
  91	Pulse Wave Velocity (m/s) */
}
