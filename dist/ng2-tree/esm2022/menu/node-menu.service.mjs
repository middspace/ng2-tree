import { Injectable } from '@angular/core';
import { NodeMenuAction } from './menu.events';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as i0 from '@angular/core';
export class NodeMenuService {
  nodeMenuEvents$ = new Subject();
  fireMenuEvent(sender, action) {
    const nodeMenuEvent = { sender, action };
    this.nodeMenuEvents$.next(nodeMenuEvent);
  }
  hideMenuStream(treeElementRef) {
    return this.nodeMenuEvents$.pipe(
      filter(e => treeElementRef.nativeElement !== e.sender),
      filter(e => e.action === NodeMenuAction.Close)
    );
  }
  hideMenuForAllNodesExcept(treeElementRef) {
    this.nodeMenuEvents$.next({
      sender: treeElementRef.nativeElement,
      action: NodeMenuAction.Close
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeMenuService,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeMenuService
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: NodeMenuService,
  decorators: [
    {
      type: Injectable
    }
  ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1tZW51LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9ub2RlLW1lbnUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDOztBQUd4QyxNQUFNLE9BQU8sZUFBZTtJQUNuQixlQUFlLEdBQTJCLElBQUksT0FBTyxFQUFpQixDQUFDO0lBRXZFLGFBQWEsQ0FBQyxNQUFtQixFQUFFLE1BQXNCO1FBQzlELE1BQU0sYUFBYSxHQUFrQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sY0FBYyxDQUFDLGNBQTBCO1FBQzlDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQWdCLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUN2RSxNQUFNLENBQUMsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FDaEUsQ0FBQztJQUNKLENBQUM7SUFFTSx5QkFBeUIsQ0FBQyxjQUEwQjtRQUN6RCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztZQUN4QixNQUFNLEVBQUUsY0FBYyxDQUFDLGFBQWE7WUFDcEMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxLQUFLO1NBQzdCLENBQUMsQ0FBQztJQUNMLENBQUM7d0dBcEJVLGVBQWU7NEdBQWYsZUFBZTs7NEZBQWYsZUFBZTtrQkFEM0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTm9kZU1lbnVBY3Rpb24sIE5vZGVNZW51RXZlbnQgfSBmcm9tICcuL21lbnUuZXZlbnRzJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBOb2RlTWVudVNlcnZpY2Uge1xyXG4gIHB1YmxpYyBub2RlTWVudUV2ZW50cyQ6IFN1YmplY3Q8Tm9kZU1lbnVFdmVudD4gPSBuZXcgU3ViamVjdDxOb2RlTWVudUV2ZW50PigpO1xyXG5cclxuICBwdWJsaWMgZmlyZU1lbnVFdmVudChzZW5kZXI6IEhUTUxFbGVtZW50LCBhY3Rpb246IE5vZGVNZW51QWN0aW9uKTogdm9pZCB7XHJcbiAgICBjb25zdCBub2RlTWVudUV2ZW50OiBOb2RlTWVudUV2ZW50ID0geyBzZW5kZXIsIGFjdGlvbiB9O1xyXG4gICAgdGhpcy5ub2RlTWVudUV2ZW50cyQubmV4dChub2RlTWVudUV2ZW50KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoaWRlTWVudVN0cmVhbSh0cmVlRWxlbWVudFJlZjogRWxlbWVudFJlZik6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlTWVudUV2ZW50cyQucGlwZShcclxuICAgICAgZmlsdGVyKChlOiBOb2RlTWVudUV2ZW50KSA9PiB0cmVlRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ICE9PSBlLnNlbmRlciksXHJcbiAgICAgIGZpbHRlcigoZTogTm9kZU1lbnVFdmVudCkgPT4gZS5hY3Rpb24gPT09IE5vZGVNZW51QWN0aW9uLkNsb3NlKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoaWRlTWVudUZvckFsbE5vZGVzRXhjZXB0KHRyZWVFbGVtZW50UmVmOiBFbGVtZW50UmVmKTogdm9pZCB7XHJcbiAgICB0aGlzLm5vZGVNZW51RXZlbnRzJC5uZXh0KHtcclxuICAgICAgc2VuZGVyOiB0cmVlRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxyXG4gICAgICBhY3Rpb246IE5vZGVNZW51QWN0aW9uLkNsb3NlXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19
