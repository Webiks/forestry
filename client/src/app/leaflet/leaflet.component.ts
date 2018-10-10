import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { GEOSERVER_BASE_URL, HelperService, SERVER_BASE_URL } from '../helper.service';
import * as L from 'leaflet';
import { ToolsService } from '../tools/tools.service';
import * as d3 from 'd3';
import { AnimationHelperService, animations } from '../animation-helper.service';
import { Observable, Subscriber } from 'rxjs';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { UIRouter } from '@uirouter/angular';
import { ApiHelperService } from './api-helper/api-helper.service';

@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.scss'],
  animations: animations
})


export class LeafletComponent implements OnInit, OnDestroy, AfterViewInit {
  public mymap: any;
  public precentChangesSubscriber: Subscriber<any>;

  // public api_helper:ApiHelper;

  constructor(private helperService: HelperService, private toolsService: ToolsService, private animationHelperService: AnimationHelperService, private uiRouter: UIRouter, private apiHelperService: ApiHelperService) {
    window['current'] = this;
  }

  ngOnInit() {
    this.mymap = L.map('leafletContainer', { worldCopyJump: true }).setView([-15.2789907, -22.4716007], 3);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      noWrap: true,
      bounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
    }).addTo(this.mymap);

    // this.api_helper = new ApiHelper(this.mymap, this.helperService);
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.initRasters();
      this.initPosition();
      this.initZoomValues();
      this.initLatLngValues();
      this.initSubscribers();
    }, 0);
  }


  initSubscribers() {
    let that = this;
    this.toolsService.initSubscribers(that);

    let beforeLeavingSubscriber = that.animationHelperService.beforeLeavingEmiter.subscribe(() => {
      that.animationHelperService.hideState();
      beforeLeavingSubscriber.unsubscribe();
    });

    that.precentChangesSubscriber = that.animationHelperService.precentChangesEmiter.subscribe((percent: number) => {
      switch (percent) {
        case 0:
          that.animationHelperService.setProgressBarPrecent(50);
          break;
        case 50:
          that.animationHelperService.afterLeavingEmiter.emit();
          break;
        case 75:
          that.initVectors().subscribe(null, null, () => {
            that.animationHelperService.completeProgressBar();
          });
          break;
        case 100:
          that.initAfterLeavingSubscriber();
          this.precentChangesSubscriber.unsubscribe();
          break;
      }
    });

    this.animationHelperService.stayState();
    this.animationHelperService.initProgressBar();
  }

  initAfterLeavingSubscriber() {
    let afterLeavingSubscriber = this.animationHelperService.afterLeavingEmiter.subscribe(() => {
      this.destroyVectors().subscribe(null, null, () => {
        this.animationHelperService.setProgressBarPrecent(75);
        afterLeavingSubscriber.unsubscribe();
      });
    });
  }


  initRasters() {
    this.toolsService.dropdowns.rasters.list.forEach(item => {
      if (item.checked) {
        this.onClickRasterItem({ item, notFly: true });
      }
    });
  }

  initVectors(): Observable<any> {
    let that = this;
    let observArray: Array<Observable<any>> = [];
    let checked_vectors = that.toolsService.dropdowns.polygons.list.concat(that.toolsService.dropdowns.points.list).filter(item => item.checked);
    checked_vectors.map(item => {
      observArray.push(that.onClickVectorItem({ item: item }));
    });
    return Observable.merge(...observArray);
  }

  initPosition() {
    if (this.toolsService.position) {
      this.mymap.fitBounds([[this.toolsService.position[1], this.toolsService.position[0]], [this.toolsService.position[3], this.toolsService.position[2]]]);
    }
  }

  initZoomValues() {
    this.toolsService.zoomText = 'Zoom Level';
    this.toolsService.zoomInput = () => {
      let zoom: string = this.mymap.getZoom().toString();
      return parseInt(zoom).toString();
    };
  }

  initLatLngValues() {
    let toolsService = this.toolsService;

    this.mymap.on('mousemove', (event) => {
      toolsService.lat = event.latlng.lat.toFixed(5);
      toolsService.lng = event.latlng.lng.toFixed(5);
    });

  }

  ngOnDestroy() {
    this.toolsService.destroySubscribers();
    let leaflet_bounds: L.LatLngBounds = this.mymap.getBounds();
    this.toolsService.position = [leaflet_bounds.getSouthWest().lng, leaflet_bounds.getSouthWest().lat, leaflet_bounds.getNorthEast().lng, leaflet_bounds.getNorthEast().lat];
  }

  destroyVectors(): Observable<any> {
    let observArray: Array<Observable<any>> = [];
    let checked_items: Array<any> = this.toolsService.dropdowns.polygons.list.filter(item => item.checked);
    checked_items.map((item) => {
      item.checked = false;
      observArray.push(this.onClickVectorItem({ item: item }).map(() => {
        item.checked = true;
      }));
    });
    return Observable.merge(...observArray);
  }

  flyToLayer($event) {
    this.mymap.flyToBounds($event.layer.options.bounds);
  }

  onClickRasterItem($event) {
    switch ($event.item.type) {
      case 'wms':
        this.onClickWmsItem($event);
        break;
      case 'tms':
        this.onClickTmsItem($event);
        break;
    }
  }

  onClickTmsItem($event: { item: { name: string, url: string, layer: any, type: 'tms', checked: boolean }, notFly?: boolean }) {
    if ($event.item.checked) {
      this.helperService.getTmsmapresource($event.item.url).subscribe(res => {

        let bounds = L.latLngBounds(L.latLng(res.TileMap.BoundingBox[0].$.miny, res.TileMap.BoundingBox[0].$.minx), L.latLng(res.TileMap.BoundingBox[0].$.maxy, res.TileMap.BoundingBox[0].$.maxx));
        let minZoom = res.TileMap.TileSets[0].TileSet[0].$.order;
        let maxZoom = res.TileMap.TileSets[0].TileSet[res.TileMap.TileSets[0].TileSet.length - 1].$.order;

        $event.item.layer = L.tileLayer(`${SERVER_BASE_URL}/${$event.item.url}/{z}/{x}/{y}.png`, {
          maxZoom: maxZoom,
          minZoom: minZoom,
          tms: true,
          bounds: bounds
        });
        this.mymap.addLayer($event.item.layer);
        if (this.apiState()) this.apiHelperService.setApiLayerManipulation.emit($event.item.layer);
        if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
      });
    } else {
      this.mymap.removeLayer($event.item.layer);
    }
  }

  apiState(): boolean {
    return !location.origin.includes('terrabiks');
  }

  onClickWmsItem($event: { item: { name: string, url: string, layer: L.TileLayer, layers: string, type: 'wms', bounds: Array<number>, checked: boolean }, notFly?: boolean }) {
    if ($event.item.checked) {
      $event.item.layer = L.tileLayer.wms(`${GEOSERVER_BASE_URL}/${$event.item.url}`, {
        layers: $event.item.layers,
        transparent: true,
        version: '1.1.0',
        maxZoom: 22,
        minZoom: 18,
        bounds: L.latLngBounds(L.latLng($event.item.bounds[1], $event.item.bounds[0]), L.latLng($event.item.bounds[3], $event.item.bounds[2]))
      }).addTo(this.mymap);
      if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
    } else {
      this.mymap.removeLayer($event.item.layer);
    }
  }

  onClickVectorItem($event: { item: { name: string, url: string, layer: any, checked: boolean, manyPoints: ManyPoints, geojsonData?: any, loadingEmitter: any } }): Observable<any> {
    return new Observable(obs => {

      if ($event.item.checked) {
        this.helperService.getSplitGeojsonData($event.item).subscribe((response: { without_points: any, only_points: any }) => {
          if (response.only_points.features.length < 10000) {
            this.normalGeojson($event.item.geojsonData, $event.item);
          } else {
            this.manyPoints(response.only_points, $event.item);
            this.normalGeojson(response.without_points, $event.item);
          }
          obs.next();
          obs.complete();
        });
      } else {
        this.mymap.removeLayer($event.item.layer);
        if ($event.item.manyPoints) $event.item.manyPoints.rmvD3Svg();
        obs.next();
        obs.complete();
      }
    });


  }

  normalGeojson(features, item) {
    let color_of_point = this.helperService.getColorByItemName(item.name);
    item.layer = L.geoJSON(features, <any>{
      pointToLayer: (geoJsonPoint: GeoJSON.Point, latlng: L.LatLng) => {
        return <any>L.circleMarker(latlng, {
          color: 'black',
          radius: 5,
          weight: 1,
          fillColor: color_of_point,
          fillOpacity: 1
        });
      },
      style: (feature) => {
        if (feature.geometry.type != 'Point') {
          return {
            weight: 2,
            fillOpacity: 0
          };
        }
      }
    }).addTo(this.mymap);
  }

  manyPoints(features, item) {
    item.manyPoints = new ManyPoints(this.mymap, features);
  }


}

