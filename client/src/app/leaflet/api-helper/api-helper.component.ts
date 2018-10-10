import { Component, Input } from '@angular/core';
import { HelperService } from '../../helper.service';
import { ApiHelperService } from './api-helper.service';
import * as _ from 'lodash';
import * as L from 'leaflet';

@Component({
  selector: 'app-api-helper',
  templateUrl: './api-helper.component.html',
  styleUrls: ['./api-helper.component.scss']
})
export class ApiHelperComponent {

  public apiArray = [];

  public api = {
    prob: '0.9',
    points: true,
    squares: true,
    tiles: true
  };

  @Input() mymap;

  constructor(private helperService: HelperService, private apiHelperService: ApiHelperService) {
    apiHelperService.setApiLayerManipulation.subscribe(this.setApiLayerManipulation.bind(this));
  };

  getLatlngFromCoords(coords: { x: number, y: number, z: number }): L.LatLng {
    let lng = coords.x / Math.pow(2.0, coords.z) * 360.0 - 180;
    let n = Math.PI - (2.0 * Math.PI * coords.y) / Math.pow(2.0, coords.z);
    let lat = -(Cesium.Math.toDegrees(Math.atan(Math.sinh(n))) * -1) * 1000000 / 1000000;
    return L.latLng([lat, lng]);
  }

  latLngToXYZTile(lat, lon, z): { x: number, y: number, z: number } {
    var x = parseInt(Math.floor((lon + 180) / 360 * (1 << z)).toString());
    var y = parseInt(Math.floor((1 - Math.log(Math.tan(Cesium.Math.toRadians(lat)) + 1 / Math.cos(Cesium.Math.toRadians(lat))) / Math.PI) / 2 * (1 << z)).toString());
    return { x, y, z };
  }

  setApiLayerManipulation(layer): void {
    let that = this;
    let normalGetTileUrl = layer.getTileUrl.bind(layer);

    layer.getTileUrl = function (tile_coords) {
      let imageUrl: string = normalGetTileUrl(tile_coords);


      if (tile_coords.z == 21) {
        let exist = that.apiArray.find(item => imageUrl == item.imageUrl);

        if (!exist) {
          let latlng = that.getLatlngFromCoords(tile_coords);
          let right_bottom_coords = { x: tile_coords.x + (256 / 256), y: tile_coords.y + (256 / 256), z: tile_coords.z };
          let right_bottom_latlng = that.getLatlngFromCoords(right_bottom_coords);
          let tile_bounds: L.LatLngBounds = <any> [latlng, right_bottom_latlng];
          let tile_rectangle = L.rectangle(tile_bounds, { fill: false, fillOpacity: 0, weight: 1, color: '#ff7800' });

          if (that.api.tiles) {
            tile_rectangle.addTo(that.mymap);
          }

          let prob = that.api.prob;
          let rectangles = [];
          let points = [];
          let loaded = false;
          let tree_obj = { imageUrl, tile_coords, rectangles, points, tile_rectangle, prob, loaded };

          that.apiArray.push(tree_obj);

          that.addPointsAndSquares(tree_obj);

        }
      }
      return imageUrl;
    };
  }


  addPointsAndSquares(tree_obj): void {

    if (tree_obj.prob == this.api.prob && tree_obj.loaded) return;

    tree_obj.rectangles.forEach(this.mymap.removeLayer.bind(this.mymap));
    tree_obj.points.forEach(this.mymap.removeLayer.bind(this.mymap));
    tree_obj.rectangles = [];
    tree_obj.points = [];


    tree_obj.prob = _.cloneDeep(this.api.prob);
    tree_obj.loaded = false;


    let that = this;

    this.helperService.getCoordinatesViaImage(tree_obj.imageUrl, tree_obj.prob).then(res => {
      tree_obj.loaded = true;
      let cordi = res.coordinates;
      cordi.forEach(point => {
        let tree_coords = {
          x: tree_obj.tile_coords.x + (point[0] / 256),
          y: tree_obj.tile_coords.y + (point[1] / 256),
          z: tree_obj.tile_coords.z
        };
        let tree_latlng = that.getLatlngFromCoords(tree_coords);

        let tree_coords2 = {
          x: tree_obj.tile_coords.x + (point[2] / 256),
          y: tree_obj.tile_coords.y + (point[3] / 256),
          z: tree_obj.tile_coords.z
        };
        let tree_latlng2 = that.getLatlngFromCoords(tree_coords2);

        let tree_coords2_middle = {
          x: (tree_coords2.x + tree_coords.x) / 2,
          y: (tree_coords2.y + tree_coords.y) / 2,
          z: tree_obj.tile_coords.z
        };
        let tree_latlng2_middle = that.getLatlngFromCoords(tree_coords2_middle);

        var bounds: L.LatLngBounds = <any>[tree_latlng, tree_latlng2];

        let rectangle_to_add = L.rectangle(bounds, { fill: false, fillOpacity: 0, weight: 1, color: '#ff7800' });
        let point_to_add = L.circleMarker(tree_latlng2_middle, { radius: 2, fillOpacity: 1, color: 'red', fill: true, fillColor: 'red' });

        tree_obj.rectangles.push(rectangle_to_add);
        tree_obj.points.push(point_to_add);

        if (that.api.points) {
          point_to_add.addTo(that.mymap);
        }
        if (that.api.squares) {
          rectangle_to_add.addTo(that.mymap);
        }
      });
      return res;
    });
  };

  togglePoints(checked: boolean): void {
    if (checked) {
      this.apiArray.forEach(i => {
        i.points.forEach(r => {
          this.mymap.addLayer(r);
        });
      });
    } else {
      this.apiArray.forEach(i => {
        i.points.forEach(r => {
          this.mymap.removeLayer(r);
        });
      });
    }
  };

  toggleRectangles(checked: boolean): void {
    if (checked) {
      this.apiArray.forEach(i => {
        i.rectangles.forEach(r => {
          this.mymap.addLayer(r);
        });
      });
    } else {
      this.apiArray.forEach(i => {
        i.rectangles.forEach(r => {
          this.mymap.removeLayer(r);
        });
      });
    }
  }

  toggleTiles(checked: boolean): void {
    if (checked) {
      this.apiArray.forEach(i => {
        this.mymap.addLayer(i.tile_rectangle);
      });
    } else {
      this.apiArray.forEach(i => {
        this.mymap.removeLayer(i.tile_rectangle);
      });
    }
  }

  get TilesSize(): number {
    return this.apiArray.length;
  }

  get LoadedTilesSize(): number {
    return this.apiArray.filter(tree_obj => tree_obj.loaded).length;
  }

  get PointsSize(): number {
    return this.apiArray.reduce((i, v, k) => i + v.points.length, 0);
  }

  finishLoading(): boolean {
    return this.TilesSize == this.LoadedTilesSize;
  }

  probChange(prob) {
    this.apiArray.reverse().forEach(this.addPointsAndSquares.bind(this));
  }

  removeAll() {
    this.apiArray.forEach(tile_obj => {
      this.togglePoints(false);
      this.toggleRectangles(false);
      this.toggleTiles(false);
      this.apiArray = [];
    });
  }

}
