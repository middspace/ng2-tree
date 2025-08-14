import * as i0 from '@angular/core';
import {
  Injectable,
  Inject,
  ElementRef,
  Renderer2,
  Directive,
  Input,
  EventEmitter,
  Output,
  HostListener,
  Component,
  ViewChild,
  Pipe,
  TemplateRef,
  ContentChild,
  NgModule
} from '@angular/core';
import { Subject, Observable, of, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { v4 } from 'uuid';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i1 from '@angular/platform-browser';

class NodeEvent {
  node;
  constructor(node) {
    this.node = node;
  }
}
class NodeSelectedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeUnselectedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeDestructiveEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeMovedEvent extends NodeDestructiveEvent {
  previousParent;
  constructor(node, previousParent) {
    super(node);
    this.previousParent = previousParent;
  }
}
class NodeRemovedEvent extends NodeDestructiveEvent {
  lastIndex;
  constructor(node, lastIndex) {
    super(node);
    this.lastIndex = lastIndex;
  }
}
class NodeCreatedEvent extends NodeDestructiveEvent {
  constructor(node) {
    super(node);
  }
}
class NodeRenamedEvent extends NodeDestructiveEvent {
  oldValue;
  newValue;
  constructor(node, oldValue, newValue) {
    super(node);
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}
class NodeExpandedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeCollapsedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class MenuItemSelectedEvent extends NodeEvent {
  selectedItem;
  constructor(node, selectedItem) {
    super(node);
    this.selectedItem = selectedItem;
  }
}
class LoadNextLevelEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeCheckedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeUncheckedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}
class NodeIndeterminedEvent extends NodeEvent {
  constructor(node) {
    super(node);
  }
}

class NodeDraggableEvent {
  captured;
  target;
  constructor(captured, target) {
    this.captured = captured;
    this.target = target;
  }
}

class NodeDraggableService {
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

function isEmpty(value) {
  if (typeof value === 'string') {
    return !/\S/.test(value);
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return isNil(value);
}
function trim(value) {
  return isNil(value) ? '' : value.trim();
}
function has(value, prop) {
  return value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, prop);
}
function isFunction(value) {
  return typeof value === 'function';
}
function get(value, path, defaultValue) {
  let result = value;
  for (const prop of path.split('.')) {
    if (!result || !Reflect.has(result, prop)) {
      return defaultValue;
    }
    result = result[prop];
  }
  return isNil(result) || result === value ? defaultValue : result;
}
function omit(value, propsToSkip) {
  if (!value) {
    return value;
  }
  const normalizedPropsToSkip = typeof propsToSkip === 'string' ? [propsToSkip] : propsToSkip;
  return Object.keys(value).reduce((result, prop) => {
    if (includes(normalizedPropsToSkip, prop)) {
      return result;
    }
    return Object.assign(result, { [prop]: value[prop] });
  }, {});
}
function size(value) {
  return isEmpty(value) ? 0 : value.length;
}
function once(fn) {
  let result;
  return (...args) => {
    if (fn) {
      result = fn(...args);
      fn = null;
    }
    return result;
  };
}
function defaultsDeep(target, ...sources) {
  return [target].concat(sources).reduce((result, source) => {
    if (!source) {
      return result;
    }
    Object.keys(source).forEach(prop => {
      if (isNil(result[prop])) {
        result[prop] = source[prop];
        return;
      }
      if (typeof result[prop] === 'object' && !Array.isArray(result[prop])) {
        result[prop] = defaultsDeep(result[prop], source[prop]);
        return;
      }
    });
    return result;
  }, {});
}
function includes(target, value) {
  if (isNil(target)) {
    return false;
  }
  const index = typeof target === 'string' ? target.indexOf(value) : target.indexOf(value);
  return index > -1;
}
function isNil(value) {
  return value === undefined || value === null;
}

class TreeService {
  nodeDraggableService;
  nodeMoved$ = new Subject();
  nodeRemoved$ = new Subject();
  nodeRenamed$ = new Subject();
  nodeCreated$ = new Subject();
  nodeSelected$ = new Subject();
  nodeUnselected$ = new Subject();
  nodeExpanded$ = new Subject();
  nodeCollapsed$ = new Subject();
  menuItemSelected$ = new Subject();
  loadNextLevel$ = new Subject();
  nodeChecked$ = new Subject();
  nodeUnchecked$ = new Subject();
  nodeIndetermined$ = new Subject();
  controllers = new Map();
  constructor(nodeDraggableService) {
    this.nodeDraggableService = nodeDraggableService;
    this.nodeRemoved$.subscribe(e => e.node.removeItselfFromParent());
  }
  unselectStream(tree) {
    return this.nodeSelected$.pipe(filter(e => tree !== e.node));
  }
  fireNodeRemoved(tree) {
    this.nodeRemoved$.next(new NodeRemovedEvent(tree, tree.positionInParent));
  }
  fireNodeCreated(tree) {
    this.nodeCreated$.next(new NodeCreatedEvent(tree));
  }
  fireNodeSelected(tree) {
    this.nodeSelected$.next(new NodeSelectedEvent(tree));
  }
  fireNodeUnselected(tree) {
    this.nodeUnselected$.next(new NodeUnselectedEvent(tree));
  }
  fireNodeRenamed(oldValue, tree) {
    this.nodeRenamed$.next(new NodeRenamedEvent(tree, oldValue, tree.value));
  }
  fireNodeMoved(tree, parent) {
    this.nodeMoved$.next(new NodeMovedEvent(tree, parent));
  }
  fireMenuItemSelected(tree, selectedItem) {
    this.menuItemSelected$.next(new MenuItemSelectedEvent(tree, selectedItem));
  }
  fireNodeSwitchFoldingType(tree) {
    if (tree.isNodeExpanded()) {
      this.fireNodeExpanded(tree);
      if (this.shouldFireLoadNextLevel(tree)) {
        this.fireLoadNextLevel(tree);
      }
    } else if (tree.isNodeCollapsed()) {
      this.fireNodeCollapsed(tree);
    }
  }
  fireNodeExpanded(tree) {
    this.nodeExpanded$.next(new NodeExpandedEvent(tree));
  }
  fireNodeCollapsed(tree) {
    this.nodeCollapsed$.next(new NodeCollapsedEvent(tree));
  }
  fireLoadNextLevel(tree) {
    this.loadNextLevel$.next(new LoadNextLevelEvent(tree));
  }
  fireNodeChecked(tree) {
    this.nodeChecked$.next(new NodeCheckedEvent(tree));
  }
  fireNodeUnchecked(tree) {
    this.nodeUnchecked$.next(new NodeUncheckedEvent(tree));
  }
  draggedStream(tree, element) {
    return this.nodeDraggableService.draggableNodeEvents$.pipe(
      filter(e => e.target === element),
      filter(e => !e.captured.tree.hasChild(tree))
    );
  }
  setController(id, controller) {
    this.controllers.set(id, controller);
  }
  deleteController(id) {
    if (this.controllers.has(id)) {
      this.controllers.delete(id);
    }
  }
  getController(id) {
    if (this.controllers.has(id)) {
      return this.controllers.get(id);
    }
    return null;
  }
  hasController(id) {
    return this.controllers.has(id);
  }
  shouldFireLoadNextLevel(tree) {
    const shouldLoadNextLevel =
      tree.node.emitLoadNextLevel &&
      !tree.node.loadChildren &&
      !tree.childrenAreBeingLoaded() &&
      isEmpty(tree.children);
    if (shouldLoadNextLevel) {
      tree.loadingChildrenRequested();
    }
    return shouldLoadNextLevel;
  }
  fireNodeIndetermined(tree) {
    this.nodeIndetermined$.next(new NodeIndeterminedEvent(tree));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeService,
    deps: [{ token: NodeDraggableService }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: TreeService
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: TreeService,
  decorators: [
    {
      type: Injectable
    }
  ],
  ctorParameters: function() {
    return [
      {
        type: NodeDraggableService,
        decorators: [
          {
            type: Inject,
            args: [NodeDraggableService]
          }
        ]
      }
    ];
  }
});

// This forces angular compiler to generate a "rxjs-imports.metadata.json"
// with a valid metadata instead of "[null]"
const noop = () => {};

class FoldingType {
  _cssClass;
  static Expanded = new FoldingType('node-expanded');
  static Collapsed = new FoldingType('node-collapsed');
  static Empty = new FoldingType('node-empty');
  static Leaf = new FoldingType('node-leaf');
  constructor(_cssClass) {
    this._cssClass = _cssClass;
  }
  get cssClass() {
    return this._cssClass;
  }
}
class TreeModelSettings {
  /* cssClasses - set custom css classes which will be used for a tree */
  cssClasses;
  /* Templates - set custom html templates to be used in a tree */
  templates;
  /**
   * "leftMenu" property when set to true makes left menu available.
   * @name TreeModelSettings#leftMenu
   * @type boolean
   * @default false
   */
  leftMenu;
  /**
   * "rightMenu" property when set to true makes right menu available.
   * @name TreeModelSettings#rightMenu
   * @type boolean
   * @default true
   */
  rightMenu;
  /**
   * "menu" property when set will be available as custom context menu.
   * @name TreeModelSettings#MenuItems
   * @type NodeMenuItem
   */
  menuItems;
  /**
   * "static" property when set to true makes it impossible to drag'n'drop tree or call a menu on it.
   * @name TreeModelSettings#static
   * @type boolean
   * @default false
   */
  static;
  isCollapsedOnInit;
  checked;
  selectionAllowed;
  keepNodesInDOM;
  static NOT_CASCADING_SETTINGS = ['selectionAllowed'];
  static merge(child, parent) {
    const parentCascadingSettings = omit(get(parent, 'settings'), TreeModelSettings.NOT_CASCADING_SETTINGS);
    return defaultsDeep({}, get(child, 'settings'), parentCascadingSettings, {
      static: false,
      leftMenu: false,
      rightMenu: true,
      isCollapsedOnInit: false,
      checked: false,
      keepNodesInDOM: false,
      selectionAllowed: true
    });
  }
}
class Ng2TreeSettings {
  /**
   * Indicates root visibility in the tree. When true - root is invisible.
   * @name Ng2TreeSettings#rootIsVisible
   * @type boolean
   */
  rootIsVisible = true;
  showCheckboxes = false;
  enableCheckboxes = true;
}
var TreeStatus;
(function(TreeStatus) {
  TreeStatus[(TreeStatus['New'] = 0)] = 'New';
  TreeStatus[(TreeStatus['Modified'] = 1)] = 'Modified';
  TreeStatus[(TreeStatus['IsBeingRenamed'] = 2)] = 'IsBeingRenamed';
})(TreeStatus || (TreeStatus = {}));

var ChildrenLoadingState;
(function(ChildrenLoadingState) {
  ChildrenLoadingState[(ChildrenLoadingState['NotStarted'] = 0)] = 'NotStarted';
  ChildrenLoadingState[(ChildrenLoadingState['Loading'] = 1)] = 'Loading';
  ChildrenLoadingState[(ChildrenLoadingState['Completed'] = 2)] = 'Completed';
})(ChildrenLoadingState || (ChildrenLoadingState = {}));
class Tree {
  _children;
  _loadChildren;
  _childrenLoadingState = ChildrenLoadingState.NotStarted;
  _childrenAsyncOnce = once(() => {
    return new Observable(observer => {
      setTimeout(() => {
        this._childrenLoadingState = ChildrenLoadingState.Loading;
        this._loadChildren(children => {
          this._children = (children || []).map(child => new Tree(child, this));
          this._childrenLoadingState = ChildrenLoadingState.Completed;
          observer.next(this.children);
          observer.complete();
        });
      });
    });
  });
  node;
  parent;
  // STATIC METHODS ----------------------------------------------------------------------------------------------------
  /**
   * Check that value passed is not empty (it doesn't consist of only whitespace symbols).
   * @param {string} value - A value that should be checked.
   * @returns {boolean} - A flag indicating that value is empty or not.
   * @static
   */
  static isValueEmpty(value) {
    return isEmpty(trim(value));
  }
  /**
   * Check whether a given value can be considered RenamableNode.
   * @param {any} value - A value to check.
   * @returns {boolean} - A flag indicating whether given value is Renamable node or not.
   * @static
   */
  static isRenamable(value) {
    return (
      has(value, 'setName') &&
      isFunction(value.setName) &&
      (has(value, 'toString') && isFunction(value.toString) && value.toString !== Object.toString)
    );
  }
  static cloneTreeShallow(origin) {
    const tree = new Tree(Object.assign({}, origin.node));
    tree._children = origin._children;
    return tree;
  }
  static applyNewValueToRenamable(value, newValue) {
    const renamableValue = Object.assign({}, value);
    renamableValue.setName(newValue);
    return renamableValue;
  }
  /**
   * Build an instance of Tree from an object implementing TreeModel interface.
   * @param {TreeModel} model - A model that is used to build a tree.
   * @param {Tree} [parent] - An optional parent if you want to build a tree from the model that should be a child of an existing Tree instance.
   * @param {boolean} [isBranch] - An option that makes a branch from created tree. Branch can have children.
   */
  constructor(node, parent = null, isBranch = false) {
    this.buildTreeFromModel(node, parent, isBranch || Array.isArray(node.children));
  }
  buildTreeFromModel(model, parent, isBranch) {
    this.parent = parent;
    this.node = Object.assign(
      omit(model, 'children'),
      { settings: TreeModelSettings.merge(model, get(parent, 'node')) },
      { emitLoadNextLevel: model.emitLoadNextLevel === true }
    );
    if (isFunction(this.node.loadChildren)) {
      this._loadChildren = this.node.loadChildren;
    } else {
      get(model, 'children', []).forEach((child, index) => {
        this._addChild(new Tree(child, this), index);
      });
    }
    if (!Array.isArray(this._children)) {
      this._children = this.node.loadChildren || isBranch ? [] : null;
    }
  }
  hasDeferredChildren() {
    return typeof this._loadChildren === 'function';
  }
  /* Setting the children loading state to Loading since a request was dispatched to the client */
  loadingChildrenRequested() {
    this._childrenLoadingState = ChildrenLoadingState.Loading;
  }
  /**
   * Check whether children of the node are being loaded.
   * Makes sense only for nodes that define `loadChildren` function.
   * @returns {boolean} A flag indicating that children are being loaded.
   */
  childrenAreBeingLoaded() {
    return this._childrenLoadingState === ChildrenLoadingState.Loading;
  }
  /**
   * Check whether children of the node were loaded.
   * Makes sense only for nodes that define `loadChildren` function.
   * @returns {boolean} A flag indicating that children were loaded.
   */
  childrenWereLoaded() {
    return this._childrenLoadingState === ChildrenLoadingState.Completed;
  }
  canLoadChildren() {
    return (
      this._childrenLoadingState === ChildrenLoadingState.NotStarted &&
      this.foldingType === FoldingType.Expanded &&
      !!this._loadChildren
    );
  }
  /**
   * Check whether children of the node should be loaded and not loaded yet.
   * Makes sense only for nodes that define `loadChildren` function.
   * @returns {boolean} A flag indicating that children should be loaded for the current node.
   */
  childrenShouldBeLoaded() {
    return !this.childrenWereLoaded() && (!!this._loadChildren || this.node.emitLoadNextLevel === true);
  }
  /**
   * Get children of the current tree.
   * @returns {Tree[]} The children of the current tree.
   */
  get children() {
    return this._children;
  }
  /**
   * By getting value from this property you start process of loading node's children using `loadChildren` function.
   * Once children are loaded `loadChildren` function won't be called anymore and loaded for the first time children are emitted in case of subsequent calls.
   * @returns {Observable<Tree[]>} An observable which emits children once they are loaded.
   */
  get childrenAsync() {
    if (this.canLoadChildren()) {
      return this._childrenAsyncOnce();
    }
    return of(this.children);
  }
  /**
   * By calling this method you start process of loading node's children using `loadChildren` function.
   */
  reloadChildren() {
    if (this.childrenShouldBeLoaded()) {
      this._childrenLoadingState = ChildrenLoadingState.Loading;
      this._loadChildren(children => {
        this._children = children && children.map(child => new Tree(child, this));
        this._childrenLoadingState = ChildrenLoadingState.Completed;
      });
    }
  }
  /**
   * By calling this method you will remove all current children of a treee and create new.
   */
  setChildren(children) {
    this._children = children && children.map(child => new Tree(child, this));
    if (this.childrenShouldBeLoaded()) {
      this._childrenLoadingState = ChildrenLoadingState.Completed;
    }
  }
  /**
   * Create a new node in the current tree.
   * @param {boolean} isBranch - A flag that indicates whether a new node should be a "Branch". "Leaf" node will be created by default
   * @param {TreeModel} model - Tree model of the new node which will be inserted. Empty node will be created by default and it will fire edit mode of this node
   * @returns {Tree} A newly created child node.
   */
  createNode(isBranch, model = { value: '' }) {
    const tree = new Tree(model, this, isBranch);
    if (!model.id) {
      tree.markAsNew();
    }
    tree.id = tree.id || v4();
    if (this.childrenShouldBeLoaded() && !(this.childrenAreBeingLoaded() || this.childrenWereLoaded())) {
      return null;
    }
    if (this.isLeaf()) {
      return this.addSibling(tree);
    } else {
      return this.addChild(tree);
    }
  }
  /**
   * Get the value of the current node
   * @returns {(string|RenamableNode)} The value of the node.
   */
  get value() {
    return this.node.value;
  }
  set checked(checked) {
    this.node.settings = Object.assign({}, this.node.settings, { checked });
  }
  get checked() {
    return !!get(this.node.settings, 'checked');
  }
  get checkedChildren() {
    return this.hasLoadedChildern() ? this.children.filter(child => child.checked) : [];
  }
  set selectionAllowed(selectionAllowed) {
    this.node.settings = Object.assign({}, this.node.settings, { selectionAllowed });
  }
  get selectionAllowed() {
    const value = get(this.node.settings, 'selectionAllowed');
    return isNil(value) ? true : !!value;
  }
  hasLoadedChildern() {
    return !isEmpty(this.children);
  }
  loadedChildrenAmount() {
    return size(this.children);
  }
  checkedChildrenAmount() {
    return size(this.checkedChildren);
  }
  /**
   * Set the value of the current node
   * @param {(string|RenamableNode)} value - The new value of the node.
   */
  set value(value) {
    if (typeof value !== 'string' && !Tree.isRenamable(value)) {
      return;
    }
    const stringifiedValue = '' + value;
    if (Tree.isRenamable(this.value)) {
      this.node.value = Tree.applyNewValueToRenamable(this.value, stringifiedValue);
    } else {
      this.node.value = Tree.isValueEmpty(stringifiedValue) ? this.node.value : stringifiedValue;
    }
  }
  /**
   * Add a sibling node for the current node. This won't work if the current node is a root.
   * @param {Tree} sibling - A node that should become a sibling.
   * @param [number] position - Position in which sibling will be inserted. By default it will be inserted at the last position in a parent.
   * @returns {Tree} A newly inserted sibling, or null if you are trying to make a sibling for the root.
   */
  addSibling(sibling, position) {
    if (Array.isArray(get(this.parent, 'children'))) {
      return this.parent.addChild(sibling, position);
    }
    return null;
  }
  /**
   * Add a child node for the current node.
   * @param {Tree} child - A node that should become a child.
   * @param [number] position - Position in which child will be inserted. By default it will be inserted at the last position in a parent.
   * @returns {Tree} A newly inserted child.
   */
  addChild(child, position) {
    const newborn = this._addChild(Tree.cloneTreeShallow(child), position);
    this._setFoldingType();
    if (this.isNodeCollapsed()) {
      this.switchFoldingType();
    }
    return newborn;
  }
  _addChild(child, position = size(this._children) || 0) {
    child.parent = this;
    if (Array.isArray(this._children)) {
      this._children.splice(position, 0, child);
    } else {
      this._children = [child];
    }
    return child;
  }
  /**
   * Swap position of the current node with the given sibling. If node passed as a parameter is not a sibling - nothing happens.
   * @param {Tree} sibling - A sibling with which current node shold be swapped.
   */
  swapWithSibling(sibling) {
    if (!this.hasSibling(sibling)) {
      return;
    }
    const siblingIndex = sibling.positionInParent;
    const thisTreeIndex = this.positionInParent;
    this.parent._children[siblingIndex] = this;
    this.parent._children[thisTreeIndex] = sibling;
  }
  /**
   * Get a node's position in its parent.
   * @returns {number} The position inside a parent.
   */
  get positionInParent() {
    if (this.isRoot()) {
      return -1;
    }
    return this.parent.children ? this.parent.children.indexOf(this) : -1;
  }
  /**
   * Check whether or not this tree is static.
   * @returns {boolean} A flag indicating whether or not this tree is static.
   */
  isStatic() {
    return get(this.node.settings, 'static', false);
  }
  /**
   * Check whether or not this tree has a left menu.
   * @returns {boolean} A flag indicating whether or not this tree has a left menu.
   */
  hasLeftMenu() {
    return !get(this.node.settings, 'static', false) && get(this.node.settings, 'leftMenu', false);
  }
  /**
   * Check whether or not this tree has a right menu.
   * @returns {boolean} A flag indicating whether or not this tree has a right menu.
   */
  hasRightMenu() {
    return !get(this.node.settings, 'static', false) && get(this.node.settings, 'rightMenu', false);
  }
  /**
   * Check whether this tree is "Leaf" or not.
   * @returns {boolean} A flag indicating whether or not this tree is a "Leaf".
   */
  isLeaf() {
    return !this.isBranch();
  }
  /**
   * Get menu items of the current tree.
   * @returns {NodeMenuItem[]} The menu items of the current tree.
   */
  get menuItems() {
    return get(this.node.settings, 'menuItems');
  }
  /**
   * Check whether or not this tree has a custom menu.
   * @returns {boolean} A flag indicating whether or not this tree has a custom menu.
   */
  hasCustomMenu() {
    return !this.isStatic() && !!get(this.node.settings, 'menuItems', false);
  }
  /**
   * Check whether this tree is "Branch" or not. "Branch" is a node that has children.
   * @returns {boolean} A flag indicating whether or not this tree is a "Branch".
   */
  isBranch() {
    return this.node.emitLoadNextLevel === true || Array.isArray(this._children);
  }
  /**
   * Check whether this tree has children.
   * @returns {boolean} A flag indicating whether or not this tree has children.
   */
  hasChildren() {
    return !isEmpty(this._children) || this.childrenShouldBeLoaded();
  }
  /**
   * Check whether this tree is a root or not. The root is the tree (node) that doesn't have parent (or technically its parent is null).
   * @returns {boolean} A flag indicating whether or not this tree is the root.
   */
  isRoot() {
    return isNil(this.parent);
  }
  /**
   * Check whether provided tree is a sibling of the current tree. Sibling trees (nodes) are the trees that have the same parent.
   * @param {Tree} tree - A tree that should be tested on a siblingness.
   * @returns {boolean} A flag indicating whether or not provided tree is the sibling of the current one.
   */
  hasSibling(tree) {
    return !this.isRoot() && includes(this.parent.children, tree);
  }
  /**
   * Check whether provided tree is a child of the current tree.
   * This method tests that provided tree is a <strong>direct</strong> child of the current tree.
   * @param {Tree} tree - A tree that should be tested (child candidate).
   * @returns {boolean} A flag indicating whether provided tree is a child or not.
   */
  hasChild(tree) {
    return includes(this._children, tree);
  }
  /**
   * Remove given tree from the current tree.
   * The given tree will be removed only in case it is a direct child of the current tree (@see {@link hasChild}).
   * @param {Tree} tree - A tree that should be removed.
   */
  removeChild(tree) {
    if (!this.hasChildren()) {
      return;
    }
    const childIndex = this._children.findIndex(child => child === tree);
    if (childIndex >= 0) {
      this._children.splice(childIndex, 1);
    }
    this._setFoldingType();
  }
  /**
   * Remove current tree from its parent.
   */
  removeItselfFromParent() {
    if (!this.parent) {
      return;
    }
    this.parent.removeChild(this);
  }
  /**
   * Switch folding type of the current tree. "Leaf" node cannot switch its folding type cause it doesn't have children, hence nothing to fold.
   * If node is a "Branch" and it is expanded, then by invoking current method state of the tree should be switched to "collapsed" and vice versa.
   */
  switchFoldingType() {
    if (this.isLeaf() || !this.hasChildren()) {
      return;
    }
    this.disableCollapseOnInit();
    this.node._foldingType = this.isNodeExpanded() ? FoldingType.Collapsed : FoldingType.Expanded;
  }
  /**
   * Check that tree is expanded.
   * @returns {boolean} A flag indicating whether current tree is expanded. Always returns false for the "Leaf" tree and for an empty tree.
   */
  isNodeExpanded() {
    return this.foldingType === FoldingType.Expanded;
  }
  /**
   * Check that tree is collapsed.
   * @returns {boolean} A flag indicating whether current tree is collapsed. Always returns false for the "Leaf" tree and for an empty tree.
   */
  isNodeCollapsed() {
    return this.foldingType === FoldingType.Collapsed;
  }
  /**
   * Set a current folding type: expanded, collapsed or leaf.
   */
  _setFoldingType() {
    if (this.childrenShouldBeLoaded()) {
      this.node._foldingType = FoldingType.Collapsed;
    } else if (this._children && !isEmpty(this._children)) {
      this.node._foldingType = this.isCollapsedOnInit() ? FoldingType.Collapsed : FoldingType.Expanded;
    } else if (Array.isArray(this._children)) {
      this.node._foldingType = FoldingType.Empty;
    } else {
      this.node._foldingType = FoldingType.Leaf;
    }
  }
  /**
   * Get a current folding type: expanded, collapsed or leaf.
   * @returns {FoldingType} A folding type of the current tree.
   */
  get foldingType() {
    if (!this.node._foldingType) {
      this._setFoldingType();
    }
    return this.node._foldingType;
  }
  /**
   * Get a css class for element which displayes folding state - expanded, collapsed or leaf
   * @returns {string} A string icontaining css class (classes)
   */
  get foldingCssClass() {
    return this.getCssClassesFromSettings() || this.foldingType.cssClass;
  }
  getCssClassesFromSettings() {
    if (!this.node._foldingType) {
      this._setFoldingType();
    }
    if (this.node._foldingType === FoldingType.Collapsed) {
      return get(this.node.settings, 'cssClasses.collapsed', null);
    } else if (this.node._foldingType === FoldingType.Expanded) {
      return get(this.node.settings, 'cssClasses.expanded', null);
    } else if (this.node._foldingType === FoldingType.Empty) {
      return get(this.node.settings, 'cssClasses.empty', null);
    }
    return get(this.node.settings, 'cssClasses.leaf', null);
  }
  /**
   * Get a html template to render before every node's name.
   * @returns {string} A string representing a html template.
   */
  get nodeTemplate() {
    return this.getTemplateFromSettings();
  }
  getTemplateFromSettings() {
    if (this.isLeaf()) {
      return get(this.node.settings, 'templates.leaf', '');
    } else {
      return get(this.node.settings, 'templates.node', '');
    }
  }
  /**
   * Get a html template to render for an element activatin left menu of a node.
   * @returns {string} A string representing a html template.
   */
  get leftMenuTemplate() {
    if (this.hasLeftMenu()) {
      return get(this.node.settings, 'templates.leftMenu', '<span></span>');
    }
    return '';
  }
  disableCollapseOnInit() {
    if (this.node.settings) {
      this.node.settings.isCollapsedOnInit = false;
    }
  }
  isCollapsedOnInit() {
    return !!get(this.node.settings, 'isCollapsedOnInit');
  }
  keepNodesInDOM() {
    return get(this.node.settings, 'keepNodesInDOM');
  }
  /**
   * Check that current tree is newly created (added by user via menu for example). Tree that was built from the TreeModel is not marked as new.
   * @returns {boolean} A flag whether the tree is new.
   */
  isNew() {
    return this.node._status === TreeStatus.New;
  }
  get id() {
    return get(this.node, 'id');
  }
  set id(id) {
    this.node.id = id;
  }
  /**
   * Mark current tree as new (@see {@link isNew}).
   */
  markAsNew() {
    this.node._status = TreeStatus.New;
  }
  /**
   * Check that current tree is being renamed (it is in the process of its value renaming initiated by a user).
   * @returns {boolean} A flag whether the tree is being renamed.
   */
  isBeingRenamed() {
    return this.node._status === TreeStatus.IsBeingRenamed;
  }
  /**
   * Mark current tree as being renamed (@see {@link isBeingRenamed}).
   */
  markAsBeingRenamed() {
    this.node._status = TreeStatus.IsBeingRenamed;
  }
  /**
   * Check that current tree is modified (for example it was renamed).
   * @returns {boolean} A flag whether the tree is modified.
   */
  isModified() {
    return this.node._status === TreeStatus.Modified;
  }
  /**
   * Mark current tree as modified (@see {@link isModified}).
   */
  markAsModified() {
    this.node._status = TreeStatus.Modified;
  }
  /**
   * Makes a clone of an underlying TreeModel instance
   * @returns {TreeModel} a clone of an underlying TreeModel instance
   */
  toTreeModel() {
    const model = defaultsDeep(this.isLeaf() ? {} : { children: [] }, this.node);
    if (this.children) {
      this.children.forEach(child => {
        model.children.push(child.toTreeModel());
      });
    }
    return model;
  }
}

var NodeMenuItemAction;
(function(NodeMenuItemAction) {
  NodeMenuItemAction[(NodeMenuItemAction['NewFolder'] = 0)] = 'NewFolder';
  NodeMenuItemAction[(NodeMenuItemAction['NewTag'] = 1)] = 'NewTag';
  NodeMenuItemAction[(NodeMenuItemAction['Rename'] = 2)] = 'Rename';
  NodeMenuItemAction[(NodeMenuItemAction['Remove'] = 3)] = 'Remove';
  NodeMenuItemAction[(NodeMenuItemAction['Custom'] = 4)] = 'Custom';
})(NodeMenuItemAction || (NodeMenuItemAction = {}));
var NodeMenuAction;
(function(NodeMenuAction) {
  NodeMenuAction[(NodeMenuAction['Close'] = 0)] = 'Close';
})(NodeMenuAction || (NodeMenuAction = {}));

var Keys;
(function(Keys) {
  Keys[(Keys['Escape'] = 27)] = 'Escape';
})(Keys || (Keys = {}));
var MouseButtons;
(function(MouseButtons) {
  MouseButtons[(MouseButtons['Left'] = 0)] = 'Left';
  MouseButtons[(MouseButtons['Right'] = 2)] = 'Right';
})(MouseButtons || (MouseButtons = {}));
function isLeftButtonClicked(e) {
  return e.button === MouseButtons.Left;
}
function isRightButtonClicked(e) {
  return e.button === MouseButtons.Right;
}
function isEscapePressed(e) {
  return e.keyCode === Keys.Escape;
}

class TreeController {
  component;
  tree;
  treeService;
  constructor(component) {
    this.component = component;
    this.tree = this.component.tree;
    this.treeService = this.component.treeService;
  }
  select() {
    if (!this.isSelected()) {
      this.component.onNodeSelected({ button: MouseButtons.Left });
    }
  }
  unselect() {
    if (this.isSelected()) {
      this.component.onNodeUnselected({ button: MouseButtons.Left });
    }
  }
  isSelected() {
    return this.component.isSelected;
  }
  expand() {
    if (this.isCollapsed()) {
      this.component.onSwitchFoldingType();
    }
  }
  expandToParent(tree = this.tree) {
    if (tree) {
      const controller = this.treeService.getController(tree.id);
      if (controller) {
        requestAnimationFrame(() => {
          controller.expand();
          this.expandToParent(tree.parent);
        });
      }
    }
  }
  isExpanded() {
    return this.tree.isNodeExpanded();
  }
  collapse() {
    if (this.isExpanded()) {
      this.component.onSwitchFoldingType();
    }
  }
  isCollapsed() {
    return this.tree.isNodeCollapsed();
  }
  toTreeModel() {
    return this.tree.toTreeModel();
  }
  rename(newValue) {
    this.tree.markAsBeingRenamed();
    this.component.applyNewValue({ type: 'keyup', value: newValue });
  }
  remove() {
    this.component.onMenuItemSelected({ nodeMenuItemAction: NodeMenuItemAction.Remove });
  }
  addChild(newNode) {
    if (this.tree.hasDeferredChildren() && !this.tree.childrenWereLoaded()) {
      return;
    }
    const newTree = this.tree.createNode(Array.isArray(newNode.children), newNode);
    this.treeService.fireNodeCreated(newTree);
  }
  addChildAsync(newNode) {
    if (this.tree.hasDeferredChildren() && !this.tree.childrenWereLoaded()) {
      return Promise.reject(
        new Error('This node loads its children asynchronously, hence child cannot be added this way')
      );
    }
    const newTree = this.tree.createNode(Array.isArray(newNode.children), newNode);
    this.treeService.fireNodeCreated(newTree);
    // This will give TreeInternalComponent to set up a controller for the node
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(newTree);
      });
    });
  }
  changeNodeId(id) {
    if (!id) {
      throw Error('You should supply an id!');
    }
    if (this.treeService.hasController(id)) {
      throw Error(`Controller already exists for the given id: ${id}`);
    }
    this.treeService.deleteController(this.tree.id);
    this.tree.id = id;
    this.treeService.setController(this.tree.id, this);
  }
  reloadChildren() {
    this.tree.reloadChildren();
  }
  setChildren(children) {
    if (!this.tree.isLeaf()) {
      this.tree.setChildren(children);
    }
  }
  startRenaming() {
    this.tree.markAsBeingRenamed();
  }
  check() {
    this.component.onNodeChecked();
  }
  uncheck() {
    this.component.onNodeUnchecked();
  }
  isChecked() {
    return this.tree.checked;
  }
  isIndetermined() {
    return get(this.component, 'checkboxElementRef.nativeElement.indeterminate');
  }
  allowSelection() {
    this.tree.selectionAllowed = true;
  }
  forbidSelection() {
    this.tree.selectionAllowed = false;
  }
  isSelectionAllowed() {
    return this.tree.selectionAllowed;
  }
}

