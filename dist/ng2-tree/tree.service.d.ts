import {
  LoadNextLevelEvent,
  MenuItemSelectedEvent,
  NodeCheckedEvent,
  NodeCollapsedEvent,
  NodeCreatedEvent,
  NodeExpandedEvent,
  NodeIndeterminedEvent,
  NodeMovedEvent,
  NodeRemovedEvent,
  NodeRenamedEvent,
  NodeSelectedEvent,
  NodeUncheckedEvent,
  NodeUnselectedEvent
} from './tree.events';
import { RenamableNode } from './tree.types';
import { Tree } from './tree';
import { TreeController } from './tree-controller';
import { ElementRef } from '@angular/core';
import { NodeDraggableService } from './draggable/node-draggable.service';
import { NodeDraggableEvent } from './draggable/draggable.events';
import { Observable, Subject } from 'rxjs';
import * as i0 from '@angular/core';
export declare class TreeService {
  private nodeDraggableService;
  nodeMoved$: Subject<NodeMovedEvent>;
  nodeRemoved$: Subject<NodeRemovedEvent>;
  nodeRenamed$: Subject<NodeRenamedEvent>;
  nodeCreated$: Subject<NodeCreatedEvent>;
  nodeSelected$: Subject<NodeSelectedEvent>;
  nodeUnselected$: Subject<NodeUnselectedEvent>;
  nodeExpanded$: Subject<NodeExpandedEvent>;
  nodeCollapsed$: Subject<NodeCollapsedEvent>;
  menuItemSelected$: Subject<MenuItemSelectedEvent>;
  loadNextLevel$: Subject<LoadNextLevelEvent>;
  nodeChecked$: Subject<NodeCheckedEvent>;
  nodeUnchecked$: Subject<NodeUncheckedEvent>;
  nodeIndetermined$: Subject<NodeIndeterminedEvent>;
  private controllers;
  constructor(nodeDraggableService: NodeDraggableService);
  unselectStream(tree: Tree): Observable<NodeSelectedEvent>;
  fireNodeRemoved(tree: Tree): void;
  fireNodeCreated(tree: Tree): void;
  fireNodeSelected(tree: Tree): void;
  fireNodeUnselected(tree: Tree): void;
  fireNodeRenamed(oldValue: RenamableNode | string, tree: Tree): void;
  fireNodeMoved(tree: Tree, parent: Tree): void;
  fireMenuItemSelected(tree: Tree, selectedItem: string): void;
  fireNodeSwitchFoldingType(tree: Tree): void;
  private fireNodeExpanded;
  private fireNodeCollapsed;
  private fireLoadNextLevel;
  fireNodeChecked(tree: Tree): void;
  fireNodeUnchecked(tree: Tree): void;
  draggedStream(tree: Tree, element: ElementRef): Observable<NodeDraggableEvent>;
  setController(id: string | number, controller: TreeController): void;
  deleteController(id: string | number): void;
  getController(id: string | number): TreeController;
  hasController(id: string | number): boolean;
  private shouldFireLoadNextLevel;
  fireNodeIndetermined(tree: Tree): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<TreeService>;
}
