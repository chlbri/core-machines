import { Entity } from 'core-data';

export type DataMock = Entity & {
  login?: string;
  firstNames?: string[];
  lastName?: string;
};


type Exo = {
  idTranscation:string;
  idUser:string;
  FirstNames:string;
  LastName:string;
  amount:string;
  date:Date;
}