var NodeEditableEventAction;
(function(NodeEditableEventAction) {
  NodeEditableEventAction[(NodeEditableEventAction['Cancel'] = 0)] = 'Cancel';
})(NodeEditableEventAction || (NodeEditableEventAction = {}));

class NodeMenuService {
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

class CapturedNode {
  anElement;
  aTree;
  constructor(anElement, aTree) {
    this.anElement = anElement;
    this.aTree = aTree;
  }
  canBeDroppedAt(element) {
    return !this.sameAs(element) && !this.contains(element);
  }
  contains(other) {
    return this.element.nativeElement.contains(other.nativeElement);
  }
  sameAs(other) {
    return this.element === other;
  }
  get element() {
    return this.anElement;
  }
  get tree() {
    return this.aTree;
  }
}

class NodeDraggableDirective {
  element;
  nodeDraggableService;
  renderer;
  static DATA_TRANSFER_STUB_DATA = 'some browsers enable drag-n-drop only when dataTransfer has data';
  nodeDraggable;
  tree;
  nodeNativeElement;
  disposersForDragListeners = [];
  constructor(element, nodeDraggableService, renderer) {
    this.element = element;
    this.nodeDraggableService = nodeDraggableService;
    this.renderer = renderer;
    this.nodeNativeElement = element.nativeElement;
  }
  ngOnInit() {
    if (!this.tree.isStatic()) {
      this.renderer.setAttribute(this.nodeNativeElement, 'draggable', 'true');
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'dragenter', this.handleDragEnter.bind(this))
      );
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'dragover', this.handleDragOver.bind(this))
      );
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'dragstart', this.handleDragStart.bind(this))
      );
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'dragleave', this.handleDragLeave.bind(this))
      );
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'drop', this.handleDrop.bind(this))
      );
      this.disposersForDragListeners.push(
        this.renderer.listen(this.nodeNativeElement, 'dragend', this.handleDragEnd.bind(this))
      );
    }
  }
  ngOnDestroy() {
    /* tslint:disable:typedef */
    this.disposersForDragListeners.forEach(dispose => dispose());
    /* tslint:enable:typedef */
  }
  handleDragStart(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    this.nodeDraggableService.captureNode(new CapturedNode(this.nodeDraggable, this.tree));
    e.dataTransfer.setData('text', NodeDraggableDirective.DATA_TRANSFER_STUB_DATA);
    e.dataTransfer.effectAllowed = 'move';
  }
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  handleDragEnter(e) {
    e.preventDefault();
    if (this.containsElementAt(e)) {
      this.addClass('over-drop-target');
    }
  }
  handleDragLeave(e) {
    if (!this.containsElementAt(e)) {
      this.removeClass('over-drop-target');
    }
  }
  handleDrop(e) {
    e.preventDefault();
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    this.removeClass('over-drop-target');
    if (!this.isDropPossible(e)) {
      return false;
    }
    if (this.nodeDraggableService.getCapturedNode()) {
      return this.notifyThatNodeWasDropped();
    }
  }
  isDropPossible(e) {
    const capturedNode = this.nodeDraggableService.getCapturedNode();
    return capturedNode && capturedNode.canBeDroppedAt(this.nodeDraggable) && this.containsElementAt(e);
  }
  handleDragEnd(e) {
    this.removeClass('over-drop-target');
    this.nodeDraggableService.releaseCapturedNode();
  }
  containsElementAt(e) {
    const { x = e.clientX, y = e.clientY } = e;
    return this.nodeNativeElement.contains(document.elementFromPoint(x, y));
  }
  addClass(className) {
    const classList = this.nodeNativeElement.classList;
    classList.add(className);
  }
  removeClass(className) {
    const classList = this.nodeNativeElement.classList;
    classList.remove(className);
  }
  notifyThatNodeWasDropped() {
    this.nodeDraggableService.fireNodeDragged(this.nodeDraggableService.getCapturedNode(), this.nodeDraggable);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeDraggableDirective,
    deps: [{ token: ElementRef }, { token: NodeDraggableService }, { token: Renderer2 }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: '14.0.0',
    version: '16.2.12',
    type: NodeDraggableDirective,
    selector: '[nodeDraggable]',
    inputs: { nodeDraggable: 'nodeDraggable', tree: 'tree' },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: NodeDraggableDirective,
  decorators: [
    {
      type: Directive,
      args: [
        {
          selector: '[nodeDraggable]'
        }
      ]
    }
  ],
  ctorParameters: function() {
    return [
      {
        type: i0.ElementRef,
        decorators: [
          {
            type: Inject,
            args: [ElementRef]
          }
        ]
      },
      {
        type: NodeDraggableService,
        decorators: [
          {
            type: Inject,
            args: [NodeDraggableService]
          }
        ]
      },
      {
        type: i0.Renderer2,
        decorators: [
          {
            type: Inject,
            args: [Renderer2]
          }
        ]
      }
    ];
  },
  propDecorators: {
    nodeDraggable: [
      {
        type: Input
      }
    ],
    tree: [
      {
        type: Input
      }
    ]
  }
});

