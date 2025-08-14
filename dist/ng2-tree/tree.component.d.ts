import { EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TreeService } from './tree.service';
import * as TreeTypes from './tree.types';
import { NodeCheckedEvent, NodeUncheckedEvent } from './tree.events';
import { Tree } from './tree';
import { TreeController } from './tree-controller';
import * as i0 from '@angular/core';
export declare class TreeComponent implements OnInit, OnChanges, OnDestroy {
  private treeService;
  private static EMPTY_TREE;
  treeModel: TreeTypes.TreeModel;
  settings: TreeTypes.Ng2TreeSettings;
  nodeCreated: EventEmitter<any>;
  nodeRemoved: EventEmitter<any>;
  nodeRenamed: EventEmitter<any>;
  nodeSelected: EventEmitter<any>;
  nodeUnselected: EventEmitter<any>;
  nodeMoved: EventEmitter<any>;
  nodeExpanded: EventEmitter<any>;
  nodeCollapsed: EventEmitter<any>;
  loadNextLevel: EventEmitter<any>;
  nodeChecked: EventEmitter<NodeCheckedEvent>;
  nodeUnchecked: EventEmitter<NodeUncheckedEvent>;
  menuItemSelected: EventEmitter<any>;
  tree: Tree;
  rootComponent: any;
  template: any;
  private subscriptions;
  constructor(treeService: TreeService);
  ngOnChanges(changes: SimpleChanges): void;
  ngOnInit(): void;
  getController(): TreeController;
  getControllerByNodeId(id: number | string): TreeController;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TreeComponent,
    'tree',
    never,
    { treeModel: { alias: 'tree'; required: false }; settings: { alias: 'settings'; required: false } },
    {
      nodeCreated: 'nodeCreated';
      nodeRemoved: 'nodeRemoved';
      nodeRenamed: 'nodeRenamed';
      nodeSelected: 'nodeSelected';
      nodeUnselected: 'nodeUnselected';
      nodeMoved: 'nodeMoved';
      nodeExpanded: 'nodeExpanded';
      nodeCollapsed: 'nodeCollapsed';
      loadNextLevel: 'loadNextLevel';
      nodeChecked: 'nodeChecked';
      nodeUnchecked: 'nodeUnchecked';
      menuItemSelected: 'menuItemSelected';
    },
    ['template'],
    never,
    false,
    never
  >;
}
