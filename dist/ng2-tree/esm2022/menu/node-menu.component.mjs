import { Component, EventEmitter, Inject, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { NodeMenuService } from './node-menu.service';
import { NodeMenuAction, NodeMenuItemAction } from './menu.events';
import { isEscapePressed, isLeftButtonClicked } from '../utils/event.utils';
import * as i0 from '@angular/core';
import * as i1 from '@angular/common';
import * as i2 from './node-menu.service';
export class NodeMenuComponent {
  renderer;
  nodeMenuService;
  menuItemSelected = new EventEmitter();
  menuItems;
  menuContainer;
  availableMenuItems = [
    {
      name: 'New tag',
      action: NodeMenuItemAction.NewTag,
      cssClass: 'new-tag'
    },
    {
      name: 'New folder',
      action: NodeMenuItemAction.NewFolder,
      cssClass: 'new-folder'
    },
    {
      name: 'Rename',
      action: NodeMenuItemAction.Rename,
      cssClass: 'rename'
    },
    {
      name: 'Remove',
      action: NodeMenuItemAction.Remove,
      cssClass: 'remove'
    }
  ];
  disposersForGlobalListeners = [];
  constructor(renderer, nodeMenuService) {
    this.renderer = renderer;
    this.nodeMenuService = nodeMenuService;
  }
  ngOnInit() {
    this.availableMenuItems = this.menuItems || this.availableMenuItems;
    this.disposersForGlobalListeners.push(this.renderer.listen('document', 'keyup', this.closeMenu.bind(this)));
    this.disposersForGlobalListeners.push(this.renderer.listen('document', 'mousedown', this.closeMenu.bind(this)));
  }
  ngOnDestroy() {
    this.disposersForGlobalListeners.forEach(dispose => dispose());
  }
  onMenuItemSelected(e, selectedMenuItem) {
    if (isLeftButtonClicked(e)) {
      this.menuItemSelected.emit({
        nodeMenuItemAction: selectedMenuItem.action,
        nodeMenuItemSelected: selectedMenuItem.name
      });
      this.nodeMenuService.fireMenuEvent(e.target, NodeMenuAction.Close);
    }
  }
  closeMenu(e) {
    const mouseClicked = e instanceof MouseEvent;
    // Check if the click is fired on an element inside a menu
    const containingTarget =
      this.menuContainer.nativeElement !== e.target && this.menuContainer.nativeElement.contains(e.target);
    if ((mouseClicked && !containingTarget) || isEscapePressed(e)) {
      this.nodeMenuService.fireMenuEvent(e.target, NodeMenuAction.Close);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeMenuComponent,
    deps: [{ token: Renderer2 }, { token: NodeMenuService }],
    target: i0.ɵɵFactoryTarget.Component
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '16.2.12',
    type: NodeMenuComponent,
    selector: 'node-menu',
    inputs: { menuItems: 'menuItems' },
    outputs: { menuItemSelected: 'menuItemSelected' },
    viewQueries: [{ propertyName: 'menuContainer', first: true, predicate: ['menuContainer'], descendants: true }],
    ngImport: i0,
    template: `
    <div class="node-menu">
      <ul class="node-menu-content" #menuContainer>
        <li class="node-menu-item" *ngFor="let menuItem of availableMenuItems"
          (click)="onMenuItemSelected($event, menuItem)">
          <div class="node-menu-item-icon {{menuItem.cssClass}}"></div>
          <span class="node-menu-item-value">{{menuItem.name}}</span>
        </li>
      </ul>
    </div>
  `,
    isInline: true,
    dependencies: [
      {
        kind: 'directive',
        type: i1.NgForOf,
        selector: '[ngFor][ngForOf]',
        inputs: ['ngForOf', 'ngForTrackBy', 'ngForTemplate']
      }
    ]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: NodeMenuComponent,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'node-menu',
          template: `
    <div class="node-menu">
      <ul class="node-menu-content" #menuContainer>
        <li class="node-menu-item" *ngFor="let menuItem of availableMenuItems"
          (click)="onMenuItemSelected($event, menuItem)">
          <div class="node-menu-item-icon {{menuItem.cssClass}}"></div>
          <span class="node-menu-item-value">{{menuItem.name}}</span>
        </li>
      </ul>
    </div>
  `
        }
      ]
    }
  ],
  ctorParameters: function() {
    return [
      {
        type: i0.Renderer2,
        decorators: [
          {
            type: Inject,
            args: [Renderer2]
          }
        ]
      },
      {
        type: i2.NodeMenuService,
        decorators: [
          {
            type: Inject,
            args: [NodeMenuService]
          }
        ]
      }
    ];
  },
  propDecorators: {
    menuItemSelected: [
      {
        type: Output
      }
    ],
    menuItems: [
      {
        type: Input
      }
    ],
    menuContainer: [
      {
        type: ViewChild,
        args: ['menuContainer', { static: false }]
      }
    ]
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1tZW51LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tZW51L25vZGUtbWVudS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEgsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQTZCLE1BQU0sZUFBZSxDQUFDO0FBQzlGLE9BQU8sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7OztBQWdCNUUsTUFBTSxPQUFPLGlCQUFpQjtJQW1DQztJQUNNO0lBbEM1QixnQkFBZ0IsR0FBNEMsSUFBSSxZQUFZLEVBQTZCLENBQUM7SUFFakcsU0FBUyxDQUFpQjtJQUduQyxhQUFhLENBQU07SUFFbkIsa0JBQWtCLEdBQW1CO1FBQzFDO1lBQ0UsSUFBSSxFQUFFLFNBQVM7WUFDZixNQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTTtZQUNqQyxRQUFRLEVBQUUsU0FBUztTQUNwQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFlBQVk7WUFDbEIsTUFBTSxFQUFFLGtCQUFrQixDQUFDLFNBQVM7WUFDcEMsUUFBUSxFQUFFLFlBQVk7U0FDdkI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU07WUFDakMsUUFBUSxFQUFFLFFBQVE7U0FDbkI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU07WUFDakMsUUFBUSxFQUFFLFFBQVE7U0FDbkI7S0FDRixDQUFDO0lBRU0sMkJBQTJCLEdBQW1CLEVBQUUsQ0FBQztJQUV6RCxZQUM2QixRQUFtQixFQUNiLGVBQWdDO1FBRHRDLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDYixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7SUFDaEUsQ0FBQztJQUVHLFFBQVE7UUFDYixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDcEUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xILENBQUM7SUFFTSxXQUFXO1FBQ2hCLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFtQixFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxDQUFhLEVBQUUsZ0JBQThCO1FBQ3JFLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQztnQkFDekIsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtnQkFDM0Msb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsSUFBSTthQUM1QyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBcUIsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkY7SUFDSCxDQUFDO0lBRU8sU0FBUyxDQUFDLENBQTZCO1FBQzdDLE1BQU0sWUFBWSxHQUFHLENBQUMsWUFBWSxVQUFVLENBQUM7UUFDN0MsMERBQTBEO1FBQzFELE1BQU0sZ0JBQWdCLEdBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2RyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBa0IsQ0FBQyxFQUFFO1lBQzlFLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFxQixFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuRjtJQUNILENBQUM7d0dBckVVLGlCQUFpQixrQkFtQ2xCLFNBQVMsYUFDVCxlQUFlOzRGQXBDZCxpQkFBaUIsd1BBWmxCOzs7Ozs7Ozs7O0dBVVQ7OzRGQUVVLGlCQUFpQjtrQkFkN0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsV0FBVztvQkFDckIsUUFBUSxFQUFFOzs7Ozs7Ozs7O0dBVVQ7aUJBQ0Y7OzBCQW9DSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUNoQixNQUFNOzJCQUFDLGVBQWU7NENBbENsQixnQkFBZ0I7c0JBRHRCLE1BQU07Z0JBR1MsU0FBUztzQkFBeEIsS0FBSztnQkFHQyxhQUFhO3NCQURuQixTQUFTO3VCQUFDLGVBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCwgUmVuZGVyZXIyLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTm9kZU1lbnVTZXJ2aWNlIH0gZnJvbSAnLi9ub2RlLW1lbnUuc2VydmljZSc7XHJcbmltcG9ydCB7IE5vZGVNZW51QWN0aW9uLCBOb2RlTWVudUl0ZW1BY3Rpb24sIE5vZGVNZW51SXRlbVNlbGVjdGVkRXZlbnQgfSBmcm9tICcuL21lbnUuZXZlbnRzJztcclxuaW1wb3J0IHsgaXNFc2NhcGVQcmVzc2VkLCBpc0xlZnRCdXR0b25DbGlja2VkIH0gZnJvbSAnLi4vdXRpbHMvZXZlbnQudXRpbHMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdub2RlLW1lbnUnLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8ZGl2IGNsYXNzPVwibm9kZS1tZW51XCI+XHJcbiAgICAgIDx1bCBjbGFzcz1cIm5vZGUtbWVudS1jb250ZW50XCIgI21lbnVDb250YWluZXI+XHJcbiAgICAgICAgPGxpIGNsYXNzPVwibm9kZS1tZW51LWl0ZW1cIiAqbmdGb3I9XCJsZXQgbWVudUl0ZW0gb2YgYXZhaWxhYmxlTWVudUl0ZW1zXCJcclxuICAgICAgICAgIChjbGljayk9XCJvbk1lbnVJdGVtU2VsZWN0ZWQoJGV2ZW50LCBtZW51SXRlbSlcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJub2RlLW1lbnUtaXRlbS1pY29uIHt7bWVudUl0ZW0uY3NzQ2xhc3N9fVwiPjwvZGl2PlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJub2RlLW1lbnUtaXRlbS12YWx1ZVwiPnt7bWVudUl0ZW0ubmFtZX19PC9zcGFuPlxyXG4gICAgICAgIDwvbGk+XHJcbiAgICAgIDwvdWw+XHJcbiAgICA8L2Rpdj5cclxuICBgXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOb2RlTWVudUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBAT3V0cHV0KClcclxuICBwdWJsaWMgbWVudUl0ZW1TZWxlY3RlZDogRXZlbnRFbWl0dGVyPE5vZGVNZW51SXRlbVNlbGVjdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxOb2RlTWVudUl0ZW1TZWxlY3RlZEV2ZW50PigpO1xyXG5cclxuICBASW5wdXQoKSBwdWJsaWMgbWVudUl0ZW1zOiBOb2RlTWVudUl0ZW1bXTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnbWVudUNvbnRhaW5lcicsIHsgc3RhdGljOiBmYWxzZSB9KVxyXG4gIHB1YmxpYyBtZW51Q29udGFpbmVyOiBhbnk7XHJcblxyXG4gIHB1YmxpYyBhdmFpbGFibGVNZW51SXRlbXM6IE5vZGVNZW51SXRlbVtdID0gW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiAnTmV3IHRhZycsXHJcbiAgICAgIGFjdGlvbjogTm9kZU1lbnVJdGVtQWN0aW9uLk5ld1RhZyxcclxuICAgICAgY3NzQ2xhc3M6ICduZXctdGFnJ1xyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ05ldyBmb2xkZXInLFxyXG4gICAgICBhY3Rpb246IE5vZGVNZW51SXRlbUFjdGlvbi5OZXdGb2xkZXIsXHJcbiAgICAgIGNzc0NsYXNzOiAnbmV3LWZvbGRlcidcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdSZW5hbWUnLFxyXG4gICAgICBhY3Rpb246IE5vZGVNZW51SXRlbUFjdGlvbi5SZW5hbWUsXHJcbiAgICAgIGNzc0NsYXNzOiAncmVuYW1lJ1xyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ1JlbW92ZScsXHJcbiAgICAgIGFjdGlvbjogTm9kZU1lbnVJdGVtQWN0aW9uLlJlbW92ZSxcclxuICAgICAgY3NzQ2xhc3M6ICdyZW1vdmUnXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBkaXNwb3NlcnNGb3JHbG9iYWxMaXN0ZW5lcnM6ICgoKSA9PiB2b2lkKVtdID0gW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIEBJbmplY3QoUmVuZGVyZXIyKSBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXHJcbiAgICBASW5qZWN0KE5vZGVNZW51U2VydmljZSkgcHJpdmF0ZSBub2RlTWVudVNlcnZpY2U6IE5vZGVNZW51U2VydmljZVxyXG4gICkge31cclxuXHJcbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5hdmFpbGFibGVNZW51SXRlbXMgPSB0aGlzLm1lbnVJdGVtcyB8fCB0aGlzLmF2YWlsYWJsZU1lbnVJdGVtcztcclxuICAgIHRoaXMuZGlzcG9zZXJzRm9yR2xvYmFsTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ2tleXVwJywgdGhpcy5jbG9zZU1lbnUuYmluZCh0aGlzKSkpO1xyXG4gICAgdGhpcy5kaXNwb3NlcnNGb3JHbG9iYWxMaXN0ZW5lcnMucHVzaCh0aGlzLnJlbmRlcmVyLmxpc3RlbignZG9jdW1lbnQnLCAnbW91c2Vkb3duJywgdGhpcy5jbG9zZU1lbnUuYmluZCh0aGlzKSkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlcnNGb3JHbG9iYWxMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZTogKCkgPT4gdm9pZCkgPT4gZGlzcG9zZSgpKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbk1lbnVJdGVtU2VsZWN0ZWQoZTogTW91c2VFdmVudCwgc2VsZWN0ZWRNZW51SXRlbTogTm9kZU1lbnVJdGVtKTogdm9pZCB7XHJcbiAgICBpZiAoaXNMZWZ0QnV0dG9uQ2xpY2tlZChlKSkge1xyXG4gICAgICB0aGlzLm1lbnVJdGVtU2VsZWN0ZWQuZW1pdCh7XHJcbiAgICAgICAgbm9kZU1lbnVJdGVtQWN0aW9uOiBzZWxlY3RlZE1lbnVJdGVtLmFjdGlvbixcclxuICAgICAgICBub2RlTWVudUl0ZW1TZWxlY3RlZDogc2VsZWN0ZWRNZW51SXRlbS5uYW1lXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5ub2RlTWVudVNlcnZpY2UuZmlyZU1lbnVFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCwgTm9kZU1lbnVBY3Rpb24uQ2xvc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjbG9zZU1lbnUoZTogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG1vdXNlQ2xpY2tlZCA9IGUgaW5zdGFuY2VvZiBNb3VzZUV2ZW50O1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGNsaWNrIGlzIGZpcmVkIG9uIGFuIGVsZW1lbnQgaW5zaWRlIGEgbWVudVxyXG4gICAgY29uc3QgY29udGFpbmluZ1RhcmdldCA9XHJcbiAgICAgIHRoaXMubWVudUNvbnRhaW5lci5uYXRpdmVFbGVtZW50ICE9PSBlLnRhcmdldCAmJiB0aGlzLm1lbnVDb250YWluZXIubmF0aXZlRWxlbWVudC5jb250YWlucyhlLnRhcmdldCk7XHJcblxyXG4gICAgaWYgKChtb3VzZUNsaWNrZWQgJiYgIWNvbnRhaW5pbmdUYXJnZXQpIHx8IGlzRXNjYXBlUHJlc3NlZChlIGFzIEtleWJvYXJkRXZlbnQpKSB7XHJcbiAgICAgIHRoaXMubm9kZU1lbnVTZXJ2aWNlLmZpcmVNZW51RXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIE5vZGVNZW51QWN0aW9uLkNsb3NlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm9kZU1lbnVJdGVtIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgYWN0aW9uOiBOb2RlTWVudUl0ZW1BY3Rpb247XHJcbiAgY3NzQ2xhc3M/OiBzdHJpbmc7XHJcbn1cclxuIl19