class NodeEditableDirective {
  renderer;
  elementRef;
  /* tslint:disable:no-input-rename */
  nodeValue;
  /* tslint:enable:no-input-rename */
  valueChanged = new EventEmitter(false);
  constructor(renderer, elementRef) {
    this.renderer = renderer;
    this.elementRef = elementRef;
  }
  ngOnInit() {
    const nativeElement = this.elementRef.nativeElement;
    if (nativeElement) {
      nativeElement.focus();
    }
    this.renderer.setProperty(nativeElement, 'value', this.nodeValue);
  }
  applyNewValue(newNodeValue) {
    this.valueChanged.emit({ type: 'keyup', value: newNodeValue });
  }
  applyNewValueByLoosingFocus(newNodeValue) {
    this.valueChanged.emit({ type: 'blur', value: newNodeValue });
  }
  cancelEditing() {
    this.valueChanged.emit({
      type: 'keyup',
      value: this.nodeValue,
      action: NodeEditableEventAction.Cancel
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: NodeEditableDirective,
    deps: [{ token: Renderer2 }, { token: ElementRef }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: '14.0.0',
    version: '16.2.12',
    type: NodeEditableDirective,
    selector: '[nodeEditable]',
    inputs: { nodeValue: ['nodeEditable', 'nodeValue'] },
    outputs: { valueChanged: 'valueChanged' },
    host: {
      listeners: {
        'keyup.enter': 'applyNewValue($event.target.value)',
        blur: 'applyNewValueByLoosingFocus($event.target.value)',
        'keyup.esc': 'cancelEditing()'
      }
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: NodeEditableDirective,
  decorators: [
    {
      type: Directive,
      args: [
        {
          selector: '[nodeEditable]'
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
        type: i0.ElementRef,
        decorators: [
          {
            type: Inject,
            args: [ElementRef]
          }
        ]
      }
    ];
  },
  propDecorators: {
    nodeValue: [
      {
        type: Input,
        args: ['nodeEditable']
      }
    ],
    valueChanged: [
      {
        type: Output
      }
    ],
    applyNewValue: [
      {
        type: HostListener,
        args: ['keyup.enter', ['$event.target.value']]
      }
    ],
    applyNewValueByLoosingFocus: [
      {
        type: HostListener,
        args: ['blur', ['$event.target.value']]
      }
    ],
    cancelEditing: [
      {
        type: HostListener,
        args: ['keyup.esc']
      }
    ]
  }
});

class NodeMenuComponent {
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
        type: i3.NgForOf,
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
        type: NodeMenuService,
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

class SafeHtmlPipe {
  sanitizer;
  constructor(sanitizer) {
    this.sanitizer = sanitizer;
  }
  transform(value) {
    // return value;
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: SafeHtmlPipe,
    deps: [{ token: i1.DomSanitizer }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: '14.0.0',
    version: '16.2.12',
    ngImport: i0,
    type: SafeHtmlPipe,
    name: 'safeHtml'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '16.2.12',
  ngImport: i0,
  type: SafeHtmlPipe,
  decorators: [
    {
      type: Pipe,
      args: [{ name: 'safeHtml' }]
    }
  ],
  ctorParameters: function() {
    return [{ type: i1.DomSanitizer }];
  }
});

class TreeInternalComponent {
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
    if (isLeftButtonClicked(e)) {
      this.isSelected = true;
      this.treeService.fireNodeSelected(this.tree);
    }
  }
  onNodeUnselected(e) {
    if (!this.tree.selectionAllowed) {
      return;
    }
    if (isLeftButtonClicked(e)) {
      this.isSelected = false;
      this.treeService.fireNodeUnselected(this.tree);
    }
  }
  showRightMenu(e) {
    if (!this.tree.hasRightMenu()) {
      return;
    }
    if (isRightButtonClicked(e)) {
      this.isRightMenuVisible = !this.isRightMenuVisible;
      this.nodeMenuService.hideMenuForAllNodesExcept(this.nodeElementRef);
    }
    e.preventDefault();
  }
  showLeftMenu(e) {
    if (!this.tree.hasLeftMenu()) {
      return;
    }
    if (isLeftButtonClicked(e)) {
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
    deps: [{ token: NodeMenuService }, { token: TreeService }, { token: i0.ElementRef }],
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
        type: NodeDraggableDirective,
        selector: '[nodeDraggable]',
        inputs: ['nodeDraggable', 'tree']
      },
      {
        kind: 'directive',
        type: NodeEditableDirective,
        selector: '[nodeEditable]',
        inputs: ['nodeEditable'],
        outputs: ['valueChanged']
      },
      {
        kind: 'component',
        type: NodeMenuComponent,
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
      { kind: 'pipe', type: SafeHtmlPipe, name: 'safeHtml' }
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
    return [{ type: NodeMenuService }, { type: TreeService }, { type: i0.ElementRef }];
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

class TreeComponent {
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
        type: TreeInternalComponent,
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
        type: TreeService,
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

class TreeModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export {
  CapturedNode,
  FoldingType,
  Keys,
  LoadNextLevelEvent,
  MenuItemSelectedEvent,
  MouseButtons,
  Ng2TreeSettings,
  NodeCheckedEvent,
  NodeCollapsedEvent,
  NodeCreatedEvent,
  NodeDestructiveEvent,
  NodeDraggableDirective,
  NodeDraggableEvent,
  NodeDraggableService,
  NodeEditableDirective,
  NodeEditableEventAction,
  NodeEvent,
  NodeExpandedEvent,
  NodeIndeterminedEvent,
  NodeMenuAction,
  NodeMenuComponent,
  NodeMenuItemAction,
  NodeMenuService,
  NodeMovedEvent,
  NodeRemovedEvent,
  NodeRenamedEvent,
  NodeSelectedEvent,
  NodeUncheckedEvent,
  NodeUnselectedEvent,
  SafeHtmlPipe,
  Tree,
  TreeComponent,
  TreeController,
  TreeInternalComponent,
  TreeModelSettings,
  TreeModule,
  TreeService,
  TreeStatus,
  defaultsDeep,
  get,
  has,
  includes,
  isEmpty,
  isEscapePressed,
  isFunction,
  isLeftButtonClicked,
  isNil,
  isRightButtonClicked,
  omit,
  once,
  size,
  trim
};
//# sourceMappingURL=ng2-tree.mjs.map
