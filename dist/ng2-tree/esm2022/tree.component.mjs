import { Component, ContentChild, EventEmitter, Inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeService } from './tree.service';
import { Tree } from './tree';
import * as i0 from '@angular/core';
import * as i1 from './tree-internal.component';
import * as i2 from './tree.service';
export class TreeComponent {
  treeService;
  static EMPTY_TREE = new Tree({ value: '' });
  /* tslint:disable:no-input-rename */
  treeModel;
  /* tslint:enable:no-input-rename */
  settings;
  nodeCreated = new EventEmitter();
  nodeRemoved = new EventEmitter();
  nodeRenamed = new EventEmitter();
  nodeSelected = new EventEmitter();
  nodeUnselected = new EventEmitter();
  nodeMoved = new EventEmitter();
  nodeExpanded = new EventEmitter();
  nodeCollapsed = new EventEmitter();
  loadNextLevel = new EventEmitter();
  nodeChecked = new EventEmitter();
  nodeUnchecked = new EventEmitter();
  menuItemSelected = new EventEmitter();
  tree;
  rootComponent;
  template;
  subscriptions = [];
  constructor(treeService) {
    this.treeService = treeService;
  }
  ngOnChanges(changes) {
    if (!this.treeModel) {
      this.tree = TreeComponent.EMPTY_TREE;
    } else {
      this.tree = new Tree(this.treeModel);
    }
  }
  ngOnInit() {
    this.subscriptions.push(
      this.treeService.nodeRemoved$.subscribe(e => {
        this.nodeRemoved.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeRenamed$.subscribe(e => {
        this.nodeRenamed.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeCreated$.subscribe(e => {
        this.nodeCreated.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeSelected$.subscribe(e => {
        this.nodeSelected.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeUnselected$.subscribe(e => {
        this.nodeUnselected.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeMoved$.subscribe(e => {
        this.nodeMoved.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeExpanded$.subscribe(e => {
        this.nodeExpanded.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeCollapsed$.subscribe(e => {
        this.nodeCollapsed.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.menuItemSelected$.subscribe(e => {
        this.menuItemSelected.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.loadNextLevel$.subscribe(e => {
        this.loadNextLevel.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeChecked$.subscribe(e => {
        this.nodeChecked.emit(e);
      })
    );
    this.subscriptions.push(
      this.treeService.nodeUnchecked$.subscribe(e => {
        this.nodeUnchecked.emit(e);
      })
    );
  }
  getController() {
    return this.rootComponent.controller;
  }
  getControllerByNodeId(id) {
    return this.treeService.getController(id);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub && sub.unsubscribe());
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeComponent,
    deps: [{ token: TreeService }],
    target: i0.ɵɵFactoryTarget.Component
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '16.2.12',
    type: TreeComponent,
    selector: 'tree',
    inputs: { treeModel: ['tree', 'treeModel'], settings: 'settings' },
    outputs: {
      nodeCreated: 'nodeCreated',
      nodeRemoved: 'nodeRemoved',
      nodeRenamed: 'nodeRenamed',
      nodeSelected: 'nodeSelected',
      nodeUnselected: 'nodeUnselected',
      nodeMoved: 'nodeMoved',
      nodeExpanded: 'nodeExpanded',
      nodeCollapsed: 'nodeCollapsed',
      loadNextLevel: 'loadNextLevel',
      nodeChecked: 'nodeChecked',
      nodeUnchecked: 'nodeUnchecked',
      menuItemSelected: 'menuItemSelected'
    },
    providers: [TreeService],
    queries: [{ propertyName: 'template', first: true, predicate: TemplateRef, descendants: true }],
    viewQueries: [{ propertyName: 'rootComponent', first: true, predicate: ['rootComponent'], descendants: true }],
    usesOnChanges: true,
    ngImport: i0,
    template: `<tree-internal #rootComponent [tree]="tree" [settings]="settings" [template]="template"></tree-internal>`,
    isInline: true,
    dependencies: [
      {
        kind: 'component',
        type: i1.TreeInternalComponent,
        selector: 'tree-internal',
        inputs: ['tree', 'settings', 'template']
      }
    ]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: TreeComponent,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'tree',
          template: `<tree-internal #rootComponent [tree]="tree" [settings]="settings" [template]="template"></tree-internal>`,
          providers: [TreeService]
        }
      ]
    }
  ],
  ctorParameters: function() {
    return [
      {
        type: i2.TreeService,
        decorators: [
          {
            type: Inject,
            args: [TreeService]
          }
        ]
      }
    ];
  },
  propDecorators: {
    treeModel: [
      {
        type: Input,
        args: ['tree']
      }
    ],
    settings: [
      {
        type: Input
      }
    ],
    nodeCreated: [
      {
        type: Output
      }
    ],
    nodeRemoved: [
      {
        type: Output
      }
    ],
    nodeRenamed: [
      {
        type: Output
      }
    ],
    nodeSelected: [
      {
        type: Output
      }
    ],
    nodeUnselected: [
      {
        type: Output
      }
    ],
    nodeMoved: [
      {
        type: Output
      }
    ],
    nodeExpanded: [
      {
        type: Output
      }
    ],
    nodeCollapsed: [
      {
        type: Output
      }
    ],
    loadNextLevel: [
      {
        type: Output
      }
    ],
    nodeChecked: [
      {
        type: Output
      }
    ],
    nodeUnchecked: [
      {
        type: Output
      }
    ],
    menuItemSelected: [
      {
        type: Output
      }
    ],
    rootComponent: [
      {
        type: ViewChild,
        args: ['rootComponent', { static: false }]
      }
    ],
    template: [
      {
        type: ContentChild,
        args: [TemplateRef, { static: false }]
      }
    ]
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJlZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsTUFBTSxFQUVOLFdBQVcsRUFDWCxTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUM7Ozs7QUFTOUIsTUFBTSxPQUFPLGFBQWE7SUEyQ3dCO0lBMUN4QyxNQUFNLENBQUMsVUFBVSxHQUFTLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFMUQsb0NBQW9DO0lBQ2QsU0FBUyxDQUFzQjtJQUNyRCxtQ0FBbUM7SUFFbkIsUUFBUSxDQUE0QjtJQUVuQyxXQUFXLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFFcEQsV0FBVyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBRXBELFdBQVcsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUVwRCxZQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFFckQsY0FBYyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBRXZELFNBQVMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUVsRCxZQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFFckQsYUFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBRXRELGFBQWEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUV0RCxXQUFXLEdBQW1DLElBQUksWUFBWSxFQUFFLENBQUM7SUFFakUsYUFBYSxHQUFxQyxJQUFJLFlBQVksRUFBRSxDQUFDO0lBRXJFLGdC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QUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO3dHQXpJVSxhQUFhLGtCQTJDRyxXQUFXOzRGQTNDM0IsYUFBYSw0ZEFGYixDQUFDLFdBQVcsQ0FBQyxnRUF3Q1YsV0FBVyxxTEF6Q2YsMEdBQTBHOzs0RkFHekcsYUFBYTtrQkFMekIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsTUFBTTtvQkFDaEIsUUFBUSxFQUFFLDBHQUEwRztvQkFDcEgsU0FBUyxFQUFFLENBQUMsV0FBVyxDQUFDO2lCQUN6Qjs7MEJBNENxQixNQUFNOzJCQUFDLFdBQVc7NENBdkNoQixTQUFTO3NCQUE5QixLQUFLO3VCQUFDLE1BQU07Z0JBR0csUUFBUTtzQkFBdkIsS0FBSztnQkFFVyxXQUFXO3NCQUEzQixNQUFNO2dCQUVVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFFVSxZQUFZO3NCQUE1QixNQUFNO2dCQUVVLGNBQWM7c0JBQTlCLE1BQU07Z0JBRVUsU0FBUztzQkFBekIsTUFBTTtnQkFFVSxZQUFZO3NCQUE1QixNQUFNO2dCQUVVLGFBQWE7c0JBQTdCLE1BQU07Z0JBRVUsYUFBYTtzQkFBN0IsTUFBTTtnQkFFVSxXQUFXO3NCQUEzQixNQUFNO2dCQUVVLGFBQWE7c0JBQTdCLE1BQU07Z0JBRVUsZ0JBQWdCO3NCQUFoQyxNQUFNO2dCQUtBLGFBQWE7c0JBRG5CLFNBQVM7dUJBQUMsZUFBZSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTtnQkFJdEMsUUFBUTtzQkFEZCxZQUFZO3VCQUFDLFdBQVcsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCxcclxuICBDb250ZW50Q2hpbGQsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBPdXRwdXQsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBUZW1wbGF0ZVJlZixcclxuICBWaWV3Q2hpbGRcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVHJlZVNlcnZpY2UgfSBmcm9tICcuL3RyZWUuc2VydmljZSc7XHJcbmltcG9ydCAqIGFzIFRyZWVUeXBlcyBmcm9tICcuL3RyZWUudHlwZXMnO1xyXG5cclxuaW1wb3J0IHsgTWVudUl0ZW1TZWxlY3RlZEV2ZW50LCBOb2RlQ2hlY2tlZEV2ZW50LCBOb2RlRXZlbnQsIE5vZGVVbmNoZWNrZWRFdmVudCB9IGZyb20gJy4vdHJlZS5ldmVudHMnO1xyXG5cclxuaW1wb3J0IHsgVHJlZSB9IGZyb20gJy4vdHJlZSc7XHJcbmltcG9ydCB7IFRyZWVDb250cm9sbGVyIH0gZnJvbSAnLi90cmVlLWNvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAndHJlZScsXHJcbiAgdGVtcGxhdGU6IGA8dHJlZS1pbnRlcm5hbCAjcm9vdENvbXBvbmVudCBbdHJlZV09XCJ0cmVlXCIgW3NldHRpbmdzXT1cInNldHRpbmdzXCIgW3RlbXBsYXRlXT1cInRlbXBsYXRlXCI+PC90cmVlLWludGVybmFsPmAsXHJcbiAgcHJvdmlkZXJzOiBbVHJlZVNlcnZpY2VdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUcmVlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgRU1QVFlfVFJFRTogVHJlZSA9IG5ldyBUcmVlKHsgdmFsdWU6ICcnIH0pO1xyXG5cclxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1pbnB1dC1yZW5hbWUgKi9cclxuICBASW5wdXQoJ3RyZWUnKSBwdWJsaWMgdHJlZU1vZGVsOiBUcmVlVHlwZXMuVHJlZU1vZGVsO1xyXG4gIC8qIHRzbGludDplbmFibGU6bm8taW5wdXQtcmVuYW1lICovXHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBzZXR0aW5nczogVHJlZVR5cGVzLk5nMlRyZWVTZXR0aW5ncztcclxuXHJcbiAgQE91dHB1dCgpIHB1YmxpYyBub2RlQ3JlYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIEBPdXRwdXQoKSBwdWJsaWMgbm9kZVJlbW92ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBAT3V0cHV0KCkgcHVibGljIG5vZGVSZW5hbWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQE91dHB1dCgpIHB1YmxpYyBub2RlU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBAT3V0cHV0KCkgcHVibGljIG5vZGVVbnNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQE91dHB1dCgpIHB1YmxpYyBub2RlTW92ZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBAT3V0cHV0KCkgcHVibGljIG5vZGVFeHBhbmRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIEBPdXRwdXQoKSBwdWJsaWMgbm9kZUNvbGxhcHNlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIEBPdXRwdXQoKSBwdWJsaWMgbG9hZE5leHRMZXZlbDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIEBPdXRwdXQoKSBwdWJsaWMgbm9kZUNoZWNrZWQ6IEV2ZW50RW1pdHRlcjxOb2RlQ2hlY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQE91dHB1dCgpIHB1YmxpYyBub2RlVW5jaGVja2VkOiBFdmVudEVtaXR0ZXI8Tm9kZVVuY2hlY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQE91dHB1dCgpIHB1YmxpYyBtZW51SXRlbVNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgcHVibGljIHRyZWU6IFRyZWU7XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3Jvb3RDb21wb25lbnQnLCB7IHN0YXRpYzogZmFsc2UgfSlcclxuICBwdWJsaWMgcm9vdENvbXBvbmVudDtcclxuXHJcbiAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZiwgeyBzdGF0aWM6IGZhbHNlIH0pXHJcbiAgcHVibGljIHRlbXBsYXRlO1xyXG5cclxuICBwcml2YXRlIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbltdID0gW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihASW5qZWN0KFRyZWVTZXJ2aWNlKSBwcml2YXRlIHRyZWVTZXJ2aWNlOiBUcmVlU2VydmljZSkge31cclxuXHJcbiAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy50cmVlTW9kZWwpIHtcclxuICAgICAgdGhpcy50cmVlID0gVHJlZUNvbXBvbmVudC5FTVBUWV9UUkVFO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy50cmVlID0gbmV3IFRyZWUodGhpcy50cmVlTW9kZWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHRoaXMudHJlZVNlcnZpY2Uubm9kZVJlbW92ZWQkLnN1YnNjcmliZSgoZTogTm9kZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgdGhpcy5ub2RlUmVtb3ZlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5ub2RlUmVuYW1lZCQuc3Vic2NyaWJlKChlOiBOb2RlRXZlbnQpID0+IHtcclxuICAgICAgICB0aGlzLm5vZGVSZW5hbWVkLmVtaXQoZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLm5vZGVDcmVhdGVkJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZUNyZWF0ZWQuZW1pdChlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHRoaXMudHJlZVNlcnZpY2Uubm9kZVNlbGVjdGVkJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZVNlbGVjdGVkLmVtaXQoZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLm5vZGVVbnNlbGVjdGVkJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZVVuc2VsZWN0ZWQuZW1pdChlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHRoaXMudHJlZVNlcnZpY2Uubm9kZU1vdmVkJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZU1vdmVkLmVtaXQoZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLm5vZGVFeHBhbmRlZCQuc3Vic2NyaWJlKChlOiBOb2RlRXZlbnQpID0+IHtcclxuICAgICAgICB0aGlzLm5vZGVFeHBhbmRlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5ub2RlQ29sbGFwc2VkJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZUNvbGxhcHNlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5tZW51SXRlbVNlbGVjdGVkJC5zdWJzY3JpYmUoKGU6IE1lbnVJdGVtU2VsZWN0ZWRFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubWVudUl0ZW1TZWxlY3RlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5sb2FkTmV4dExldmVsJC5zdWJzY3JpYmUoKGU6IE5vZGVFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubG9hZE5leHRMZXZlbC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5ub2RlQ2hlY2tlZCQuc3Vic2NyaWJlKChlOiBOb2RlQ2hlY2tlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgdGhpcy5ub2RlQ2hlY2tlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5ub2RlVW5jaGVja2VkJC5zdWJzY3JpYmUoKGU6IE5vZGVVbmNoZWNrZWRFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMubm9kZVVuY2hlY2tlZC5lbWl0KGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb250cm9sbGVyKCk6IFRyZWVDb250cm9sbGVyIHtcclxuICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQuY29udHJvbGxlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb250cm9sbGVyQnlOb2RlSWQoaWQ6IG51bWJlciB8IHN0cmluZyk6IFRyZWVDb250cm9sbGVyIHtcclxuICAgIHJldHVybiB0aGlzLnRyZWVTZXJ2aWNlLmdldENvbnRyb2xsZXIoaWQpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZm9yRWFjaChzdWIgPT4gc3ViICYmIHN1Yi51bnN1YnNjcmliZSgpKTtcclxuICB9XHJcbn1cclxuIl19
