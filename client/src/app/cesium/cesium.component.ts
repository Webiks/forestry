import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { GEOSERVER_BASE_URL, HelperService, SERVER_BASE_URL } from '../helper.service';
import { ToolsService } from '../tools/tools.service';
import { merge, Observable } from 'rxjs';
import { AnimationHelperService, animations } from '../animation-helper.service';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss'],
  animations: animations
})

export class CesiumComponent implements OnInit, OnDestroy, AfterViewInit {
  public viewer: any;
  public handler;
  public apiObject = [];
  grid_image_url = '';

  constructor(public element: ElementRef, private helperService: HelperService, private toolsService: ToolsService, public animationHelperService: AnimationHelperService) {
    window['current'] = this;
  };


  ngOnInit() {
    Cesium.BingMapsApi.defaultKey = 'Ag9RlBTbfJQMhFG3fxO9fLAbYMO8d5sevTe-qtDsAg6MjTYYFMFfFFrF2SrPIZNq';
    this.viewer = new Cesium.Viewer('cesiumContainer');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initRasters();
      this.initPosition();
      this.initLatLngValues();
      this.initSubscribers();
      this.initGrid();
      this.initZoomValues();
    }, 0);
  }

  gridColorByProperty(num: number) {
    if (num < 300) {
      return Cesium.Color.fromCssColorString('rgba(239, 1, 0, 0.7)');
    } else if (300 <= num && num < 450) {
      return Cesium.Color.fromCssColorString('rgba(243, 119, 5, 0.7)');
    } else if (450 <= num && num < 600) {
      return Cesium.Color.fromCssColorString('rgba(255, 198, 10, 0.7)');
    } else if (600 <= num && num < 900) {
      return Cesium.Color.fromCssColorString('rgba(163, 255, 3, 0.7)');
    } else if (900 <= num && num < 1200) {
      return Cesium.Color.fromCssColorString('rgba(71, 233, 10, 0.7)');
    } else if (1200 <= num) {
      return Cesium.Color.fromCssColorString('rgba(9, 113, 80, 0.7)');
    }
  }

  initGrid() {
    this.toolsService.gridEmmiter.subscribe((grid_obj) => {
      if (grid_obj.checked) {

        Cesium.GeoJsonDataSource.load(grid_obj.url).then((dataSource) => {
          this.grid_image_url = grid_obj.image_url;
          grid_obj.data_item = dataSource;
          dataSource._entityCollection._entities._array.forEach((entity) => {
            entity.polygon.material = this.gridColorByProperty(entity.properties.Arb_ha);
          });
          this.viewer.dataSources.add(dataSource);
          this.flyToLayer({ layer: dataSource });
        });
      } else {
        this.viewer.dataSources.remove(grid_obj.data_item);
        this.grid_image_url = '';
      }
    });
  }

  initSubscribers() {
    let that = this;
    this.toolsService.initSubscribers(that);

    let beforeLeavingSubscriber = this.animationHelperService.beforeLeavingEmiter.subscribe(() => {
      that.flyToCenterAndGetBounds().subscribe((response: { bounds: [number, number, number, number], hasNotFlown: boolean }) => {
        that.toolsService.position = response.bounds;

        if (response.hasNotFlown) {
          that.animationHelperService.hideState();
        }
        beforeLeavingSubscriber.unsubscribe();
      });
    });

    let precentChangesSubscriber = that.animationHelperService.precentChangesEmiter.subscribe((precent: number) => {
      switch (precent) {
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
          precentChangesSubscriber.unsubscribe();
          that.initAfterLeavingSubscriber();
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
        this.onClickRasterItem({ item: item, notFly: true });
      }
    });
  }

  initVectors() {
    let that = this;
    let observArray: Array<Observable<any>> = [];
    let checked_vectors = that.toolsService.dropdowns.polygons.list.concat(that.toolsService.dropdowns.points.list).filter(item => item.checked);
    checked_vectors.map(item => {
      observArray.push(that.onClickVectorItem({ item: item, notFly: true }));
    });
    return merge(...observArray);
  }


  initPosition() {
    if (this.toolsService.position) {
      this.viewer.camera.setView({
        destination: Cesium.Rectangle.fromDegrees(...this.toolsService.position)
      });
    }
  }

  initZoomValues() {
    this.toolsService.zoomText = 'Distance';
    this.toolsService.zoomInput = () => {
      if (this.viewer) {
        let cameraPosition = this.viewer.scene.camera.positionWC;
        let ellipsoidPosition = this.viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
        let distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(cameraPosition, ellipsoidPosition, new Cesium.Cartesian3()));
        return (distance / 1000).toFixed(1) + 'km';
      }
      return 'no';
    };
  }

  initLatLngValues() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    let viewer = this.viewer;
    let toolsService = this.toolsService;

    this.handler.setInputAction(function (movement) {
      let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        toolsService.lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5) || '0';
        toolsService.lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5) || '0';
        if (isNaN(toolsService.lng)) toolsService.lng = '0';
        if (isNaN(toolsService.lat)) toolsService.lat = '0';

      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


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

  onClickTmsItem($event: { item: any, notFly?: boolean }) {
    if ($event.item.checked) {
      $event.item.layer = this.viewer.scene.imageryLayers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
        url: `${SERVER_BASE_URL}/${$event.item.url}`
      }));
      if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
    } else {
      this.viewer.imageryLayers.remove($event.item.layer, false);
    }
  }

  onClickWmsItem($event: { item: any, notFly?: boolean }) {
    if ($event.item.checked) {
      $event.item.layer = this.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
        url: `${GEOSERVER_BASE_URL}/${$event.item.url}`,
        layers: $event.item.layers,
        rectangle: Cesium.Rectangle.fromDegrees(...$event.item.bounds)
      }));
      this.viewer.scene.imageryLayers.add($event.item.layer);
      if (!$event.notFly) this.flyToLayer({ layer: $event.item.layer });
    } else {
      this.viewer.scene.imageryLayers.remove($event.item.layer, false);
    }
  }

  flyToLayer($event: { layer: any }) {
    this.viewer.flyTo($event.layer);
  }


  addPrimitivePointsFromSource(source, $event) {
    $event.item.points = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());// this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    let color_of_points = this.helperService.getColorByItemName($event.item.name);
    let pixelSize = 5.0;
    let translucencyByDistance = new Cesium.NearFarScalar(1.e2, 1.0, 2.e4, 0.0);
    let color = Cesium.Color[color_of_points.toUpperCase()];
    source.features.forEach(function (feature) {
      $event.item.points.add({
        pixelSize: pixelSize,
        translucencyByDistance: translucencyByDistance,
        position: Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1]),
        color: color
      });
    });
  }

  addDataSourceFromSource(source, $event) {
    return new Observable(obs => {
      Cesium.GeoJsonDataSource.load(source, {
        stroke: Cesium.Color.fromCssColorString('#38f'),
        strokeWidth: 2,
        fill: Cesium.Color.TRANSPARENT
      }).then((dataSource) => {
        $event.item.dataSource = dataSource;
        this.viewer.dataSources.add($event.item.dataSource);
        if (!$event.notFly) this.flyToLayer({ layer: $event.item.dataSource });
        obs.next();
      });
    });

  }

  onClickVectorItem($event: { item: any, notFly?: boolean }): Observable<any> {
    return new Observable(obs => {
      if ($event.item.checked) {
        this.helperService.getSplitGeojsonData($event.item).subscribe((response: { without_points: any, only_points: any }) => {
          this.addPrimitivePointsFromSource(response.only_points, $event);
          this.addDataSourceFromSource(response.without_points, $event).subscribe(() => {
            obs.next();
            obs.complete();
          });
        });
      } else {
        if ($event.item.dataSource) {
          this.viewer.dataSources.remove($event.item.dataSource);
        }
        if ($event.item.points) {
          this.viewer.scene.primitives.remove($event.item.points);
        }
        obs.next();
        obs.complete();
      }
    });
  }

  getCurrentDistance() {
    if (this.viewer) {
      let cameraPosition = this.viewer.scene.camera.positionWC;
      let ellipsoidPosition = this.viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
      let distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(cameraPosition, ellipsoidPosition, new Cesium.Cartesian3()));
      return (distance / 1000).toFixed(1) + 'km';
    }
    return 'no';
  }


  ngOnDestroy() {
    this.toolsService.destroySubscribers();
    this.handler.destroy();
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

  getBounds(): [number, number, number, number] {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    var c2 = new Cesium.Cartesian2(0, 0);
    var leftTop = new Cesium.Cartesian3();
    this.viewer.scene.camera.pickEllipsoid(c2, this.viewer.scene.globe.ellipsoid, leftTop);
    c2 = new Cesium.Cartesian2(this.viewer.scene.canvas.width, this.viewer.scene.canvas.height, 0);
    var rightDown = this.viewer.scene.camera.pickEllipsoid(c2, this.viewer.scene.globe.ellipsoid);
    this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    if (leftTop != undefined && rightDown != undefined) {
      leftTop = Cesium.Cartographic.fromCartesian(leftTop);
      rightDown = Cesium.Cartographic.fromCartesian(rightDown);
      if (leftTop == undefined || rightDown == undefined) {
        return;
      }
      return [Cesium.Math.toDegrees(rightDown.longitude), Cesium.Math.toDegrees(leftTop.latitude), Cesium.Math.toDegrees(leftTop.longitude), Cesium.Math.toDegrees(rightDown.latitude)];
    }
  }


  flyToCenterAndGetBounds() {
    let position, hasNotFlown: boolean = false, that = this;
    return new Observable<any>(obs => {

      if (Math.cos(that.viewer.camera.pitch) < 0.001) {
        position = that.viewer.camera.position;
        hasNotFlown = true;
      }
      else {
        try {
          let rect = that.viewer.canvas.getBoundingClientRect();

          let center = new Cesium.Cartesian2(rect.width / 2, rect.height / 2);
          position = that.viewer.camera.pickEllipsoid(center, that.viewer.scene.globe.ellipsoid);

          let cartographic = Cesium.Cartographic.fromCartesian(position);
          cartographic.height = that.viewer.camera.positionCartographic.height;

          position = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        }
        catch (err) {
          position = that.viewer.camera.position;
          hasNotFlown = true;
        }
      }

      let flyToObj = {
        destination: position,
        easingFunction: Cesium.EasingFunction.LINEAR_NONE,
        orientation: {
          heading: Cesium.Math.toRadians(0.0), //go north
          pitch: Cesium.Math.toRadians(-90.0), //look down
          roll: 0.0 //no change
        },
        duration: 0.5,
        complete: () => {
          obs.next({
            bounds: that.getBounds(),
            hasNotFlown: hasNotFlown
          });
        }
      };
      if (!hasNotFlown) that.animationHelperService.hideCesiumState();
      that.viewer.scene.camera.flyTo(flyToObj);
    });
  }

}
