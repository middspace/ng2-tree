import { Component, Input, ViewChild } from '@angular/core';
import { Ng2TreeSettings } from './tree.types';
import { Tree } from './tree';
import { TreeController } from './tree-controller';
import { NodeMenuItemAction } from './menu/menu.events';
import { NodeEditableEventAction } from './editable/editable.events';
import * as EventUtils from './utils/event.utils';
import { get, isNil } from './utils/fn.utils';
import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as i0 from '@angular/core';
import * as i1 from './menu/node-menu.service';
import * as i2 from './tree.service';
import * as i3 from '@angular/common';
import * as i4 from './draggable/node-draggable.directive';
import * as i5 from './editable/node-editable.directive';
import * as i6 from './menu/node-menu.component';
import * as i7 from './utils/safe-html.pipe';
export class TreeInternalComponent {
  nodeMenuService;
  treeService;
  nodeElementRef;
  tree;
  settings;
  template;
  isSelected = false;
  isRightMenuVisible = false;
  isLeftMenuVisible = false;
  isReadOnly = false;
  controller;
  checkboxElementRef;
  subscriptions = [];
  constructor(nodeMenuService, treeService, nodeElementRef) {
    this.nodeMenuService = nodeMenuService;
    this.treeService = treeService;
    this.nodeElementRef = nodeElementRef;
  }
  ngAfterViewInit() {
    if (this.tree.checked && !this.tree.firstCheckedFired) {
      this.tree.firstCheckedFired = true;
      this.treeService.fireNodeChecked(this.tree);
    }
  }
  ngOnInit() {
    const nodeId = get(this.tree, 'node.id', '');
    if (nodeId) {
      this.controller = new TreeController(this);
      this.treeService.setController(nodeId, this.controller);
    }
    this.settings = this.settings || new Ng2TreeSettings();
    this.isReadOnly = !get(this.settings, 'enableCheckboxes', true);
    if (this.tree.isRoot() && this.settings.rootIsVisible === false) {
      this.tree.disableCollapseOnInit();
    }
    this.subscriptions.push(
      this.nodeMenuService.hideMenuStream(this.nodeElementRef).subscribe(() => {
        this.isRightMenuVisible = false;
        this.isLeftMenuVisible = false;
      })
    );
    this.subscriptions.push(this.treeService.unselectStream(this.tree).subscribe(() => (this.isSelected = false)));
    this.subscriptions.push(
      this.treeService.draggedStream(this.tree, this.nodeElementRef).subscribe(e => {
        if (this.tree.hasSibling(e.captured.tree)) {
          this.swapWithSibling(e.captured.tree, this.tree);
        } else if (this.tree.isBranch()) {
          this.moveNodeToThisTreeAndRemoveFromPreviousOne(e, this.tree);
        } else {
          this.moveNodeToParentTreeAndRemoveFromPreviousOne(e, this.tree);
        }
      })
    );
    this.subscriptions.push(
      merge(this.treeService.nodeChecked$, this.treeService.nodeUnchecked$)
        .pipe(filter(e => this.eventContainsId(e) && this.tree.hasChild(e.node)))
        .subscribe(e => this.updateCheckboxState())
    );
  }
  ngOnChanges(changes) {
    this.controller = new TreeController(this);
  }
  ngOnDestroy() {
    if (get(this.tree, 'node.id', '')) {
      this.treeService.deleteController(this.tree.node.id);
    }
    this.subscriptions.forEach(sub => sub && sub.unsubscribe());
  }
  swapWithSibling(sibling, tree) {
    tree.swapWithSibling(sibling);
    this.treeService.fireNodeMoved(sibling, sibling.parent);
  }
  moveNodeToThisTreeAndRemoveFromPreviousOne(e, tree) {
    this.treeService.fireNodeRemoved(e.captured.tree);
    const addedChild = tree.addChild(e.captured.tree);
    this.treeService.fireNodeMoved(addedChild, e.captured.tree.parent);
  }
  moveNodeToParentTreeAndRemoveFromPreviousOne(e, tree) {
    this.treeService.fireNodeRemoved(e.captured.tree);
    const addedSibling = tree.addSibling(e.captured.tree, tree.positionInParent);
    this.treeService.fireNodeMoved(addedSibling, e.captured.tree.parent);
  }
  onNodeSelected(e) {
    if (!this.tree.selectionAllowed) {
      return;
    }
    if (EventUtils.isLeftButtonClicked(e)) {
      this.isSelected = true;
      this.treeService.fireNodeSelected(this.tree);
    }
  }
  onNodeUnselected(e) {
    if (!this.tree.selectionAllowed) {
      return;
    }
    if (EventUtils.isLeftButtonClicked(e)) {
      this.isSelected = false;
      this.treeService.fireNodeUnselected(this.tree);
    }
  }
  showRightMenu(e) {
    if (!this.tree.hasRightMenu()) {
      return;
    }
    if (EventUtils.isRightButtonClicked(e)) {
      this.isRightMenuVisible = !this.isRightMenuVisible;
      this.nodeMenuService.hideMenuForAllNodesExcept(this.nodeElementRef);
    }
    e.preventDefault();
  }
  showLeftMenu(e) {
    if (!this.tree.hasLeftMenu()) {
      return;
    }
    if (EventUtils.isLeftButtonClicked(e)) {
      this.isLeftMenuVisible = !this.isLeftMenuVisible;
      this.nodeMenuService.hideMenuForAllNodesExcept(this.nodeElementRef);
      if (this.isLeftMenuVisible) {
        e.preventDefault();
      }
    }
  }
  onMenuItemSelected(e) {
    switch (e.nodeMenuItemAction) {
      case NodeMenuItemAction.NewTag:
        this.onNewSelected(e);
        break;
      case NodeMenuItemAction.NewFolder:
        this.onNewSelected(e);
        break;
      case NodeMenuItemAction.Rename:
        this.onRenameSelected();
        break;
      case NodeMenuItemAction.Remove:
        this.onRemoveSelected();
        break;
      case NodeMenuItemAction.Custom:
        this.onCustomSelected();
        this.treeService.fireMenuItemSelected(this.tree, e.nodeMenuItemSelected);
        break;
      default:
        throw new Error(`Chosen menu item doesn't exist`);
    }
  }
  onNewSelected(e) {
    this.tree.createNode(e.nodeMenuItemAction === NodeMenuItemAction.NewFolder);
    this.isRightMenuVisible = false;
    this.isLeftMenuVisible = false;
  }
  onRenameSelected() {
    this.tree.markAsBeingRenamed();
    this.isRightMenuVisible = false;
    this.isLeftMenuVisible = false;
  }
  onRemoveSelected() {
    this.treeService.deleteController(get(this.tree, 'node.id', ''));
    this.treeService.fireNodeRemoved(this.tree);
  }
  onCustomSelected() {
    this.isRightMenuVisible = false;
    this.isLeftMenuVisible = false;
  }
  onSwitchFoldingType() {
    this.tree.switchFoldingType();
    this.treeService.fireNodeSwitchFoldingType(this.tree);
  }
  applyNewValue(e) {
    if ((e.action === NodeEditableEventAction.Cancel || this.tree.isNew()) && Tree.isValueEmpty(e.value)) {
      return this.treeService.fireNodeRemoved(this.tree);
    }
    if (this.tree.isNew()) {
      this.tree.value = e.value;
      this.treeService.fireNodeCreated(this.tree);
    }
    if (this.tree.isBeingRenamed()) {
      const oldValue = this.tree.value;
      this.tree.value = e.value;
      this.treeService.fireNodeRenamed(oldValue, this.tree);
    }
    this.tree.markAsModified();
  }
  shouldShowInputForTreeValue() {
    return this.tree.isNew() || this.tree.isBeingRenamed();
  }
  isRootHidden() {
    return this.tree.isRoot() && !this.settings.rootIsVisible;
  }
  hasCustomMenu() {
    return this.tree.hasCustomMenu();
  }
  switchNodeCheckStatus() {
    if (!this.tree.checked) {
      this.onNodeChecked();
    } else {
      this.onNodeUnchecked();
    }
  }
  onNodeChecked() {
    if (!this.checkboxElementRef) {
      return;
    }
    this.checkboxElementRef.nativeElement.indeterminate = false;
    this.treeService.fireNodeChecked(this.tree);
    this.executeOnChildController(controller => controller.check());
    this.tree.checked = true;
  }
  onNodeUnchecked() {
    if (!this.checkboxElementRef) {
      return;
    }
    this.checkboxElementRef.nativeElement.indeterminate = false;
    this.treeService.fireNodeUnchecked(this.tree);
    this.executeOnChildController(controller => controller.uncheck());
    this.tree.checked = false;
  }
  executeOnChildController(executor) {
    if (this.tree.hasLoadedChildern()) {
      this.tree.children.forEach(child => {
        const controller = this.treeService.getController(child.id);
        if (!isNil(controller)) {
          executor(controller);
        }
      });
    }
  }
  updateCheckboxState() {
    // Calling setTimeout so the value of isChecked will be updated and after that I'll check the children status.
    setTimeout(() => {
      const checkedChildrenAmount = this.tree.checkedChildrenAmount();
      if (checkedChildrenAmount === 0) {
        this.checkboxElementRef.nativeElement.indeterminate = false;
        this.tree.checked = false;
        this.treeService.fireNodeUnchecked(this.tree);
      } else if (checkedChildrenAmount === this.tree.loadedChildrenAmount()) {
        this.checkboxElementRef.nativeElement.indeterminate = false;
        this.tree.checked = true;
        this.treeService.fireNodeChecked(this.tree);
      } else {
        this.tree.checked = false;
        this.checkboxElementRef.nativeElement.indeterminate = true;
        this.treeService.fireNodeIndetermined(this.tree);
      }
    });
  }
  eventContainsId(event) {
    if (!event.node.id) {
      console.warn(
        '"Node with checkbox" feature requires a unique id assigned to every node, please consider to add it.'
      );
      return false;
    }
    return true;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeInternalComponent,
    deps: [{ token: i1.NodeMenuService }, { token: i2.TreeService }, { token: i0.ElementRef }],
    target: i0.ɵɵFactoryTarget.Component
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '16.2.12',
    type: TreeInternalComponent,
    selector: 'tree-internal',
    inputs: { tree: 'tree', settings: 'settings', template: 'template' },
    viewQueries: [{ propertyName: 'checkboxElementRef', first: true, predicate: ['checkbox'], descendants: true }],
    usesOnChanges: true,
    ngImport: i0,
    template: `
  <ul class="tree" *ngIf="tree" [ngClass]="{rootless: isRootHidden()}">
    <li>
      <div class="value-container"
        [ngClass]="{rootless: isRootHidden()}"
        [class.selected]="isSelected"
        (contextmenu)="showRightMenu($event)"
        [nodeDraggable]="nodeElementRef"
        [tree]="tree">

        <div class="folding" (click)="onSwitchFoldingType()" [ngClass]="tree.foldingCssClass"></div>

        <div class="node-checkbox" *ngIf="settings.showCheckboxes">
        <input checkbox  type="checkbox" [disabled]="isReadOnly" [checked]="this.tree.checked" (change)="switchNodeCheckStatus()" #checkbox />
         </div>

        <div class="node-value"
          *ngIf="!shouldShowInputForTreeValue()"
          [class.node-selected]="isSelected"
          (click)="onNodeSelected($event)">
            <div *ngIf="tree.nodeTemplate" class="node-template" [innerHTML]="tree.nodeTemplate | safeHtml"></div>
            <span *ngIf="!template" class="node-name" [innerHTML]="tree.value | safeHtml"></span>
            <span class="loading-children" *ngIf="tree.childrenAreBeingLoaded()"></span>
            <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ $implicit: tree.node }"></ng-template>
        </div>

        <input type="text" class="node-value"
           *ngIf="shouldShowInputForTreeValue()"
           [nodeEditable]="tree.value"
           (valueChanged)="applyNewValue($event)"/>

        <div class="node-left-menu" *ngIf="tree.hasLeftMenu()" (click)="showLeftMenu($event)" [innerHTML]="tree.leftMenuTemplate">
        </div>
        <node-menu *ngIf="tree.hasLeftMenu() && isLeftMenuVisible && !hasCustomMenu()"
          (menuItemSelected)="onMenuItemSelected($event)">
        </node-menu>
      </div>

      <node-menu *ngIf="isRightMenuVisible && !hasCustomMenu()"
           (menuItemSelected)="onMenuItemSelected($event)">
      </node-menu>

      <node-menu *ngIf="hasCustomMenu() && (isRightMenuVisible || isLeftMenuVisible)"
           [menuItems]="tree.menuItems"
           (menuItemSelected)="onMenuItemSelected($event)">
      </node-menu>

      <div *ngIf="tree.keepNodesInDOM()" [ngStyle]="{'display': tree.isNodeExpanded() ? 'block' : 'none'}">
        <tree-internal *ngFor="let child of tree.childrenAsync | async" [tree]="child" [template]="template" [settings]="settings"></tree-internal>
      </div>
      <ng-template [ngIf]="tree.isNodeExpanded() && !tree.keepNodesInDOM()">
        <tree-internal *ngFor="let child of tree.childrenAsync | async" [tree]="child" [template]="template" [settings]="settings"></tree-internal>
      </ng-template>
    </li>
  </ul>
  `,
    isInline: true,
    dependencies: [
      { kind: 'directive', type: i3.NgClass, selector: '[ngClass]', inputs: ['class', 'ngClass'] },
      {
        kind: 'directive',
        type: i3.NgForOf,
        selector: '[ngFor][ngForOf]',
        inputs: ['ngForOf', 'ngForTrackBy', 'ngForTemplate']
      },
      { kind: 'directive', type: i3.NgIf, selector: '[ngIf]', inputs: ['ngIf', 'ngIfThen', 'ngIfElse'] },
      {
        kind: 'directive',
        type: i3.NgTemplateOutlet,
        selector: '[ngTemplateOutlet]',
        inputs: ['ngTemplateOutletContext', 'ngTemplateOutlet', 'ngTemplateOutletInjector']
      },
      { kind: 'directive', type: i3.NgStyle, selector: '[ngStyle]', inputs: ['ngStyle'] },
      {
        kind: 'directive',
        type: i4.NodeDraggableDirective,
        selector: '[nodeDraggable]',
        inputs: ['nodeDraggable', 'tree']
      },
      {
        kind: 'directive',
        type: i5.NodeEditableDirective,
        selector: '[nodeEditable]',
        inputs: ['nodeEditable'],
        outputs: ['valueChanged']
      },
      {
        kind: 'component',
        type: i6.NodeMenuComponent,
        selector: 'node-menu',
        inputs: ['menuItems'],
        outputs: ['menuItemSelected']
      },
      {
        kind: 'component',
        type: TreeInternalComponent,
        selector: 'tree-internal',
        inputs: ['tree', 'settings', 'template']
      },
      { kind: 'pipe', type: i3.AsyncPipe, name: 'async' },
      { kind: 'pipe', type: i7.SafeHtmlPipe, name: 'safeHtml' }
    ]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: TreeInternalComponent,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'tree-internal',
          template: `
  <ul class="tree" *ngIf="tree" [ngClass]="{rootless: isRootHidden()}">
    <li>
      <div class="value-container"
        [ngClass]="{rootless: isRootHidden()}"
        [class.selected]="isSelected"
        (contextmenu)="showRightMenu($event)"
        [nodeDraggable]="nodeElementRef"
        [tree]="tree">

        <div class="folding" (click)="onSwitchFoldingType()" [ngClass]="tree.foldingCssClass"></div>

        <div class="node-checkbox" *ngIf="settings.showCheckboxes">
        <input checkbox  type="checkbox" [disabled]="isReadOnly" [checked]="this.tree.checked" (change)="switchNodeCheckStatus()" #checkbox />
         </div>

        <div class="node-value"
          *ngIf="!shouldShowInputForTreeValue()"
          [class.node-selected]="isSelected"
          (click)="onNodeSelected($event)">
            <div *ngIf="tree.nodeTemplate" class="node-template" [innerHTML]="tree.nodeTemplate | safeHtml"></div>
            <span *ngIf="!template" class="node-name" [innerHTML]="tree.value | safeHtml"></span>
            <span class="loading-children" *ngIf="tree.childrenAreBeingLoaded()"></span>
            <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ $implicit: tree.node }"></ng-template>
        </div>

        <input type="text" class="node-value"
           *ngIf="shouldShowInputForTreeValue()"
           [nodeEditable]="tree.value"
           (valueChanged)="applyNewValue($event)"/>

        <div class="node-left-menu" *ngIf="tree.hasLeftMenu()" (click)="showLeftMenu($event)" [innerHTML]="tree.leftMenuTemplate">
        </div>
        <node-menu *ngIf="tree.hasLeftMenu() && isLeftMenuVisible && !hasCustomMenu()"
          (menuItemSelected)="onMenuItemSelected($event)">
        </node-menu>
      </div>

      <node-menu *ngIf="isRightMenuVisible && !hasCustomMenu()"
           (menuItemSelected)="onMenuItemSelected($event)">
      </node-menu>

      <node-menu *ngIf="hasCustomMenu() && (isRightMenuVisible || isLeftMenuVisible)"
           [menuItems]="tree.menuItems"
           (menuItemSelected)="onMenuItemSelected($event)">
      </node-menu>

      <div *ngIf="tree.keepNodesInDOM()" [ngStyle]="{'display': tree.isNodeExpanded() ? 'block' : 'none'}">
        <tree-internal *ngFor="let child of tree.childrenAsync | async" [tree]="child" [template]="template" [settings]="settings"></tree-internal>
      </div>
      <ng-template [ngIf]="tree.isNodeExpanded() && !tree.keepNodesInDOM()">
        <tree-internal *ngFor="let child of tree.childrenAsync | async" [tree]="child" [template]="template" [settings]="settings"></tree-internal>
      </ng-template>
    </li>
  </ul>
  `
        }
      ]
    }
  ],
  ctorParameters: function() {
    return [{ type: i1.NodeMenuService }, { type: i2.TreeService }, { type: i0.ElementRef }];
  },
  propDecorators: {
    tree: [
      {
        type: Input
      }
    ],
    settings: [
      {
        type: Input
      }
    ],
    template: [
      {
        type: Input
      }
    ],
    checkboxElementRef: [
      {
        type: ViewChild,
        args: ['checkbox', { static: false }]
      }
    ]
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1pbnRlcm5hbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJlZS1pbnRlcm5hbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFFVCxLQUFLLEVBTUwsU0FBUyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDL0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbkQsT0FBTyxFQUFFLGtCQUFrQixFQUE2QixNQUFNLG9CQUFvQixDQUFDO0FBQ25GLE9BQU8sRUFBcUIsdUJBQXVCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUd4RixPQUFPLEtBQUssVUFBVSxNQUFNLHFCQUFxQixDQUFDO0FBRWxELE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFOUMsT0FBTyxFQUFFLEtBQUssRUFBTSxNQUFNLE1BQU0sQ0FBQztBQUNqQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7OztBQTZEeEMsTUFBTSxPQUFPLHFCQUFxQjtJQW1CdEI7SUFDRDtJQUNBO0lBcEJPLElBQUksQ0FBTztJQUVYLFFBQVEsQ0FBNEI7SUFFcEMsUUFBUSxDQUFtQjtJQUVwQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ25CLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUMzQixpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUFDMUIsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUNuQixVQUFVLENBQWlCO0lBRzNCLGtCQUFrQixDQUFhO0lBRTlCLGFBQWEsR0FBbUIsRUFBRSxDQUFDO0lBRTNDLFlBQ1UsZUFBZ0MsRUFDakMsV0FBd0IsRUFDeEIsY0FB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LEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFRlbXBsYXRlUmVmLFxyXG4gIFZpZXdDaGlsZFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0ICogYXMgVHJlZVR5cGVzIGZyb20gJy4vdHJlZS50eXBlcyc7XHJcbmltcG9ydCB7IE5nMlRyZWVTZXR0aW5ncyB9IGZyb20gJy4vdHJlZS50eXBlcyc7XHJcbmltcG9ydCB7IFRyZWUgfSBmcm9tICcuL3RyZWUnO1xyXG5pbXBvcnQgeyBUcmVlQ29udHJvbGxlciB9IGZyb20gJy4vdHJlZS1jb250cm9sbGVyJztcclxuaW1wb3J0IHsgTm9kZU1lbnVTZXJ2aWNlIH0gZnJvbSAnLi9tZW51L25vZGUtbWVudS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTm9kZU1lbnVJdGVtQWN0aW9uLCBOb2RlTWVudUl0ZW1TZWxlY3RlZEV2ZW50IH0gZnJvbSAnLi9tZW51L21lbnUuZXZlbnRzJztcclxuaW1wb3J0IHsgTm9kZUVkaXRhYmxlRXZlbnQsIE5vZGVFZGl0YWJsZUV2ZW50QWN0aW9uIH0gZnJvbSAnLi9lZGl0YWJsZS9lZGl0YWJsZS5ldmVudHMnO1xyXG5pbXBvcnQgeyBOb2RlQ2hlY2tlZEV2ZW50LCBOb2RlRXZlbnQgfSBmcm9tICcuL3RyZWUuZXZlbnRzJztcclxuaW1wb3J0IHsgVHJlZVNlcnZpY2UgfSBmcm9tICcuL3RyZWUuc2VydmljZSc7XHJcbmltcG9ydCAqIGFzIEV2ZW50VXRpbHMgZnJvbSAnLi91dGlscy9ldmVudC51dGlscyc7XHJcbmltcG9ydCB7IE5vZGVEcmFnZ2FibGVFdmVudCB9IGZyb20gJy4vZHJhZ2dhYmxlL2RyYWdnYWJsZS5ldmVudHMnO1xyXG5pbXBvcnQgeyBnZXQsIGlzTmlsIH0gZnJvbSAnLi91dGlscy9mbi51dGlscyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtZXJnZSwgb2YgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICd0cmVlLWludGVybmFsJyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gIDx1bCBjbGFzcz1cInRyZWVcIiAqbmdJZj1cInRyZWVcIiBbbmdDbGFzc109XCJ7cm9vdGxlc3M6IGlzUm9vdEhpZGRlbigpfVwiPlxyXG4gICAgPGxpPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwidmFsdWUtY29udGFpbmVyXCJcclxuICAgICAgICBbbmdDbGFzc109XCJ7cm9vdGxlc3M6IGlzUm9vdEhpZGRlbigpfVwiXHJcbiAgICAgICAgW2NsYXNzLnNlbGVjdGVkXT1cImlzU2VsZWN0ZWRcIlxyXG4gICAgICAgIChjb250ZXh0bWVudSk9XCJzaG93UmlnaHRNZW51KCRldmVudClcIlxyXG4gICAgICAgIFtub2RlRHJhZ2dhYmxlXT1cIm5vZGVFbGVtZW50UmVmXCJcclxuICAgICAgICBbdHJlZV09XCJ0cmVlXCI+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb2xkaW5nXCIgKGNsaWNrKT1cIm9uU3dpdGNoRm9sZGluZ1R5cGUoKVwiIFtuZ0NsYXNzXT1cInRyZWUuZm9sZGluZ0Nzc0NsYXNzXCI+PC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJub2RlLWNoZWNrYm94XCIgKm5nSWY9XCJzZXR0aW5ncy5zaG93Q2hlY2tib3hlc1wiPlxyXG4gICAgICAgIDxpbnB1dCBjaGVja2JveCAgdHlwZT1cImNoZWNrYm94XCIgW2Rpc2FibGVkXT1cImlzUmVhZE9ubHlcIiBbY2hlY2tlZF09XCJ0aGlzLnRyZWUuY2hlY2tlZFwiIChjaGFuZ2UpPVwic3dpdGNoTm9kZUNoZWNrU3RhdHVzKClcIiAjY2hlY2tib3ggLz5cclxuICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJub2RlLXZhbHVlXCJcclxuICAgICAgICAgICpuZ0lmPVwiIXNob3VsZFNob3dJbnB1dEZvclRyZWVWYWx1ZSgpXCJcclxuICAgICAgICAgIFtjbGFzcy5ub2RlLXNlbGVjdGVkXT1cImlzU2VsZWN0ZWRcIlxyXG4gICAgICAgICAgKGNsaWNrKT1cIm9uTm9kZVNlbGVjdGVkKCRldmVudClcIj5cclxuICAgICAgICAgICAgPGRpdiAqbmdJZj1cInRyZWUubm9kZVRlbXBsYXRlXCIgY2xhc3M9XCJub2RlLXRlbXBsYXRlXCIgW2lubmVySFRNTF09XCJ0cmVlLm5vZGVUZW1wbGF0ZSB8IHNhZmVIdG1sXCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiIXRlbXBsYXRlXCIgY2xhc3M9XCJub2RlLW5hbWVcIiBbaW5uZXJIVE1MXT1cInRyZWUudmFsdWUgfCBzYWZlSHRtbFwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb2FkaW5nLWNoaWxkcmVuXCIgKm5nSWY9XCJ0cmVlLmNoaWxkcmVuQXJlQmVpbmdMb2FkZWQoKVwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRlbXBsYXRlXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInsgJGltcGxpY2l0OiB0cmVlLm5vZGUgfVwiPjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwibm9kZS12YWx1ZVwiXHJcbiAgICAgICAgICAgKm5nSWY9XCJzaG91bGRTaG93SW5wdXRGb3JUcmVlVmFsdWUoKVwiXHJcbiAgICAgICAgICAgW25vZGVFZGl0YWJsZV09XCJ0cmVlLnZhbHVlXCJcclxuICAgICAgICAgICAodmFsdWVDaGFuZ2VkKT1cImFwcGx5TmV3VmFsdWUoJGV2ZW50KVwiLz5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vZGUtbGVmdC1tZW51XCIgKm5nSWY9XCJ0cmVlLmhhc0xlZnRNZW51KClcIiAoY2xpY2spPVwic2hvd0xlZnRNZW51KCRldmVudClcIiBbaW5uZXJIVE1MXT1cInRyZWUubGVmdE1lbnVUZW1wbGF0ZVwiPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxub2RlLW1lbnUgKm5nSWY9XCJ0cmVlLmhhc0xlZnRNZW51KCkgJiYgaXNMZWZ0TWVudVZpc2libGUgJiYgIWhhc0N1c3RvbU1lbnUoKVwiXHJcbiAgICAgICAgICAobWVudUl0ZW1TZWxlY3RlZCk9XCJvbk1lbnVJdGVtU2VsZWN0ZWQoJGV2ZW50KVwiPlxyXG4gICAgICAgIDwvbm9kZS1tZW51PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxub2RlLW1lbnUgKm5nSWY9XCJpc1JpZ2h0TWVudVZpc2libGUgJiYgIWhhc0N1c3RvbU1lbnUoKVwiXHJcbiAgICAgICAgICAgKG1lbnVJdGVtU2VsZWN0ZWQpPVwib25NZW51SXRlbVNlbGVjdGVkKCRldmVudClcIj5cclxuICAgICAgPC9ub2RlLW1lbnU+XHJcblxyXG4gICAgICA8bm9kZS1tZW51ICpuZ0lmPVwiaGFzQ3VzdG9tTWVudSgpICYmIChpc1JpZ2h0TWVudVZpc2libGUgfHwgaXNMZWZ0TWVudVZpc2libGUpXCJcclxuICAgICAgICAgICBbbWVudUl0ZW1zXT1cInRyZWUubWVudUl0ZW1zXCJcclxuICAgICAgICAgICAobWVudUl0ZW1TZWxlY3RlZCk9XCJvbk1lbnVJdGVtU2VsZWN0ZWQoJGV2ZW50KVwiPlxyXG4gICAgICA8L25vZGUtbWVudT5cclxuXHJcbiAgICAgIDxkaXYgKm5nSWY9XCJ0cmVlLmtlZXBOb2Rlc0luRE9NKClcIiBbbmdTdHlsZV09XCJ7J2Rpc3BsYXknOiB0cmVlLmlzTm9kZUV4cGFuZGVkKCkgPyAnYmxvY2snIDogJ25vbmUnfVwiPlxyXG4gICAgICAgIDx0cmVlLWludGVybmFsICpuZ0Zvcj1cImxldCBjaGlsZCBvZiB0cmVlLmNoaWxkcmVuQXN5bmMgfCBhc3luY1wiIFt0cmVlXT1cImNoaWxkXCIgW3RlbXBsYXRlXT1cInRlbXBsYXRlXCIgW3NldHRpbmdzXT1cInNldHRpbmdzXCI+PC90cmVlLWludGVybmFsPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cInRyZWUuaXNOb2RlRXhwYW5kZWQoKSAmJiAhdHJlZS5rZWVwTm9kZXNJbkRPTSgpXCI+XHJcbiAgICAgICAgPHRyZWUtaW50ZXJuYWwgKm5nRm9yPVwibGV0IGNoaWxkIG9mIHRyZWUuY2hpbGRyZW5Bc3luYyB8IGFzeW5jXCIgW3RyZWVdPVwiY2hpbGRcIiBbdGVtcGxhdGVdPVwidGVtcGxhdGVcIiBbc2V0dGluZ3NdPVwic2V0dGluZ3NcIj48L3RyZWUtaW50ZXJuYWw+XHJcbiAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICA8L2xpPlxyXG4gIDwvdWw+XHJcbiAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVHJlZUludGVybmFsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgQWZ0ZXJWaWV3SW5pdCB7XHJcbiAgQElucHV0KCkgcHVibGljIHRyZWU6IFRyZWU7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBzZXR0aW5nczogVHJlZVR5cGVzLk5nMlRyZWVTZXR0aW5ncztcclxuXHJcbiAgQElucHV0KCkgcHVibGljIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICBwdWJsaWMgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc1JpZ2h0TWVudVZpc2libGUgPSBmYWxzZTtcclxuICBwdWJsaWMgaXNMZWZ0TWVudVZpc2libGUgPSBmYWxzZTtcclxuICBwdWJsaWMgaXNSZWFkT25seSA9IGZhbHNlO1xyXG4gIHB1YmxpYyBjb250cm9sbGVyOiBUcmVlQ29udHJvbGxlcjtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY2hlY2tib3gnLCB7IHN0YXRpYzogZmFsc2UgfSlcclxuICBwdWJsaWMgY2hlY2tib3hFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBwcml2YXRlIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbltdID0gW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgbm9kZU1lbnVTZXJ2aWNlOiBOb2RlTWVudVNlcnZpY2UsXHJcbiAgICBwdWJsaWMgdHJlZVNlcnZpY2U6IFRyZWVTZXJ2aWNlLFxyXG4gICAgcHVibGljIG5vZGVFbGVtZW50UmVmOiBFbGVtZW50UmVmXHJcbiAgKSB7fVxyXG5cclxuICBwdWJsaWMgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudHJlZS5jaGVja2VkICYmICEodGhpcy50cmVlIGFzIGFueSkuZmlyc3RDaGVja2VkRmlyZWQpIHtcclxuICAgICAgKHRoaXMudHJlZSBhcyBhbnkpLmZpcnN0Q2hlY2tlZEZpcmVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5maXJlTm9kZUNoZWNrZWQodGhpcy50cmVlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vZGVJZCA9IGdldCh0aGlzLnRyZWUsICdub2RlLmlkJywgJycpO1xyXG4gICAgaWYgKG5vZGVJZCkge1xyXG4gICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgVHJlZUNvbnRyb2xsZXIodGhpcyk7XHJcbiAgICAgIHRoaXMudHJlZVNlcnZpY2Uuc2V0Q29udHJvbGxlcihub2RlSWQsIHRoaXMuY29udHJvbGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3MgfHwgbmV3IE5nMlRyZWVTZXR0aW5ncygpO1xyXG4gICAgdGhpcy5pc1JlYWRPbmx5ID0gIWdldCh0aGlzLnNldHRpbmdzLCAnZW5hYmxlQ2hlY2tib3hlcycsIHRydWUpO1xyXG5cclxuICAgIGlmICh0aGlzLnRyZWUuaXNSb290KCkgJiYgdGhpcy5zZXR0aW5ncy5yb290SXNWaXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICB0aGlzLnRyZWUuZGlzYWJsZUNvbGxhcHNlT25Jbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHRoaXMubm9kZU1lbnVTZXJ2aWNlLmhpZGVNZW51U3RyZWFtKHRoaXMubm9kZUVsZW1lbnRSZWYpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc1JpZ2h0TWVudVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzTGVmdE1lbnVWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHRoaXMudHJlZVNlcnZpY2UudW5zZWxlY3RTdHJlYW0odGhpcy50cmVlKS5zdWJzY3JpYmUoKCkgPT4gKHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlKSkpO1xyXG5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLmRyYWdnZWRTdHJlYW0odGhpcy50cmVlLCB0aGlzLm5vZGVFbGVtZW50UmVmKS5zdWJzY3JpYmUoKGU6IE5vZGVEcmFnZ2FibGVFdmVudCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnRyZWUuaGFzU2libGluZyhlLmNhcHR1cmVkLnRyZWUpKSB7XHJcbiAgICAgICAgICB0aGlzLnN3YXBXaXRoU2libGluZyhlLmNhcHR1cmVkLnRyZWUsIHRoaXMudHJlZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyZWUuaXNCcmFuY2goKSkge1xyXG4gICAgICAgICAgdGhpcy5tb3ZlTm9kZVRvVGhpc1RyZWVBbmRSZW1vdmVGcm9tUHJldmlvdXNPbmUoZSwgdGhpcy50cmVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5tb3ZlTm9kZVRvUGFyZW50VHJlZUFuZFJlbW92ZUZyb21QcmV2aW91c09uZShlLCB0aGlzLnRyZWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIG1lcmdlKHRoaXMudHJlZVNlcnZpY2Uubm9kZUNoZWNrZWQkLCB0aGlzLnRyZWVTZXJ2aWNlLm5vZGVVbmNoZWNrZWQkKVxyXG4gICAgICAgIC5waXBlKGZpbHRlcigoZTogTm9kZUNoZWNrZWRFdmVudCkgPT4gdGhpcy5ldmVudENvbnRhaW5zSWQoZSkgJiYgdGhpcy50cmVlLmhhc0NoaWxkKGUubm9kZSkpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoKGU6IE5vZGVDaGVja2VkRXZlbnQpID0+IHRoaXMudXBkYXRlQ2hlY2tib3hTdGF0ZSgpKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgVHJlZUNvbnRyb2xsZXIodGhpcyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICBpZiAoZ2V0KHRoaXMudHJlZSwgJ25vZGUuaWQnLCAnJykpIHtcclxuICAgICAgdGhpcy50cmVlU2VydmljZS5kZWxldGVDb250cm9sbGVyKHRoaXMudHJlZS5ub2RlLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZm9yRWFjaChzdWIgPT4gc3ViICYmIHN1Yi51bnN1YnNjcmliZSgpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3dhcFdpdGhTaWJsaW5nKHNpYmxpbmc6IFRyZWUsIHRyZWU6IFRyZWUpOiB2b2lkIHtcclxuICAgIHRyZWUuc3dhcFdpdGhTaWJsaW5nKHNpYmxpbmcpO1xyXG4gICAgdGhpcy50cmVlU2VydmljZS5maXJlTm9kZU1vdmVkKHNpYmxpbmcsIHNpYmxpbmcucGFyZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbW92ZU5vZGVUb1RoaXNUcmVlQW5kUmVtb3ZlRnJvbVByZXZpb3VzT25lKGU6IE5vZGVEcmFnZ2FibGVFdmVudCwgdHJlZTogVHJlZSk6IHZvaWQge1xyXG4gICAgdGhpcy50cmVlU2VydmljZS5maXJlTm9kZVJlbW92ZWQoZS5jYXB0dXJlZC50cmVlKTtcclxuICAgIGNvbnN0IGFkZGVkQ2hpbGQgPSB0cmVlLmFkZENoaWxkKGUuY2FwdHVyZWQudHJlZSk7XHJcbiAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlTW92ZWQoYWRkZWRDaGlsZCwgZS5jYXB0dXJlZC50cmVlLnBhcmVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1vdmVOb2RlVG9QYXJlbnRUcmVlQW5kUmVtb3ZlRnJvbVByZXZpb3VzT25lKGU6IE5vZGVEcmFnZ2FibGVFdmVudCwgdHJlZTogVHJlZSk6IHZvaWQge1xyXG4gICAgdGhpcy50cmVlU2VydmljZS5maXJlTm9kZVJlbW92ZWQoZS5jYXB0dXJlZC50cmVlKTtcclxuICAgIGNvbnN0IGFkZGVkU2libGluZyA9IHRyZWUuYWRkU2libGluZyhlLmNhcHR1cmVkLnRyZWUsIHRyZWUucG9zaXRpb25JblBhcmVudCk7XHJcbiAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlTW92ZWQoYWRkZWRTaWJsaW5nLCBlLmNhcHR1cmVkLnRyZWUucGFyZW50KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbk5vZGVTZWxlY3RlZChlOiB7IGJ1dHRvbjogbnVtYmVyIH0pOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy50cmVlLnNlbGVjdGlvbkFsbG93ZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChFdmVudFV0aWxzLmlzTGVmdEJ1dHRvbkNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50KSkge1xyXG4gICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlU2VsZWN0ZWQodGhpcy50cmVlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbk5vZGVVbnNlbGVjdGVkKGU6IHsgYnV0dG9uOiBudW1iZXIgfSk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnRyZWUuc2VsZWN0aW9uQWxsb3dlZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEV2ZW50VXRpbHMuaXNMZWZ0QnV0dG9uQ2xpY2tlZChlIGFzIE1vdXNlRXZlbnQpKSB7XHJcbiAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlVW5zZWxlY3RlZCh0aGlzLnRyZWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNob3dSaWdodE1lbnUoZTogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnRyZWUuaGFzUmlnaHRNZW51KCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChFdmVudFV0aWxzLmlzUmlnaHRCdXR0b25DbGlja2VkKGUpKSB7XHJcbiAgICAgIHRoaXMuaXNSaWdodE1lbnVWaXNpYmxlID0gIXRoaXMuaXNSaWdodE1lbnVWaXNpYmxlO1xyXG4gICAgICB0aGlzLm5vZGVNZW51U2VydmljZS5oaWRlTWVudUZvckFsbE5vZGVzRXhjZXB0KHRoaXMubm9kZUVsZW1lbnRSZWYpO1xyXG4gICAgfVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNob3dMZWZ0TWVudShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMudHJlZS5oYXNMZWZ0TWVudSgpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoRXZlbnRVdGlscy5pc0xlZnRCdXR0b25DbGlja2VkKGUpKSB7XHJcbiAgICAgIHRoaXMuaXNMZWZ0TWVudVZpc2libGUgPSAhdGhpcy5pc0xlZnRNZW51VmlzaWJsZTtcclxuICAgICAgdGhpcy5ub2RlTWVudVNlcnZpY2UuaGlkZU1lbnVGb3JBbGxOb2Rlc0V4Y2VwdCh0aGlzLm5vZGVFbGVtZW50UmVmKTtcclxuICAgICAgaWYgKHRoaXMuaXNMZWZ0TWVudVZpc2libGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbk1lbnVJdGVtU2VsZWN0ZWQoZTogTm9kZU1lbnVJdGVtU2VsZWN0ZWRFdmVudCk6IHZvaWQge1xyXG4gICAgc3dpdGNoIChlLm5vZGVNZW51SXRlbUFjdGlvbikge1xyXG4gICAgICBjYXNlIE5vZGVNZW51SXRlbUFjdGlvbi5OZXdUYWc6XHJcbiAgICAgICAgdGhpcy5vbk5ld1NlbGVjdGVkKGUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIE5vZGVNZW51SXRlbUFjdGlvbi5OZXdGb2xkZXI6XHJcbiAgICAgICAgdGhpcy5vbk5ld1NlbGVjdGVkKGUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIE5vZGVNZW51SXRlbUFjdGlvbi5SZW5hbWU6XHJcbiAgICAgICAgdGhpcy5vblJlbmFtZVNlbGVjdGVkKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgTm9kZU1lbnVJdGVtQWN0aW9uLlJlbW92ZTpcclxuICAgICAgICB0aGlzLm9uUmVtb3ZlU2VsZWN0ZWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBOb2RlTWVudUl0ZW1BY3Rpb24uQ3VzdG9tOlxyXG4gICAgICAgIHRoaXMub25DdXN0b21TZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU1lbnVJdGVtU2VsZWN0ZWQodGhpcy50cmVlLCBlLm5vZGVNZW51SXRlbVNlbGVjdGVkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENob3NlbiBtZW51IGl0ZW0gZG9lc24ndCBleGlzdGApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk5ld1NlbGVjdGVkKGU6IE5vZGVNZW51SXRlbVNlbGVjdGVkRXZlbnQpOiB2b2lkIHtcclxuICAgIHRoaXMudHJlZS5jcmVhdGVOb2RlKGUubm9kZU1lbnVJdGVtQWN0aW9uID09PSBOb2RlTWVudUl0ZW1BY3Rpb24uTmV3Rm9sZGVyKTtcclxuICAgIHRoaXMuaXNSaWdodE1lbnVWaXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzTGVmdE1lbnVWaXNpYmxlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uUmVuYW1lU2VsZWN0ZWQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyZWUubWFya0FzQmVpbmdSZW5hbWVkKCk7XHJcbiAgICB0aGlzLmlzUmlnaHRNZW51VmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0xlZnRNZW51VmlzaWJsZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvblJlbW92ZVNlbGVjdGVkKCk6IHZvaWQge1xyXG4gICAgdGhpcy50cmVlU2VydmljZS5kZWxldGVDb250cm9sbGVyKGdldCh0aGlzLnRyZWUsICdub2RlLmlkJywgJycpKTtcclxuICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVSZW1vdmVkKHRoaXMudHJlZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uQ3VzdG9tU2VsZWN0ZWQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzUmlnaHRNZW51VmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0xlZnRNZW51VmlzaWJsZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uU3dpdGNoRm9sZGluZ1R5cGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyZWUuc3dpdGNoRm9sZGluZ1R5cGUoKTtcclxuICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVTd2l0Y2hGb2xkaW5nVHlwZSh0aGlzLnRyZWUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFwcGx5TmV3VmFsdWUoZTogTm9kZUVkaXRhYmxlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICgoZS5hY3Rpb24gPT09IE5vZGVFZGl0YWJsZUV2ZW50QWN0aW9uLkNhbmNlbCB8fCB0aGlzLnRyZWUuaXNOZXcoKSkgJiYgVHJlZS5pc1ZhbHVlRW1wdHkoZS52YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVSZW1vdmVkKHRoaXMudHJlZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudHJlZS5pc05ldygpKSB7XHJcbiAgICAgIHRoaXMudHJlZS52YWx1ZSA9IGUudmFsdWU7XHJcbiAgICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVDcmVhdGVkKHRoaXMudHJlZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudHJlZS5pc0JlaW5nUmVuYW1lZCgpKSB7XHJcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy50cmVlLnZhbHVlO1xyXG4gICAgICB0aGlzLnRyZWUudmFsdWUgPSBlLnZhbHVlO1xyXG4gICAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlUmVuYW1lZChvbGRWYWx1ZSwgdGhpcy50cmVlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRyZWUubWFya0FzTW9kaWZpZWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzaG91bGRTaG93SW5wdXRGb3JUcmVlVmFsdWUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50cmVlLmlzTmV3KCkgfHwgdGhpcy50cmVlLmlzQmVpbmdSZW5hbWVkKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNSb290SGlkZGVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudHJlZS5pc1Jvb3QoKSAmJiAhdGhpcy5zZXR0aW5ncy5yb290SXNWaXNpYmxlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhhc0N1c3RvbU1lbnUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50cmVlLmhhc0N1c3RvbU1lbnUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzd2l0Y2hOb2RlQ2hlY2tTdGF0dXMoKSB7XHJcbiAgICBpZiAoIXRoaXMudHJlZS5jaGVja2VkKSB7XHJcbiAgICAgIHRoaXMub25Ob2RlQ2hlY2tlZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vbk5vZGVVbmNoZWNrZWQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbk5vZGVDaGVja2VkKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmNoZWNrYm94RWxlbWVudFJlZikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGVja2JveEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyZWVTZXJ2aWNlLmZpcmVOb2RlQ2hlY2tlZCh0aGlzLnRyZWUpO1xyXG4gICAgdGhpcy5leGVjdXRlT25DaGlsZENvbnRyb2xsZXIoY29udHJvbGxlciA9PiBjb250cm9sbGVyLmNoZWNrKCkpO1xyXG4gICAgdGhpcy50cmVlLmNoZWNrZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uTm9kZVVuY2hlY2tlZCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5jaGVja2JveEVsZW1lbnRSZWYpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2hlY2tib3hFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmVlU2VydmljZS5maXJlTm9kZVVuY2hlY2tlZCh0aGlzLnRyZWUpO1xyXG4gICAgdGhpcy5leGVjdXRlT25DaGlsZENvbnRyb2xsZXIoY29udHJvbGxlciA9PiBjb250cm9sbGVyLnVuY2hlY2soKSk7XHJcbiAgICB0aGlzLnRyZWUuY2hlY2tlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBleGVjdXRlT25DaGlsZENvbnRyb2xsZXIoZXhlY3V0b3I6IChjb250cm9sbGVyOiBUcmVlQ29udHJvbGxlcikgPT4gdm9pZCkge1xyXG4gICAgaWYgKHRoaXMudHJlZS5oYXNMb2FkZWRDaGlsZGVybigpKSB7XHJcbiAgICAgIHRoaXMudHJlZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogVHJlZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLnRyZWVTZXJ2aWNlLmdldENvbnRyb2xsZXIoY2hpbGQuaWQpO1xyXG4gICAgICAgIGlmICghaXNOaWwoY29udHJvbGxlcikpIHtcclxuICAgICAgICAgIGV4ZWN1dG9yKGNvbnRyb2xsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDaGVja2JveFN0YXRlKCk6IHZvaWQge1xyXG4gICAgLy8gQ2FsbGluZyBzZXRUaW1lb3V0IHNvIHRoZSB2YWx1ZSBvZiBpc0NoZWNrZWQgd2lsbCBiZSB1cGRhdGVkIGFuZCBhZnRlciB0aGF0IEknbGwgY2hlY2sgdGhlIGNoaWxkcmVuIHN0YXR1cy5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBjb25zdCBjaGVja2VkQ2hpbGRyZW5BbW91bnQgPSB0aGlzLnRyZWUuY2hlY2tlZENoaWxkcmVuQW1vdW50KCk7XHJcbiAgICAgIGlmIChjaGVja2VkQ2hpbGRyZW5BbW91bnQgPT09IDApIHtcclxuICAgICAgICB0aGlzLmNoZWNrYm94RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRyZWUuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVVbmNoZWNrZWQodGhpcy50cmVlKTtcclxuICAgICAgfSBlbHNlIGlmIChjaGVja2VkQ2hpbGRyZW5BbW91bnQgPT09IHRoaXMudHJlZS5sb2FkZWRDaGlsZHJlbkFtb3VudCgpKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja2JveEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50cmVlLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVDaGVja2VkKHRoaXMudHJlZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmVlLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNoZWNrYm94RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudHJlZVNlcnZpY2UuZmlyZU5vZGVJbmRldGVybWluZWQodGhpcy50cmVlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGV2ZW50Q29udGFpbnNJZChldmVudDogTm9kZUV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIWV2ZW50Lm5vZGUuaWQpIHtcclxuICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICdcIk5vZGUgd2l0aCBjaGVja2JveFwiIGZlYXR1cmUgcmVxdWlyZXMgYSB1bmlxdWUgaWQgYXNzaWduZWQgdG8gZXZlcnkgbm9kZSwgcGxlYXNlIGNvbnNpZGVyIHRvIGFkZCBpdC4nXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG4iXX0=
