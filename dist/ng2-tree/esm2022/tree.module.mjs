import './rxjs-imports';
import { NgModule } from '@angular/core';
import { TreeComponent } from './tree.component';
import { TreeInternalComponent } from './tree-internal.component';
import { CommonModule } from '@angular/common';
import { NodeDraggableDirective } from './draggable/node-draggable.directive';
import { NodeDraggableService } from './draggable/node-draggable.service';
import { NodeEditableDirective } from './editable/node-editable.directive';
import { NodeMenuComponent } from './menu/node-menu.component';
import { NodeMenuService } from './menu/node-menu.service';
import { TreeService } from './tree.service';
import { SafeHtmlPipe } from './utils/safe-html.pipe';
import * as i0 from '@angular/core';
export class TreeModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeModule,
    declarations: [
      NodeDraggableDirective,
      TreeComponent,
      NodeEditableDirective,
      NodeMenuComponent,
      TreeInternalComponent,
      SafeHtmlPipe
    ],
    imports: [CommonModule],
    exports: [TreeComponent]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeModule,
    providers: [NodeDraggableService, NodeMenuService, TreeService],
    imports: [CommonModule]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: TreeModule,
  decorators: [
    {
      type: NgModule,
      args: [
        {
          imports: [CommonModule],
          declarations: [
            NodeDraggableDirective,
            TreeComponent,
            NodeEditableDirective,
            NodeMenuComponent,
            TreeInternalComponent,
            SafeHtmlPipe
          ],
          exports: [TreeComponent],
          providers: [NodeDraggableService, NodeMenuService, TreeService]
        }
      ]
    }
  ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJlZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDMUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7O0FBZXRELE1BQU0sT0FBTyxVQUFVO3dHQUFWLFVBQVU7eUdBQVYsVUFBVSxpQkFWbkIsc0JBQXNCO1lBQ3RCLGFBQWE7WUFDYixxQkFBcUI7WUFDckIsaUJBQWlCO1lBQ2pCLHFCQUFxQjtZQUNyQixZQUFZLGFBUEosWUFBWSxhQVNaLGFBQWE7eUdBR1osVUFBVSxhQUZWLENBQUMsb0JBQW9CLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQyxZQVZyRCxZQUFZOzs0RkFZWCxVQUFVO2tCQWJ0QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFDdkIsWUFBWSxFQUFFO3dCQUNaLHNCQUFzQjt3QkFDdEIsYUFBYTt3QkFDYixxQkFBcUI7d0JBQ3JCLGlCQUFpQjt3QkFDakIscUJBQXFCO3dCQUNyQixZQUFZO3FCQUNiO29CQUNELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztvQkFDeEIsU0FBUyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQztpQkFDaEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vcnhqcy1pbXBvcnRzJztcclxuXHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFRyZWVDb21wb25lbnQgfSBmcm9tICcuL3RyZWUuY29tcG9uZW50JztcclxuaW1wb3J0IHsgVHJlZUludGVybmFsQ29tcG9uZW50IH0gZnJvbSAnLi90cmVlLWludGVybmFsLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE5vZGVEcmFnZ2FibGVEaXJlY3RpdmUgfSBmcm9tICcuL2RyYWdnYWJsZS9ub2RlLWRyYWdnYWJsZS5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBOb2RlRHJhZ2dhYmxlU2VydmljZSB9IGZyb20gJy4vZHJhZ2dhYmxlL25vZGUtZHJhZ2dhYmxlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBOb2RlRWRpdGFibGVEaXJlY3RpdmUgfSBmcm9tICcuL2VkaXRhYmxlL25vZGUtZWRpdGFibGUuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgTm9kZU1lbnVDb21wb25lbnQgfSBmcm9tICcuL21lbnUvbm9kZS1tZW51LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IE5vZGVNZW51U2VydmljZSB9IGZyb20gJy4vbWVudS9ub2RlLW1lbnUuc2VydmljZSc7XHJcbmltcG9ydCB7IFRyZWVTZXJ2aWNlIH0gZnJvbSAnLi90cmVlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTYWZlSHRtbFBpcGUgfSBmcm9tICcuL3V0aWxzL3NhZmUtaHRtbC5waXBlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBOb2RlRHJhZ2dhYmxlRGlyZWN0aXZlLFxyXG4gICAgVHJlZUNvbXBvbmVudCxcclxuICAgIE5vZGVFZGl0YWJsZURpcmVjdGl2ZSxcclxuICAgIE5vZGVNZW51Q29tcG9uZW50LFxyXG4gICAgVHJlZUludGVybmFsQ29tcG9uZW50LFxyXG4gICAgU2FmZUh0bWxQaXBlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbVHJlZUNvbXBvbmVudF0sXHJcbiAgcHJvdmlkZXJzOiBbTm9kZURyYWdnYWJsZVNlcnZpY2UsIE5vZGVNZW51U2VydmljZSwgVHJlZVNlcnZpY2VdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUcmVlTW9kdWxlIHt9XHJcbiJdfQ==
