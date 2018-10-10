/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { ToolsService } from './tools.service';
import { HelperService } from '../helper.service';
import { HelperServiceMock } from '../../test';
import { HttpModule } from '@angular/http';
import { AnimationHelperService } from '../animation-helper.service';

describe('Service: Tools', () => {
  let toolsService: ToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [ToolsService, { provide: HelperService, useClass: HelperServiceMock }, AnimationHelperService]
    });
  });

  beforeEach(inject([ToolsService], (_toolsService: ToolsService) => {
    toolsService = _toolsService;
  }));

  it('should toolsService be defined', () => {
    expect(toolsService).toBeDefined();
  });

  it('should destroySubscribers() call 3 unsubscriber() functions', () => {
    toolsService.onClickRasterItemSubscriber = toolsService.onClickRasterItemOutput.subscribe();
    toolsService.onClickVectorItemSubscriber = toolsService.onClickVectorItemOutput.subscribe();
    toolsService.flyToLayerSubscriber = toolsService.flyToLayerOutput.subscribe();

    spyOn(toolsService.onClickRasterItemSubscriber, 'unsubscribe');
    spyOn(toolsService.onClickVectorItemSubscriber, 'unsubscribe');
    spyOn(toolsService.flyToLayerSubscriber, 'unsubscribe');

    toolsService.destroySubscribers();

    expect(toolsService.onClickRasterItemSubscriber.unsubscribe).toHaveBeenCalled();
    expect(toolsService.onClickVectorItemSubscriber.unsubscribe).toHaveBeenCalled();
    expect(toolsService.flyToLayerSubscriber.unsubscribe).toHaveBeenCalled();


  });


});
