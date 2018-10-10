import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { GEOSERVER_BASE_URL, HelperService, SERVER_BASE_URL } from '../helper.service';
import { ToolsService } from '../tools/tools.service';
import * as ol from 'openlayers';
import { AnimationHelperService, animations } from '../animation-helper.service';
import { Observable } from 'rxjs';
import { UIRouterGlobals } from '@uirouter/angular';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-openlayers',
  templateUrl: './openlayers.component.html',
  styleUrls: ['./openlayers.component.scss'],
  animations: animations
})
export class OpenlayersComponent implements OnInit, OnDestroy, AfterViewInit {

  public map: ol.Map;
  public pointermove;
  public precentChangesSubscriber;

  constructor(private helperService: HelperService, private toolsService: ToolsService, private animationHelperService: AnimationHelperService, private globals: UIRouterGlobals) {
  }

  ngOnInit() {
    let base_layer = new ol.layer.Tile(<olx.layer.TileOptions>{
      source: new ol.source.OSM(),
      extent: this.transformExtent([-180.0, -90.0, 180.0, 90.0])
    });
    this.map = new ol.Map(<any>{
      target: 'map',
      layers: [
        base_layer
      ],
      view: new ol.View(<olx.ViewOptions>{
        center: ol.proj.fromLonLat([-15.2789907, -22.4716007]),
        zoom: 3
      })
    });
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
          this.initAfterLeavingSubscriber();
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
        this.map.setTarget(null);
        this.map = null;
      });
    });
  }

  initRasters() {
    this.toolsService.dropdowns.rasters.list.forEach(item => {
      if (item.checked) {
        this.onClickRasterItem({ item: item, notFly: true });
      }
    });
  }


  initVectors() {
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
      this.map.getView().fit(this.transformExtent(this.toolsService.position), this.map.getSize());
      let lastStateName = this.globals.transitionHistory.peekTail().from().name;
      let zoomTo = lastStateName == 'App.Leaflet' ? this.map.getView().getZoom() + 1 : this.map.getView().getZoom();
      this.map.getView().setZoom(zoomTo);
    }
  }

  initZoomValues() {
    this.toolsService.zoomText = 'Zoom Level';
    this.toolsService.zoomInput = () => {
      let zoom: string = this.map.getView().getZoom().toString();
      return parseInt(zoom).toString();
    };
  }

  initLatLngValues() {
    let toolsService = this.toolsService;
    this.pointermove = this.map.on('pointermove', (event) => {
      let cord: ol.Coordinate = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      toolsService.lng = cord[0].toFixed(5);
      toolsService.lat = cord[1].toFixed(5);
    });
  }

  ngOnDestroy() {
    this.toolsService.destroySubscribers();
    let extent = this.map.getView().calculateExtent(this.map.getSize());
    let t_extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    this.toolsService.position = t_extent;
    this.map.unByKey(this.pointermove);
  }

  destroyVectors() {
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

  transformExtent(extent: ol.Extent): ol.Extent {
    return ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }

  flyToLayer($event) {
    var pan = ol.animation.pan(<olx.animation.PanOptions>{
      source: this.map.getView().getCenter(),
      easing: ol.easing.inAndOut
    });
    var zoom = ol.animation.zoom(<olx.animation.ZoomOptions>{
      resolution: this.map.getView().getResolution(),
      easing: ol.easing.inAndOut
    });
    this.map.beforeRender(pan);
    this.map.beforeRender(zoom);
    this.map.getView().fit($event.layer.getExtent(), this.map.getSize());
  }

  onClickTmsItem($event: { item: { name: string, url: string, layer: any, checked: boolean }, notFly?: boolean }) {
    if ($event.item.checked) {

      this.helperService.getTmsmapresource($event.item.url).subscribe(res => {
        let BoundingBox = [res.TileMap.BoundingBox[0].$.minx, res.TileMap.BoundingBox[0].$.miny, res.TileMap.BoundingBox[0].$.maxx, res.TileMap.BoundingBox[0].$.maxy];
        BoundingBox.forEach((val, index) => {
          BoundingBox[index] = Number(val);
        });
        let extent: ol.Extent = this.transformExtent(<ol.Extent>BoundingBox);
        let minZoom = parseInt(res.TileMap.TileSets[0].TileSet[0].$.order);
        let maxZoom = parseInt(res.TileMap.TileSets[0].TileSet[res.TileMap.TileSets[0].TileSet.length - 1].$.order);

        $event.item.layer = new ol.layer.Tile(<olx.layer.TileOptions>{
          extent: extent,
          zIndex: 1,
          source: new ol.source.XYZ(<olx.source.XYZOptions>{
            url: `${SERVER_BASE_URL}/${$event.item.url}/{z}/{x}/{-y}.png`,
            maxZoom: maxZoom,
            minZoom: minZoom,
            crossOrigin: 'anonymous'
          })
        });
        this.map.addLayer($event.item.layer);
        if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
      });
    } else {
      this.map.removeLayer($event.item.layer);
      $event.item.layer = null;
    }
  }


  onClickWmsItem($event: { item: { name: string, url: string, layer: any, layers: string, type: 'wms', bounds: ol.Extent, checked: boolean }, notFly?: boolean }) {
    if ($event.item.checked) {
      $event.item.layer = new ol.layer.Tile(<olx.layer.TileOptions>{
        extent: this.transformExtent($event.item.bounds),
        zIndex: 1,
        source: new ol.source.TileWMS(<olx.source.TileWMSOptions>{
          url: `${GEOSERVER_BASE_URL}/${$event.item.url}`,
          params: {
            layers: $event.item.layers
          },
          projection: ol.proj.get('EPSG:4326'),
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        })
      });
      this.map.addLayer($event.item.layer);
      if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
    } else {
      this.map.removeLayer($event.item.layer);
      $event.item.layer = null;
    }
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

  onClickVectorItem($event: { item: { name: string, url: string, layer: any, event: any, checked: boolean, loadingEmitter: any } }): Observable<any> {
    return new Observable(obs => {
      if ($event.item.checked) {
        this.helperService.getSplitGeojsonData($event.item).subscribe((response: { without_points: any, only_points: any }) => {
          this.normalGeojson(response.without_points, $event.item);
          this.clusteringPoints(response.only_points, $event.item);
          obs.next();
          obs.complete();
        });
      } else {
        this.map.unByKey($event.item.event);

        $event.item.layer.getSource().clear();
        this.map.removeLayer($event.item.layer);
        $event.item.layer = null;

        obs.next();
        obs.complete();
      }
    });
  }


  normalGeojson(features, item) {
    if (features.features.length == 0) return;
    let that = this;


    let geojson_source = new ol.source.Vector(<olx.source.VectorOptions>{
      features: new ol.format.GeoJSON().readFeatures(features, <any> { featureProjection: 'EPSG:3857' })
    });

    item.layer = new ol.layer.Vector(<olx.layer.VectorOptions>{
      zIndex: 3,
      source: geojson_source,
      style: that.geojsonStyle(item)
    });
    this.map.addLayer(item.layer);
  }


  clusteringPoints(features: any, item: any) {
    if (features.features.length == 0) return;

    if (features.features.length < 10000) {
      this.normalGeojson(features, item);
      return;
    }

    let that = this;

    let geojson_source = new ol.source.Vector(<olx.source.VectorOptions>{
      features: new ol.format.GeoJSON().readFeatures(features, <any> { featureProjection: 'EPSG:3857' })
    });

    let clusterSource = new ol.source.Cluster(<olx.source.ClusterOptions>{
      distance: 50,
      source: geojson_source
    });

    item.clustering = that.map.getView().getZoom() < 19;

    item.layer = new ol.layer.Vector(<olx.layer.VectorOptions>{
      zIndex: 3,
      source: item.clustering ? clusterSource : geojson_source,
      style: item.clustering ? that.clusteringStyle : that.geojsonStyle(item)
    });
    this.map.addLayer(item.layer);


    let moveend = () => {
      if (that.map.getView().getZoom() >= 19 && item.clustering) {
        item.clustering = false;
        item.layer.setSource(geojson_source);
        item.layer.setStyle(that.geojsonStyle(item));
      } else if (that.map.getView().getZoom() < 19 && !item.clustering) {
        item.clustering = true;
        item.layer.setSource(clusterSource);
        item.layer.setStyle(that.clusteringStyle);
      }
    };

    item.event = this.map.on('moveend', moveend);
    moveend();
  }


  parseedZoom() {
    let zoom: string = this.map.getView().getZoom().toString();
    return parseInt(zoom).toString();
  }

  geojsonStyle(item) {
    let color_of_point = this.helperService.getColorByItemName(item.name);

    return new ol.style.Style(<olx.style.StyleOptions>{
      zIndex: 200,
      image: new ol.style.Circle(<olx.style.CircleOptions>{
        radius: 5,
        fill: new ol.style.Fill({
          color: color_of_point
        }),
        stroke: new ol.style.Stroke(<any>{
          width: 1,
          color: 'BLACK'
        })
      }),
      stroke: new ol.style.Stroke(<any>{
        width: 2,
        color: '#38f'
      })
    });
  }


  clusteringStyle(feature: ol.Feature, resolution: number): ol.style.Style {
    let getFeature = feature.get('features');
    var size = getFeature ? getFeature.length : 0;

    return new ol.style.Style(<olx.style.StyleOptions>{
      image: new ol.style.Circle(<olx.style.CircleOptions>{
        radius: 13,
        fill: new ol.style.Fill({
          color: 'BLACK'//'CHARTREUSE'
        }),
        stroke: new ol.style.Stroke(<olx.style.StrokeOptions>{
          color: 'CHARTREUSE',
          width: 1
        })
      }),
      text: new ol.style.Text(<any>{
        text: size.toString(),
        fill: new ol.style.Fill({
          color: 'CHARTREUSE'
        }),
        font: '10px sans-serif'
      })
    });
  };
}









