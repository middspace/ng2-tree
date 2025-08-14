import { Injectable } from '@angular/core';
import { NodeDraggableEvent } from './draggable.events';
import { Subject } from 'rxjs';
import * as i0 from '@angular/core';
export class NodeDraggableService {
  draggableNodeEvents$ = new Subject();
  capturedNode;
  fireNodeDragged(captured, target) {
    if (!captured.tree || captured.tree.isStatic()) {
      return;
    }
    this.draggableNodeEvents$.next(new NodeDraggableEvent(captured, target));
  }
  captureNode(node) {
    this.capturedNode = node;
  }
  getCapturedNode() {
    return this.capturedNode;
  }
  releaseCapturedNode() {
    this.capturedNode = null;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeDraggableService,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeDraggableService
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: NodeDraggableService,
  decorators: [
    {
      type: Injectable
    }
  ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1kcmFnZ2FibGUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kcmFnZ2FibGUvbm9kZS1kcmFnZ2FibGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7O0FBRy9CLE1BQU0sT0FBTyxvQkFBb0I7SUFDeEIsb0JBQW9CLEdBQWdDLElBQUksT0FBTyxFQUFzQixDQUFDO0lBRXJGLFlBQVksQ0FBZTtJQUU1QixlQUFlLENBQUMsUUFBc0IsRUFBRSxNQUFrQjtRQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRU0sV0FBVyxDQUFDLElBQWtCO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRU0sbUJBQW1CO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7d0dBdkJVLG9CQUFvQjs0R0FBcEIsb0JBQW9COzs0RkFBcEIsb0JBQW9CO2tCQURoQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudFJlZiwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDYXB0dXJlZE5vZGUgfSBmcm9tICcuL2NhcHR1cmVkLW5vZGUnO1xyXG5pbXBvcnQgeyBOb2RlRHJhZ2dhYmxlRXZlbnQgfSBmcm9tICcuL2RyYWdnYWJsZS5ldmVudHMnO1xyXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBOb2RlRHJhZ2dhYmxlU2VydmljZSB7XHJcbiAgcHVibGljIGRyYWdnYWJsZU5vZGVFdmVudHMkOiBTdWJqZWN0PE5vZGVEcmFnZ2FibGVFdmVudD4gPSBuZXcgU3ViamVjdDxOb2RlRHJhZ2dhYmxlRXZlbnQ+KCk7XHJcblxyXG4gIHByaXZhdGUgY2FwdHVyZWROb2RlOiBDYXB0dXJlZE5vZGU7XHJcblxyXG4gIHB1YmxpYyBmaXJlTm9kZURyYWdnZWQoY2FwdHVyZWQ6IENhcHR1cmVkTm9kZSwgdGFyZ2V0OiBFbGVtZW50UmVmKTogdm9pZCB7XHJcbiAgICBpZiAoIWNhcHR1cmVkLnRyZWUgfHwgY2FwdHVyZWQudHJlZS5pc1N0YXRpYygpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRyYWdnYWJsZU5vZGVFdmVudHMkLm5leHQobmV3IE5vZGVEcmFnZ2FibGVFdmVudChjYXB0dXJlZCwgdGFyZ2V0KSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FwdHVyZU5vZGUobm9kZTogQ2FwdHVyZWROb2RlKTogdm9pZCB7XHJcbiAgICB0aGlzLmNhcHR1cmVkTm9kZSA9IG5vZGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q2FwdHVyZWROb2RlKCk6IENhcHR1cmVkTm9kZSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYXB0dXJlZE5vZGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVsZWFzZUNhcHR1cmVkTm9kZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuY2FwdHVyZWROb2RlID0gbnVsbDtcclxuICB9XHJcbn1cclxuIl19