class ManyPoints {
  public g: any;
  public svg: any;
  public qtree: any;
  public path: any;

  constructor(public mymap, public geoData, public pointColor: string = 'CHARTREUSE') {
    this.createD3Svg();
  }

  createD3Svg() {
    this.svg = d3.select(this.mymap.getPanes().overlayPane).append('svg');
    this.g = this.svg.append('g').attr('class', 'leaflet-zoom-hide');

    this.qtree = d3.geom.quadtree(this.geoData.features.map(function (data, i) {
        return {
          x: data.geometry.coordinates[0],
          y: data.geometry.coordinates[1],
          all: data
        };
      }
      )
    );
    let mymap = this.mymap;
    var transform = d3.geo.transform({

      point: function (x, y) {
        let point = mymap.latLngToLayerPoint(L.latLng(y, x));
        return this.stream.point(point.x, point.y);
      }

    });
    this.path = d3.geo.path().projection(transform);

    this.updateNodes(this.qtree);

    var that = this;

    function moveend() {
      var mapBounds = that.mymap.getBounds();
      var subset = that.search(that.qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth());
      if (subset.length !== 0) that.redrawSubset(subset);
    }

    this.mymap.on('moveend', moveend);
    moveend();
  }

  rmvD3Svg() {
    if (this.svg) {
      this.svg.remove();
      this.mymap.off('moveend');
    }
  }


