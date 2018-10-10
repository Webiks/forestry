import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolsComponent } from './tools.component';
import {HelperService} from "../helper.service";
import {Observable} from "rxjs";
import {ToolsService} from "./tools.service";
import {AppModule} from "../app.module";
import {HelperServiceMock} from "../../test";

describe('ToolsComponent', () => {
  let component: ToolsComponent;
  let fixture: ComponentFixture<ToolsComponent>;
  let helperService:HelperService;
  let nativeElement:any;
  let toolsService:ToolsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers:[ {provide: HelperService, useClass :HelperServiceMock }]

    })
    .compileComponents();

    helperService = TestBed.get(HelperService);
    toolsService = TestBed.get(ToolsService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('component should create', () => {
    expect(component).toBeTruthy();
  });

    it(`should dropdowns classes to initialize with data from helperService`, () => {
      let tme_dropdown = toolsService.dropdowns.rasters;
      expect(tme_dropdown.isOpen).toBeFalsy();
      expect(tme_dropdown.disabled).toBeFalsy();
      expect(tme_dropdown.list.length).toEqual(4);
      expect(tme_dropdown.isLoading).toBeFalsy();
      tme_dropdown.list.forEach((item, index) => {
        expect(item.name).toEqual(`raster${index}_name`);
        expect(item.url).toEqual(`raster${index}_url`);
      });

      let geojson_dropdown = toolsService.dropdowns.vectors;
      expect(geojson_dropdown.isOpen).toBeFalsy();
      expect(geojson_dropdown.disabled).toBeFalsy();
      expect(geojson_dropdown.list.length).toEqual(2);
      expect(geojson_dropdown.isLoading).toBeFalsy();
      geojson_dropdown.list.forEach((item, index) => {
        expect(item.name).toEqual(`vector${index}_name`);
        expect(item.url).toEqual(`vector${index}_url`);
      });

    });

    it('On click trigger button menu should appear', () => {
      let dropdownElement = nativeElement.querySelector("#rasters_menu");
      let button = nativeElement.querySelector("#rasters_menu button");
      let ul = nativeElement.querySelector("#rasters_menu ul");
      //before click on trigger button
      expect(dropdownElement.classList.contains("open")).toBeFalsy();
      expect(button.getAttribute('aria-expanded')).toBe('false');

      button.click();
      //after click on trigger button
      fixture.detectChanges();
      expect(dropdownElement.classList.contains("open")).toBeTruthy();
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it(`should rasters dropdown ul inlclude 4 children of items (li's)`, () => {
      let ul = nativeElement.querySelector("#rasters_menu ul");
      expect(ul.querySelectorAll("li").length).toEqual(4);
    });

    it(`should vectors dropdown ul inlclude 2 children of items (li's)`, () => {
      let ul = nativeElement.querySelector("#vectors_menu ul");
      expect(ul.querySelectorAll("li").length).toEqual(2);
    });

    it('should call onClickRasterItemOutput() | onClickRasterItemOutput  emit function when clicking on the checkboxes ', () => {
      spyOn(toolsService.onClickRasterItemOutput, 'emit');
      spyOn(toolsService.onClickVectorItemOutput, 'emit');

      let rasters_menu = nativeElement.querySelector("#rasters_menu ul");
      let tms_checkbox = rasters_menu.querySelector("li:first-child input[type='checkbox']");
      tms_checkbox.click();
      expect(toolsService.onClickRasterItemOutput.emit).toHaveBeenCalledWith({item: toolsService.dropdowns.rasters.list[0]});
      expect(toolsService.dropdowns.rasters.list[0].checked).toBeTruthy();

      tms_checkbox.click();
      expect(toolsService.onClickRasterItemOutput.emit).toHaveBeenCalledWith({item: toolsService.dropdowns.rasters.list[0]});
      expect(toolsService.dropdowns.rasters.list[0].checked).toBeFalsy();

      let vectors_menu = nativeElement.querySelector("#vectors_menu ul");
      let vector_checkbox = vectors_menu.querySelector("li:first-child input[type='checkbox']");
      vector_checkbox.click();
      expect(toolsService.onClickVectorItemOutput.emit).toHaveBeenCalledWith({item: toolsService.dropdowns.vectors.list[0]});
      expect(toolsService.dropdowns.vectors.list[0].checked).toBeTruthy();
      vector_checkbox.click();
      expect(toolsService.onClickVectorItemOutput.emit).toHaveBeenCalledWith({item: toolsService.dropdowns.vectors.list[0]});
      expect(toolsService.dropdowns.vectors.list[0].checked).toBeFalsy();
    });

    it('should display the text from the input "zoomText"', () => {
      toolsService.zoomText = 'zoom level:';
      toolsService.zoomInput = () => '2';

      fixture.detectChanges();
      let zoomView = nativeElement.querySelector("#zoom-display button");
      expect(zoomView.textContent.trim()).toEqual('zoom level: 2');
    })

});
