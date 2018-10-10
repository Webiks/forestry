import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Headers } from '@angular/http';
import 'rxjs/operator/map';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
// import * as xml2js from 'xml2js';
import 'rxjs/add/operator/map';

@Injectable()
export class HelperService {
  public CESIUM_BASE_URL: string;

  constructor(public http: Http) {
    this.CESIUM_BASE_URL = 'assets/Cesium';
  }

  getCoordinatesViaImage(imageurl: string, prob: string): Promise<any> {
    let params: URLSearchParams = new URLSearchParams();
    // `http://34.248.150.60:5000/trees_url?imageurl=${imageurl}`
    // http://34.250.142.20:5000/trees_url?imageurl=http://forestry.webiks.com:8007/DATA/upm/TMS/ElRefugio_Sec3_2ago16_COMP.tif/21/713959/848964.png
    // http://34.251.145.42
    params.set('url', `http://34.244.81.19:5000/trees_url?imageurl=${imageurl}&prob=${prob}`);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(`${SERVER_BASE_URL}/api/getCoordinates`, {
      search: params,
      headers: headers
    }).map(data => data.json()).toPromise();
  }

  getRastersList(): Observable<any> {
    return this.http.get(`${SERVER_BASE_URL}/api/list_of_rasters.json`).map(data => data.json());
  }

  getPointsList(): Observable<any> {
    return this.http.get(`${SERVER_BASE_URL}/api/list_of_vectors_points.json`).map(data => data.json());
  }

  getPolygonsList(): Observable<any> {
    return this.http.get(`${SERVER_BASE_URL}/api/list_of_vectors_polygons.json`).map(data => data.json());
  }


  getGeojson(url: string): Observable<any> {
    return this.http.get(`${SERVER_BASE_URL}/${url}`).map(data => data.json());
  }

  getTmsmapresource(url: string): Observable<any> {
    return new Observable<any>(obs => {
      this.http.get(`${SERVER_BASE_URL}/${url}/tilemapresource.xml`).toPromise().then(response => {
        // xml2js.parseString(response['_body'], (err, res) => {
          obs.next({});
        // });
      });
    });

  }

  getColorByItemName(name: string) {
    if (name.includes('Missing')) {
      return 'red';
    }
    if (name.includes('Suspected')) {
      return 'yellow';
    }
    return 'CHARTREUSE';
  }


  getSplitGeojsonData(item: { url: string, geojsonData?: any, loadingEmitter: any }): Observable<any> {
    let that = this;
    return new Observable(obs => {
      if (item.geojsonData) {
        obs.next(that.splitGeojsonData(item.geojsonData));
      } else {
        item.loadingEmitter.subscribe(() => {
          obs.next(that.splitGeojsonData(item.geojsonData));
        });
      }
    });
  }

  splitGeojsonData(geojsonData): { without_points: any, only_points: any } {
    const without_points = _.cloneDeep(geojsonData);
    const only_points = _.cloneDeep(geojsonData);
    only_points.features = [];
    without_points.features = [];
    geojsonData.features.forEach((feature, index) => {
      if (feature.geometry.type === 'Point') {
        only_points.features.push(feature);
      } else {
        without_points.features.push(feature);
      }
    });
    return { without_points: without_points, only_points: only_points };
  }
}


let hostName = '';

if (location.hostname.includes('terrabiks.fi')) {
  hostName = 'fi';
} else if (location.hostname.includes('terrabiks.upm')) {
  hostName = 'upm';
} else {
  hostName = 'data';
}


// export let SERVER_BASE_URL = `http://${location.hostname}:8007`;
// export let GEOSERVER_BASE_URL = `http://${location.hostname}:8008/geoserver`;
export let SERVER_BASE_URL = `http://${hostName}.forestry.webiks.com`;
export let GEOSERVER_BASE_URL = `http://${hostName}forestry.webiks.com/geoserver`;