  search(quadtree, x0, y0, x3, y3) {
    var pts = [];
    var subPixel = false;
    var subPts = [];
    var scale = this.getZoomScale();
    var counter = 0;
    quadtree.visit(function (node, x1, y1, x2, y2) {
      var p = node.point;
      var pwidth = node.width * scale;
      var pheight = node.height * scale;

      // -- if this is too small rectangle only count the branch and set opacity
      if ((pwidth * pheight) <= 1) {
        // start collecting sub Pixel points
        subPixel = true;
      }
      // -- jumped to super node large than 1 pixel
      else {
        // end collecting sub Pixel points
        if (subPixel && subPts && subPts.length > 0) {

          subPts[0].group = subPts.length;
          pts.push(subPts[0]); // add only one todo calculate intensity
          counter += subPts.length - 1;
          subPts = [];
        }
        subPixel = false;
      }

      if ((p) && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) {

        if (subPixel) {
          subPts.push(p.all);
        }
        else {
          if (p.all.group) {
            delete (p.all.group);
          }
          pts.push(p.all);
        }

      }
      // if quad rect is outside of the search rect do nto search in sub nodes (returns true)
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return pts;
  }


  updateNodes(quadtree) {

    function MercatorXofLongitude(lon) {
      return lon * 20037508.34 / 180;
    }

    function MercatorYofLatitude(lat) {
      return (Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180;
    }

    var nodes = [];
    quadtree.depth = 0; // root

    quadtree.visit(function (node, x1, y1, x2, y2) {
      var nodeRect = {
        left: MercatorXofLongitude(x1),
        right: MercatorXofLongitude(x2),
        bottom: MercatorYofLatitude(y1),
        top: MercatorYofLatitude(y2)
      };
      node.width = (nodeRect.right - nodeRect.left);
      node.height = (nodeRect.top - nodeRect.bottom);

      if (node.depth == 0) {
      }
      nodes.push(node);
      for (var i = 0; i < 4; i++) {
        if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
      }
    });
    return nodes;
  }

  getZoomScale() {
    function MercatorXofLongitude(lon) {
      return lon * 20037508.34 / 180;
    }

    function MercatorYofLatitude(lat) {
      return (Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180;
    }

    var mapWidth = this.mymap.getSize().x;
    var bounds = this.mymap.getBounds();
    var planarWidth = MercatorXofLongitude(bounds.getEast()) - MercatorXofLongitude(bounds.getWest());
    var zoomScale = mapWidth / planarWidth;
    return zoomScale;
  }

  redrawSubset(subset) {
    let max = 3;
    let min = 0.2;
    var scale = this.getZoomScale();
    if (max < scale) {
      scale = 2;
    } else if (scale < min) {
      scale = min;
    }
    this.path.pointRadius(scale);

    var bounds = this.path.bounds({ type: 'FeatureCollection', features: subset });
    var topLeft = bounds[0];
    var bottomRight = bounds[1];


    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');


    this.g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');


    var points = this.g.selectAll('path').data(subset);
    points.enter().append('path').attr('fill', this.pointColor);
    points.exit().remove();
    points.attr('d', this.path);

    points.style('fill-opacity', function (d) {
      if (d.group) {
        return (d.group * 0.1) + 0.2;
      }
    });

  }
}
