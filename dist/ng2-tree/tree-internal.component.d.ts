import { AfterViewInit, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import * as TreeTypes from './tree.types';
import { Tree } from './tree';
import { TreeController } from './tree-controller';
import { NodeMenuService } from './menu/node-menu.service';
import { NodeMenuItemSelectedEvent } from './menu/menu.events';
import { NodeEditableEvent } from './editable/editable.events';
import { TreeService } from './tree.service';
import * as i0 from '@angular/core';
export declare class TreeInternalComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private nodeMenuService;
  treeService: TreeService;
  nodeElementRef: ElementRef;
  tree: Tree;
  settings: TreeTypes.Ng2TreeSettings;
  template: TemplateRef<any>;
  isSelected: boolean;
  isRightMenuVisible: boolean;
  isLeftMenuVisible: boolean;
  isReadOnly: boolean;
  controller: TreeController;
  checkboxElementRef: ElementRef;
  private subscriptions;
  constructor(nodeMenuService: NodeMenuService, treeService: TreeService, nodeElementRef: ElementRef);
  ngAfterViewInit(): void;
  ngOnInit(): void;
  ngOnChanges(changes: SimpleChanges): void;
  ngOnDestroy(): void;
  private swapWithSibling;
  private moveNodeToThisTreeAndRemoveFromPreviousOne;
  private moveNodeToParentTreeAndRemoveFromPreviousOne;
  onNodeSelected(e: { button: number }): void;
  onNodeUnselected(e: { button: number }): void;
  showRightMenu(e: MouseEvent): void;
  showLeftMenu(e: MouseEvent): void;
  onMenuItemSelected(e: NodeMenuItemSelectedEvent): void;
  private onNewSelected;
  private onRenameSelected;
  private onRemoveSelected;
  private onCustomSelected;
  onSwitchFoldingType(): void;
  applyNewValue(e: NodeEditableEvent): void;
  shouldShowInputForTreeValue(): boolean;
  isRootHidden(): boolean;
  hasCustomMenu(): boolean;
  switchNodeCheckStatus(): void;
  onNodeChecked(): void;
  onNodeUnchecked(): void;
  private executeOnChildController;
  updateCheckboxState(): void;
  private eventContainsId;
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeInternalComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TreeInternalComponent,
    'tree-internal',
    never,
    {
      tree: { alias: 'tree'; required: false };
      settings: { alias: 'settings'; required: false };
      template: { alias: 'template'; required: false };
    },
    {},
    never,
    never,
    false,
    never
  >;
}
