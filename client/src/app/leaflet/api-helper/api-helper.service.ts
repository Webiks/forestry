import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class ApiHelperService {

  public setApiLayerManipulation:EventEmitter<any> = new EventEmitter();

  constructor() { }

}
