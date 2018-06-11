import { Data } from 'api/services';

export enum Parameter {
  Temperature = 'temperature',
  Precipitation = 'precipitation',
}

export enum Period {
  Begin = 'begin',
  End = 'end',
}

export type State = {
  selectedParameter: Parameter;
  periodData: Record<Parameter, Data[]>;
  selectedPeriod: Record<Period, string>;
};
