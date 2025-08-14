import { EventEmitter, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NodeMenuService } from './node-menu.service';
import { NodeMenuItemAction, NodeMenuItemSelectedEvent } from './menu.events';
import * as i0 from '@angular/core';
export declare class NodeMenuComponent implements OnInit, OnDestroy {
  private renderer;
  private nodeMenuService;
  menuItemSelected: EventEmitter<NodeMenuItemSelectedEvent>;
  menuItems: NodeMenuItem[];
  menuContainer: any;
  availableMenuItems: NodeMenuItem[];
  private disposersForGlobalListeners;
  constructor(renderer: Renderer2, nodeMenuService: NodeMenuService);
  ngOnInit(): void;
  ngOnDestroy(): void;
  onMenuItemSelected(e: MouseEvent, selectedMenuItem: NodeMenuItem): void;
  private closeMenu;
  static ɵfac: i0.ɵɵFactoryDeclaration<NodeMenuComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NodeMenuComponent,
    'node-menu',
    never,
    { menuItems: { alias: 'menuItems'; required: false } },
    { menuItemSelected: 'menuItemSelected' },
    never,
    never,
    false,
    never
  >;
}
export interface NodeMenuItem {
  name: string;
  action: NodeMenuItemAction;
  cssClass?: string;
}
