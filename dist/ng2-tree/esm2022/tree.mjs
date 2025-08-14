import { defaultsDeep, get, has, includes, isEmpty, isFunction, isNil, omit, once, size, trim } from './utils/fn.utils';
import { FoldingType, TreeModelSettings, TreeStatus } from './tree.types';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
var ChildrenLoadingState;
(function(ChildrenLoadingState) {
  ChildrenLoadingState[(ChildrenLoadingState['NotStarted'] = 0)] = 'NotStarted';
  ChildrenLoadingState[(ChildrenLoadingState['Loading'] = 1)] = 'Loading';
  ChildrenLoadingState[(ChildrenLoadingState['Completed'] = 2)] = 'Completed';
})(ChildrenLoadingState || (ChildrenLoadingState = {}));
export class Tree {
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
    tree.id = tree.id || uuidv4();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFeEgsT0FBTyxFQUVMLFdBQVcsRUFHWCxpQkFBaUIsRUFDakIsVUFBVSxFQUNYLE1BQU0sY0FBYyxDQUFDO0FBR3RCLE9BQU8sRUFBRSxFQUFFLElBQUksTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxVQUFVLEVBQVksRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRWhELElBQUssb0JBSUo7QUFKRCxXQUFLLG9CQUFvQjtJQUN2QiwyRUFBVSxDQUFBO0lBQ1YscUVBQU8sQ0FBQTtJQUNQLHlFQUFTLENBQUE7QUFDWCxDQUFDLEVBSkksb0JBQW9CLEtBQXBCLG9CQUFvQixRQUl4QjtBQUVELE1BQU0sT0FBTyxJQUFJO0lBQ1AsU0FBUyxDQUFTO0lBQ2xCLGFBQWEsQ0FBMEI7SUFDdkMscUJBQXFCLEdBQXlCLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztJQUM5RSxrQkFBa0IsR0FBNkIsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMvRCxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsUUFBMEIsRUFBRSxFQUFFO1lBQ25ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQztnQkFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQXFCLEVBQUUsRUFBRTtvQkFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFH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QzNDLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmF1bHRzRGVlcCwgZ2V0LCBoYXMsIGluY2x1ZGVzLCBpc0VtcHR5LCBpc0Z1bmN0aW9uLCBpc05pbCwgb21pdCwgb25jZSwgc2l6ZSwgdHJpbSB9IGZyb20gJy4vdXRpbHMvZm4udXRpbHMnO1xyXG5cclxuaW1wb3J0IHtcclxuICBDaGlsZHJlbkxvYWRpbmdGdW5jdGlvbixcclxuICBGb2xkaW5nVHlwZSxcclxuICBSZW5hbWFibGVOb2RlLFxyXG4gIFRyZWVNb2RlbCxcclxuICBUcmVlTW9kZWxTZXR0aW5ncyxcclxuICBUcmVlU3RhdHVzXHJcbn0gZnJvbSAnLi90cmVlLnR5cGVzJztcclxuaW1wb3J0IHsgTm9kZU1lbnVJdGVtIH0gZnJvbSAnLi9tZW51L25vZGUtbWVudS5jb21wb25lbnQnO1xyXG5cclxuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIE9ic2VydmVyLCBvZiB9IGZyb20gJ3J4anMnO1xyXG5cclxuZW51bSBDaGlsZHJlbkxvYWRpbmdTdGF0ZSB7XHJcbiAgTm90U3RhcnRlZCxcclxuICBMb2FkaW5nLFxyXG4gIENvbXBsZXRlZFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJlZSB7XHJcbiAgcHJpdmF0ZSBfY2hpbGRyZW46IFRyZWVbXTtcclxuICBwcml2YXRlIF9sb2FkQ2hpbGRyZW46IENoaWxkcmVuTG9hZGluZ0Z1bmN0aW9uO1xyXG4gIHByaXZhdGUgX2NoaWxkcmVuTG9hZGluZ1N0YXRlOiBDaGlsZHJlbkxvYWRpbmdTdGF0ZSA9IENoaWxkcmVuTG9hZGluZ1N0YXRlLk5vdFN0YXJ0ZWQ7XHJcbiAgcHJpdmF0ZSBfY2hpbGRyZW5Bc3luY09uY2U6ICgpID0+IE9ic2VydmFibGU8VHJlZVtdPiA9IG9uY2UoKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8VHJlZVtdPikgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9IENoaWxkcmVuTG9hZGluZ1N0YXRlLkxvYWRpbmc7XHJcbiAgICAgICAgdGhpcy5fbG9hZENoaWxkcmVuKChjaGlsZHJlbjogVHJlZU1vZGVsW10pID0+IHtcclxuICAgICAgICAgIHRoaXMuX2NoaWxkcmVuID0gKGNoaWxkcmVuIHx8IFtdKS5tYXAoKGNoaWxkOiBUcmVlTW9kZWwpID0+IG5ldyBUcmVlKGNoaWxkLCB0aGlzKSk7XHJcbiAgICAgICAgICB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9IENoaWxkcmVuTG9hZGluZ1N0YXRlLkNvbXBsZXRlZDtcclxuICAgICAgICAgIG9ic2VydmVyLm5leHQodGhpcy5jaGlsZHJlbik7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBwdWJsaWMgbm9kZTogVHJlZU1vZGVsO1xyXG4gIHB1YmxpYyBwYXJlbnQ6IFRyZWU7XHJcblxyXG4gIC8vIFNUQVRJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdGhhdCB2YWx1ZSBwYXNzZWQgaXMgbm90IGVtcHR5IChpdCBkb2Vzbid0IGNvbnNpc3Qgb2Ygb25seSB3aGl0ZXNwYWNlIHN5bWJvbHMpLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEEgdmFsdWUgdGhhdCBzaG91bGQgYmUgY2hlY2tlZC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBBIGZsYWcgaW5kaWNhdGluZyB0aGF0IHZhbHVlIGlzIGVtcHR5IG9yIG5vdC5cclxuICAgKiBAc3RhdGljXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpc1ZhbHVlRW1wdHkodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGlzRW1wdHkodHJpbSh2YWx1ZSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIHZhbHVlIGNhbiBiZSBjb25zaWRlcmVkIFJlbmFtYWJsZU5vZGUuXHJcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlIC0gQSB2YWx1ZSB0byBjaGVjay5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGdpdmVuIHZhbHVlIGlzIFJlbmFtYWJsZSBub2RlIG9yIG5vdC5cclxuICAgKiBAc3RhdGljXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpc1JlbmFtYWJsZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgUmVuYW1hYmxlTm9kZSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBoYXModmFsdWUsICdzZXROYW1lJykgJiZcclxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5zZXROYW1lKSAmJlxyXG4gICAgICAoaGFzKHZhbHVlLCAndG9TdHJpbmcnKSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnRvU3RyaW5nKSAmJiB2YWx1ZS50b1N0cmluZyAhPT0gT2JqZWN0LnRvU3RyaW5nKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIGNsb25lVHJlZVNoYWxsb3cob3JpZ2luOiBUcmVlKTogVHJlZSB7XHJcbiAgICBjb25zdCB0cmVlID0gbmV3IFRyZWUoT2JqZWN0LmFzc2lnbih7fSwgb3JpZ2luLm5vZGUpKTtcclxuICAgIHRyZWUuX2NoaWxkcmVuID0gb3JpZ2luLl9jaGlsZHJlbjtcclxuICAgIHJldHVybiB0cmVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGF0aWMgYXBwbHlOZXdWYWx1ZVRvUmVuYW1hYmxlKHZhbHVlOiBSZW5hbWFibGVOb2RlLCBuZXdWYWx1ZTogc3RyaW5nKTogUmVuYW1hYmxlTm9kZSB7XHJcbiAgICBjb25zdCByZW5hbWFibGVWYWx1ZTogUmVuYW1hYmxlTm9kZSA9IE9iamVjdC5hc3NpZ24oe30sIHZhbHVlIGFzIFJlbmFtYWJsZU5vZGUpO1xyXG4gICAgcmVuYW1hYmxlVmFsdWUuc2V0TmFtZShuZXdWYWx1ZSk7XHJcbiAgICByZXR1cm4gcmVuYW1hYmxlVmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZCBhbiBpbnN0YW5jZSBvZiBUcmVlIGZyb20gYW4gb2JqZWN0IGltcGxlbWVudGluZyBUcmVlTW9kZWwgaW50ZXJmYWNlLlxyXG4gICAqIEBwYXJhbSB7VHJlZU1vZGVsfSBtb2RlbCAtIEEgbW9kZWwgdGhhdCBpcyB1c2VkIHRvIGJ1aWxkIGEgdHJlZS5cclxuICAgKiBAcGFyYW0ge1RyZWV9IFtwYXJlbnRdIC0gQW4gb3B0aW9uYWwgcGFyZW50IGlmIHlvdSB3YW50IHRvIGJ1aWxkIGEgdHJlZSBmcm9tIHRoZSBtb2RlbCB0aGF0IHNob3VsZCBiZSBhIGNoaWxkIG9mIGFuIGV4aXN0aW5nIFRyZWUgaW5zdGFuY2UuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNCcmFuY2hdIC0gQW4gb3B0aW9uIHRoYXQgbWFrZXMgYSBicmFuY2ggZnJvbSBjcmVhdGVkIHRyZWUuIEJyYW5jaCBjYW4gaGF2ZSBjaGlsZHJlbi5cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3Iobm9kZTogVHJlZU1vZGVsLCBwYXJlbnQ6IFRyZWUgPSBudWxsLCBpc0JyYW5jaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLmJ1aWxkVHJlZUZyb21Nb2RlbChub2RlLCBwYXJlbnQsIGlzQnJhbmNoIHx8IEFycmF5LmlzQXJyYXkobm9kZS5jaGlsZHJlbikpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZFRyZWVGcm9tTW9kZWwobW9kZWw6IFRyZWVNb2RlbCwgcGFyZW50OiBUcmVlLCBpc0JyYW5jaDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICB0aGlzLm5vZGUgPSBPYmplY3QuYXNzaWduKFxyXG4gICAgICBvbWl0KG1vZGVsLCAnY2hpbGRyZW4nKSBhcyBUcmVlTW9kZWwsXHJcbiAgICAgIHsgc2V0dGluZ3M6IFRyZWVNb2RlbFNldHRpbmdzLm1lcmdlKG1vZGVsLCBnZXQocGFyZW50LCAnbm9kZScpKSB9LFxyXG4gICAgICB7IGVtaXRMb2FkTmV4dExldmVsOiBtb2RlbC5lbWl0TG9hZE5leHRMZXZlbCA9PT0gdHJ1ZSB9XHJcbiAgICApIGFzIFRyZWVNb2RlbDtcclxuXHJcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLm5vZGUubG9hZENoaWxkcmVuKSkge1xyXG4gICAgICB0aGlzLl9sb2FkQ2hpbGRyZW4gPSB0aGlzLm5vZGUubG9hZENoaWxkcmVuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZ2V0KG1vZGVsLCAnY2hpbGRyZW4nLCBbXSkuZm9yRWFjaCgoY2hpbGQ6IFRyZWVNb2RlbCwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMuX2FkZENoaWxkKG5ldyBUcmVlKGNoaWxkLCB0aGlzKSwgaW5kZXgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5fY2hpbGRyZW4pKSB7XHJcbiAgICAgIHRoaXMuX2NoaWxkcmVuID0gdGhpcy5ub2RlLmxvYWRDaGlsZHJlbiB8fCBpc0JyYW5jaCA/IFtdIDogbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNEZWZlcnJlZENoaWxkcmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9sb2FkQ2hpbGRyZW4gPT09ICdmdW5jdGlvbic7XHJcbiAgfVxyXG4gIC8qIFNldHRpbmcgdGhlIGNoaWxkcmVuIGxvYWRpbmcgc3RhdGUgdG8gTG9hZGluZyBzaW5jZSBhIHJlcXVlc3Qgd2FzIGRpc3BhdGNoZWQgdG8gdGhlIGNsaWVudCAqL1xyXG4gIHB1YmxpYyBsb2FkaW5nQ2hpbGRyZW5SZXF1ZXN0ZWQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9IENoaWxkcmVuTG9hZGluZ1N0YXRlLkxvYWRpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayB3aGV0aGVyIGNoaWxkcmVuIG9mIHRoZSBub2RlIGFyZSBiZWluZyBsb2FkZWQuXHJcbiAgICogTWFrZXMgc2Vuc2Ugb25seSBmb3Igbm9kZXMgdGhhdCBkZWZpbmUgYGxvYWRDaGlsZHJlbmAgZnVuY3Rpb24uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyBpbmRpY2F0aW5nIHRoYXQgY2hpbGRyZW4gYXJlIGJlaW5nIGxvYWRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgY2hpbGRyZW5BcmVCZWluZ0xvYWRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9PT0gQ2hpbGRyZW5Mb2FkaW5nU3RhdGUuTG9hZGluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgY2hpbGRyZW4gb2YgdGhlIG5vZGUgd2VyZSBsb2FkZWQuXHJcbiAgICogTWFrZXMgc2Vuc2Ugb25seSBmb3Igbm9kZXMgdGhhdCBkZWZpbmUgYGxvYWRDaGlsZHJlbmAgZnVuY3Rpb24uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyBpbmRpY2F0aW5nIHRoYXQgY2hpbGRyZW4gd2VyZSBsb2FkZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGNoaWxkcmVuV2VyZUxvYWRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9PT0gQ2hpbGRyZW5Mb2FkaW5nU3RhdGUuQ29tcGxldGVkO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW5Mb2FkQ2hpbGRyZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9PT0gQ2hpbGRyZW5Mb2FkaW5nU3RhdGUuTm90U3RhcnRlZCAmJlxyXG4gICAgICB0aGlzLmZvbGRpbmdUeXBlID09PSBGb2xkaW5nVHlwZS5FeHBhbmRlZCAmJlxyXG4gICAgICAhIXRoaXMuX2xvYWRDaGlsZHJlblxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgY2hpbGRyZW4gb2YgdGhlIG5vZGUgc2hvdWxkIGJlIGxvYWRlZCBhbmQgbm90IGxvYWRlZCB5ZXQuXHJcbiAgICogTWFrZXMgc2Vuc2Ugb25seSBmb3Igbm9kZXMgdGhhdCBkZWZpbmUgYGxvYWRDaGlsZHJlbmAgZnVuY3Rpb24uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyBpbmRpY2F0aW5nIHRoYXQgY2hpbGRyZW4gc2hvdWxkIGJlIGxvYWRlZCBmb3IgdGhlIGN1cnJlbnQgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgY2hpbGRyZW5TaG91bGRCZUxvYWRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhdGhpcy5jaGlsZHJlbldlcmVMb2FkZWQoKSAmJiAoISF0aGlzLl9sb2FkQ2hpbGRyZW4gfHwgdGhpcy5ub2RlLmVtaXRMb2FkTmV4dExldmVsID09PSB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCB0cmVlLlxyXG4gICAqIEByZXR1cm5zIHtUcmVlW119IFRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCB0cmVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY2hpbGRyZW4oKTogVHJlZVtdIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJ5IGdldHRpbmcgdmFsdWUgZnJvbSB0aGlzIHByb3BlcnR5IHlvdSBzdGFydCBwcm9jZXNzIG9mIGxvYWRpbmcgbm9kZSdzIGNoaWxkcmVuIHVzaW5nIGBsb2FkQ2hpbGRyZW5gIGZ1bmN0aW9uLlxyXG4gICAqIE9uY2UgY2hpbGRyZW4gYXJlIGxvYWRlZCBgbG9hZENoaWxkcmVuYCBmdW5jdGlvbiB3b24ndCBiZSBjYWxsZWQgYW55bW9yZSBhbmQgbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZSBjaGlsZHJlbiBhcmUgZW1pdHRlZCBpbiBjYXNlIG9mIHN1YnNlcXVlbnQgY2FsbHMuXHJcbiAgICogQHJldHVybnMge09ic2VydmFibGU8VHJlZVtdPn0gQW4gb2JzZXJ2YWJsZSB3aGljaCBlbWl0cyBjaGlsZHJlbiBvbmNlIHRoZXkgYXJlIGxvYWRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGNoaWxkcmVuQXN5bmMoKTogT2JzZXJ2YWJsZTxUcmVlW10+IHtcclxuICAgIGlmICh0aGlzLmNhbkxvYWRDaGlsZHJlbigpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbkFzeW5jT25jZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mKHRoaXMuY2hpbGRyZW4pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnkgY2FsbGluZyB0aGlzIG1ldGhvZCB5b3Ugc3RhcnQgcHJvY2VzcyBvZiBsb2FkaW5nIG5vZGUncyBjaGlsZHJlbiB1c2luZyBgbG9hZENoaWxkcmVuYCBmdW5jdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgcmVsb2FkQ2hpbGRyZW4oKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jaGlsZHJlblNob3VsZEJlTG9hZGVkKCkpIHtcclxuICAgICAgdGhpcy5fY2hpbGRyZW5Mb2FkaW5nU3RhdGUgPSBDaGlsZHJlbkxvYWRpbmdTdGF0ZS5Mb2FkaW5nO1xyXG4gICAgICB0aGlzLl9sb2FkQ2hpbGRyZW4oKGNoaWxkcmVuOiBUcmVlTW9kZWxbXSkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW4gJiYgY2hpbGRyZW4ubWFwKChjaGlsZDogVHJlZU1vZGVsKSA9PiBuZXcgVHJlZShjaGlsZCwgdGhpcykpO1xyXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuTG9hZGluZ1N0YXRlID0gQ2hpbGRyZW5Mb2FkaW5nU3RhdGUuQ29tcGxldGVkO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJ5IGNhbGxpbmcgdGhpcyBtZXRob2QgeW91IHdpbGwgcmVtb3ZlIGFsbCBjdXJyZW50IGNoaWxkcmVuIG9mIGEgdHJlZWUgYW5kIGNyZWF0ZSBuZXcuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENoaWxkcmVuKGNoaWxkcmVuOiBBcnJheTxUcmVlTW9kZWw+KTogdm9pZCB7XHJcbiAgICB0aGlzLl9jaGlsZHJlbiA9IGNoaWxkcmVuICYmIGNoaWxkcmVuLm1hcCgoY2hpbGQ6IFRyZWVNb2RlbCkgPT4gbmV3IFRyZWUoY2hpbGQsIHRoaXMpKTtcclxuICAgIGlmICh0aGlzLmNoaWxkcmVuU2hvdWxkQmVMb2FkZWQoKSkge1xyXG4gICAgICB0aGlzLl9jaGlsZHJlbkxvYWRpbmdTdGF0ZSA9IENoaWxkcmVuTG9hZGluZ1N0YXRlLkNvbXBsZXRlZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBub2RlIGluIHRoZSBjdXJyZW50IHRyZWUuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0JyYW5jaCAtIEEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGEgbmV3IG5vZGUgc2hvdWxkIGJlIGEgXCJCcmFuY2hcIi4gXCJMZWFmXCIgbm9kZSB3aWxsIGJlIGNyZWF0ZWQgYnkgZGVmYXVsdFxyXG4gICAqIEBwYXJhbSB7VHJlZU1vZGVsfSBtb2RlbCAtIFRyZWUgbW9kZWwgb2YgdGhlIG5ldyBub2RlIHdoaWNoIHdpbGwgYmUgaW5zZXJ0ZWQuIEVtcHR5IG5vZGUgd2lsbCBiZSBjcmVhdGVkIGJ5IGRlZmF1bHQgYW5kIGl0IHdpbGwgZmlyZSBlZGl0IG1vZGUgb2YgdGhpcyBub2RlXHJcbiAgICogQHJldHVybnMge1RyZWV9IEEgbmV3bHkgY3JlYXRlZCBjaGlsZCBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVOb2RlKGlzQnJhbmNoOiBib29sZWFuLCBtb2RlbDogVHJlZU1vZGVsID0geyB2YWx1ZTogJycgfSk6IFRyZWUge1xyXG4gICAgY29uc3QgdHJlZSA9IG5ldyBUcmVlKG1vZGVsLCB0aGlzLCBpc0JyYW5jaCk7XHJcbiAgICBpZiAoIW1vZGVsLmlkKSB7XHJcbiAgICAgIHRyZWUubWFya0FzTmV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJlZS5pZCA9IHRyZWUuaWQgfHwgdXVpZHY0KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hpbGRyZW5TaG91bGRCZUxvYWRlZCgpICYmICEodGhpcy5jaGlsZHJlbkFyZUJlaW5nTG9hZGVkKCkgfHwgdGhpcy5jaGlsZHJlbldlcmVMb2FkZWQoKSkpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5pc0xlYWYoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hZGRTaWJsaW5nKHRyZWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2hpbGQodHJlZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50IG5vZGVcclxuICAgKiBAcmV0dXJucyB7KHN0cmluZ3xSZW5hbWFibGVOb2RlKX0gVGhlIHZhbHVlIG9mIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdmFsdWUoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLm5vZGUudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGNoZWNrZWQoY2hlY2tlZDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5ub2RlLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5ub2RlLnNldHRpbmdzLCB7IGNoZWNrZWQgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNoZWNrZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISFnZXQodGhpcy5ub2RlLnNldHRpbmdzLCAnY2hlY2tlZCcpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBjaGVja2VkQ2hpbGRyZW4oKTogVHJlZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmhhc0xvYWRlZENoaWxkZXJuKCkgPyB0aGlzLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5jaGVja2VkKSA6IFtdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzZWxlY3Rpb25BbGxvd2VkKHNlbGVjdGlvbkFsbG93ZWQ6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMubm9kZS5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubm9kZS5zZXR0aW5ncywgeyBzZWxlY3Rpb25BbGxvd2VkIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzZWxlY3Rpb25BbGxvd2VkKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdmFsdWUgPSBnZXQodGhpcy5ub2RlLnNldHRpbmdzLCAnc2VsZWN0aW9uQWxsb3dlZCcpO1xyXG4gICAgcmV0dXJuIGlzTmlsKHZhbHVlKSA/IHRydWUgOiAhIXZhbHVlO1xyXG4gIH1cclxuXHJcbiAgaGFzTG9hZGVkQ2hpbGRlcm4oKSB7XHJcbiAgICByZXR1cm4gIWlzRW1wdHkodGhpcy5jaGlsZHJlbik7XHJcbiAgfVxyXG5cclxuICBsb2FkZWRDaGlsZHJlbkFtb3VudCgpIHtcclxuICAgIHJldHVybiBzaXplKHRoaXMuY2hpbGRyZW4pO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tlZENoaWxkcmVuQW1vdW50KCkge1xyXG4gICAgcmV0dXJuIHNpemUodGhpcy5jaGVja2VkQ2hpbGRyZW4pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudCBub2RlXHJcbiAgICogQHBhcmFtIHsoc3RyaW5nfFJlbmFtYWJsZU5vZGUpfSB2YWx1ZSAtIFRoZSBuZXcgdmFsdWUgb2YgdGhlIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiAhVHJlZS5pc1JlbmFtYWJsZSh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0cmluZ2lmaWVkVmFsdWUgPSAnJyArIHZhbHVlO1xyXG4gICAgaWYgKFRyZWUuaXNSZW5hbWFibGUodGhpcy52YWx1ZSkpIHtcclxuICAgICAgdGhpcy5ub2RlLnZhbHVlID0gVHJlZS5hcHBseU5ld1ZhbHVlVG9SZW5hbWFibGUodGhpcy52YWx1ZSBhcyBSZW5hbWFibGVOb2RlLCBzdHJpbmdpZmllZFZhbHVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubm9kZS52YWx1ZSA9IFRyZWUuaXNWYWx1ZUVtcHR5KHN0cmluZ2lmaWVkVmFsdWUpID8gdGhpcy5ub2RlLnZhbHVlIDogc3RyaW5naWZpZWRWYWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHNpYmxpbmcgbm9kZSBmb3IgdGhlIGN1cnJlbnQgbm9kZS4gVGhpcyB3b24ndCB3b3JrIGlmIHRoZSBjdXJyZW50IG5vZGUgaXMgYSByb290LlxyXG4gICAqIEBwYXJhbSB7VHJlZX0gc2libGluZyAtIEEgbm9kZSB0aGF0IHNob3VsZCBiZWNvbWUgYSBzaWJsaW5nLlxyXG4gICAqIEBwYXJhbSBbbnVtYmVyXSBwb3NpdGlvbiAtIFBvc2l0aW9uIGluIHdoaWNoIHNpYmxpbmcgd2lsbCBiZSBpbnNlcnRlZC4gQnkgZGVmYXVsdCBpdCB3aWxsIGJlIGluc2VydGVkIGF0IHRoZSBsYXN0IHBvc2l0aW9uIGluIGEgcGFyZW50LlxyXG4gICAqIEByZXR1cm5zIHtUcmVlfSBBIG5ld2x5IGluc2VydGVkIHNpYmxpbmcsIG9yIG51bGwgaWYgeW91IGFyZSB0cnlpbmcgdG8gbWFrZSBhIHNpYmxpbmcgZm9yIHRoZSByb290LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRTaWJsaW5nKHNpYmxpbmc6IFRyZWUsIHBvc2l0aW9uPzogbnVtYmVyKTogVHJlZSB7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShnZXQodGhpcy5wYXJlbnQsICdjaGlsZHJlbicpKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQuYWRkQ2hpbGQoc2libGluZywgcG9zaXRpb24pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjaGlsZCBub2RlIGZvciB0aGUgY3VycmVudCBub2RlLlxyXG4gICAqIEBwYXJhbSB7VHJlZX0gY2hpbGQgLSBBIG5vZGUgdGhhdCBzaG91bGQgYmVjb21lIGEgY2hpbGQuXHJcbiAgICogQHBhcmFtIFtudW1iZXJdIHBvc2l0aW9uIC0gUG9zaXRpb24gaW4gd2hpY2ggY2hpbGQgd2lsbCBiZSBpbnNlcnRlZC4gQnkgZGVmYXVsdCBpdCB3aWxsIGJlIGluc2VydGVkIGF0IHRoZSBsYXN0IHBvc2l0aW9uIGluIGEgcGFyZW50LlxyXG4gICAqIEByZXR1cm5zIHtUcmVlfSBBIG5ld2x5IGluc2VydGVkIGNoaWxkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDaGlsZChjaGlsZDogVHJlZSwgcG9zaXRpb24/OiBudW1iZXIpOiBUcmVlIHtcclxuICAgIGNvbnN0IG5ld2Jvcm4gPSB0aGlzLl9hZGRDaGlsZChUcmVlLmNsb25lVHJlZVNoYWxsb3coY2hpbGQpLCBwb3NpdGlvbik7XHJcblxyXG4gICAgdGhpcy5fc2V0Rm9sZGluZ1R5cGUoKTtcclxuICAgIGlmICh0aGlzLmlzTm9kZUNvbGxhcHNlZCgpKSB7XHJcbiAgICAgIHRoaXMuc3dpdGNoRm9sZGluZ1R5cGUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3Ym9ybjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FkZENoaWxkKGNoaWxkOiBUcmVlLCBwb3NpdGlvbjogbnVtYmVyID0gc2l6ZSh0aGlzLl9jaGlsZHJlbikgfHwgMCk6IFRyZWUge1xyXG4gICAgY2hpbGQucGFyZW50ID0gdGhpcztcclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9jaGlsZHJlbikpIHtcclxuICAgICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKHBvc2l0aW9uLCAwLCBjaGlsZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9jaGlsZHJlbiA9IFtjaGlsZF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNoaWxkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3dhcCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBub2RlIHdpdGggdGhlIGdpdmVuIHNpYmxpbmcuIElmIG5vZGUgcGFzc2VkIGFzIGEgcGFyYW1ldGVyIGlzIG5vdCBhIHNpYmxpbmcgLSBub3RoaW5nIGhhcHBlbnMuXHJcbiAgICogQHBhcmFtIHtUcmVlfSBzaWJsaW5nIC0gQSBzaWJsaW5nIHdpdGggd2hpY2ggY3VycmVudCBub2RlIHNob2xkIGJlIHN3YXBwZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHN3YXBXaXRoU2libGluZyhzaWJsaW5nOiBUcmVlKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuaGFzU2libGluZyhzaWJsaW5nKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2libGluZ0luZGV4ID0gc2libGluZy5wb3NpdGlvbkluUGFyZW50O1xyXG4gICAgY29uc3QgdGhpc1RyZWVJbmRleCA9IHRoaXMucG9zaXRpb25JblBhcmVudDtcclxuXHJcbiAgICB0aGlzLnBhcmVudC5fY2hpbGRyZW5bc2libGluZ0luZGV4XSA9IHRoaXM7XHJcbiAgICB0aGlzLnBhcmVudC5fY2hpbGRyZW5bdGhpc1RyZWVJbmRleF0gPSBzaWJsaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbm9kZSdzIHBvc2l0aW9uIGluIGl0cyBwYXJlbnQuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIHBvc2l0aW9uIGluc2lkZSBhIHBhcmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHBvc2l0aW9uSW5QYXJlbnQoKTogbnVtYmVyIHtcclxuICAgIGlmICh0aGlzLmlzUm9vdCgpKSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuY2hpbGRyZW4gPyB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpIDogLTE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayB3aGV0aGVyIG9yIG5vdCB0aGlzIHRyZWUgaXMgc3RhdGljLlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCB0aGlzIHRyZWUgaXMgc3RhdGljLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1N0YXRpYygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBnZXQodGhpcy5ub2RlLnNldHRpbmdzLCAnc3RhdGljJywgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGhhcyBhIGxlZnQgbWVudS5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGhhcyBhIGxlZnQgbWVudS5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzTGVmdE1lbnUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdzdGF0aWMnLCBmYWxzZSkgJiYgZ2V0KHRoaXMubm9kZS5zZXR0aW5ncywgJ2xlZnRNZW51JywgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGhhcyBhIHJpZ2h0IG1lbnUuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoaXMgdHJlZSBoYXMgYSByaWdodCBtZW51LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNSaWdodE1lbnUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdzdGF0aWMnLCBmYWxzZSkgJiYgZ2V0KHRoaXMubm9kZS5zZXR0aW5ncywgJ3JpZ2h0TWVudScsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgdGhpcyB0cmVlIGlzIFwiTGVhZlwiIG9yIG5vdC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGlzIGEgXCJMZWFmXCIuXHJcbiAgICovXHJcbiAgcHVibGljIGlzTGVhZigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhdGhpcy5pc0JyYW5jaCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IG1lbnUgaXRlbXMgb2YgdGhlIGN1cnJlbnQgdHJlZS5cclxuICAgKiBAcmV0dXJucyB7Tm9kZU1lbnVJdGVtW119IFRoZSBtZW51IGl0ZW1zIG9mIHRoZSBjdXJyZW50IHRyZWUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBtZW51SXRlbXMoKTogTm9kZU1lbnVJdGVtW10ge1xyXG4gICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdtZW51SXRlbXMnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgb3Igbm90IHRoaXMgdHJlZSBoYXMgYSBjdXN0b20gbWVudS5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGhhcyBhIGN1c3RvbSBtZW51LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNDdXN0b21NZW51KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLmlzU3RhdGljKCkgJiYgISFnZXQodGhpcy5ub2RlLnNldHRpbmdzLCAnbWVudUl0ZW1zJywgZmFsc2UpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDaGVjayB3aGV0aGVyIHRoaXMgdHJlZSBpcyBcIkJyYW5jaFwiIG9yIG5vdC4gXCJCcmFuY2hcIiBpcyBhIG5vZGUgdGhhdCBoYXMgY2hpbGRyZW4uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoaXMgdHJlZSBpcyBhIFwiQnJhbmNoXCIuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQnJhbmNoKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubm9kZS5lbWl0TG9hZE5leHRMZXZlbCA9PT0gdHJ1ZSB8fCBBcnJheS5pc0FycmF5KHRoaXMuX2NoaWxkcmVuKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgdGhpcyB0cmVlIGhhcyBjaGlsZHJlbi5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGhhcyBjaGlsZHJlbi5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWlzRW1wdHkodGhpcy5fY2hpbGRyZW4pIHx8IHRoaXMuY2hpbGRyZW5TaG91bGRCZUxvYWRlZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciB0aGlzIHRyZWUgaXMgYSByb290IG9yIG5vdC4gVGhlIHJvb3QgaXMgdGhlIHRyZWUgKG5vZGUpIHRoYXQgZG9lc24ndCBoYXZlIHBhcmVudCAob3IgdGVjaG5pY2FsbHkgaXRzIHBhcmVudCBpcyBudWxsKS5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhpcyB0cmVlIGlzIHRoZSByb290LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1Jvb3QoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gaXNOaWwodGhpcy5wYXJlbnQpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciBwcm92aWRlZCB0cmVlIGlzIGEgc2libGluZyBvZiB0aGUgY3VycmVudCB0cmVlLiBTaWJsaW5nIHRyZWVzIChub2RlcykgYXJlIHRoZSB0cmVlcyB0aGF0IGhhdmUgdGhlIHNhbWUgcGFyZW50LlxyXG4gICAqIEBwYXJhbSB7VHJlZX0gdHJlZSAtIEEgdHJlZSB0aGF0IHNob3VsZCBiZSB0ZXN0ZWQgb24gYSBzaWJsaW5nbmVzcy5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgcHJvdmlkZWQgdHJlZSBpcyB0aGUgc2libGluZyBvZiB0aGUgY3VycmVudCBvbmUuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc1NpYmxpbmcodHJlZTogVHJlZSk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLmlzUm9vdCgpICYmIGluY2x1ZGVzKHRoaXMucGFyZW50LmNoaWxkcmVuLCB0cmVlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgcHJvdmlkZWQgdHJlZSBpcyBhIGNoaWxkIG9mIHRoZSBjdXJyZW50IHRyZWUuXHJcbiAgICogVGhpcyBtZXRob2QgdGVzdHMgdGhhdCBwcm92aWRlZCB0cmVlIGlzIGEgPHN0cm9uZz5kaXJlY3Q8L3N0cm9uZz4gY2hpbGQgb2YgdGhlIGN1cnJlbnQgdHJlZS5cclxuICAgKiBAcGFyYW0ge1RyZWV9IHRyZWUgLSBBIHRyZWUgdGhhdCBzaG91bGQgYmUgdGVzdGVkIChjaGlsZCBjYW5kaWRhdGUpLlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHByb3ZpZGVkIHRyZWUgaXMgYSBjaGlsZCBvciBub3QuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc0NoaWxkKHRyZWU6IFRyZWUpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBpbmNsdWRlcyh0aGlzLl9jaGlsZHJlbiwgdHJlZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZ2l2ZW4gdHJlZSBmcm9tIHRoZSBjdXJyZW50IHRyZWUuXHJcbiAgICogVGhlIGdpdmVuIHRyZWUgd2lsbCBiZSByZW1vdmVkIG9ubHkgaW4gY2FzZSBpdCBpcyBhIGRpcmVjdCBjaGlsZCBvZiB0aGUgY3VycmVudCB0cmVlIChAc2VlIHtAbGluayBoYXNDaGlsZH0pLlxyXG4gICAqIEBwYXJhbSB7VHJlZX0gdHJlZSAtIEEgdHJlZSB0aGF0IHNob3VsZCBiZSByZW1vdmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVDaGlsZCh0cmVlOiBUcmVlKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuaGFzQ2hpbGRyZW4oKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2hpbGRJbmRleCA9IHRoaXMuX2NoaWxkcmVuLmZpbmRJbmRleCgoY2hpbGQ6IFRyZWUpID0+IGNoaWxkID09PSB0cmVlKTtcclxuICAgIGlmIChjaGlsZEluZGV4ID49IDApIHtcclxuICAgICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKGNoaWxkSW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2V0Rm9sZGluZ1R5cGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBjdXJyZW50IHRyZWUgZnJvbSBpdHMgcGFyZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVJdHNlbGZGcm9tUGFyZW50KCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnBhcmVudCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTd2l0Y2ggZm9sZGluZyB0eXBlIG9mIHRoZSBjdXJyZW50IHRyZWUuIFwiTGVhZlwiIG5vZGUgY2Fubm90IHN3aXRjaCBpdHMgZm9sZGluZyB0eXBlIGNhdXNlIGl0IGRvZXNuJ3QgaGF2ZSBjaGlsZHJlbiwgaGVuY2Ugbm90aGluZyB0byBmb2xkLlxyXG4gICAqIElmIG5vZGUgaXMgYSBcIkJyYW5jaFwiIGFuZCBpdCBpcyBleHBhbmRlZCwgdGhlbiBieSBpbnZva2luZyBjdXJyZW50IG1ldGhvZCBzdGF0ZSBvZiB0aGUgdHJlZSBzaG91bGQgYmUgc3dpdGNoZWQgdG8gXCJjb2xsYXBzZWRcIiBhbmQgdmljZSB2ZXJzYS5cclxuICAgKi9cclxuICBwdWJsaWMgc3dpdGNoRm9sZGluZ1R5cGUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0xlYWYoKSB8fCAhdGhpcy5oYXNDaGlsZHJlbigpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc2FibGVDb2xsYXBzZU9uSW5pdCgpO1xyXG5cclxuICAgIHRoaXMubm9kZS5fZm9sZGluZ1R5cGUgPSB0aGlzLmlzTm9kZUV4cGFuZGVkKCkgPyBGb2xkaW5nVHlwZS5Db2xsYXBzZWQgOiBGb2xkaW5nVHlwZS5FeHBhbmRlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHRoYXQgdHJlZSBpcyBleHBhbmRlZC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBjdXJyZW50IHRyZWUgaXMgZXhwYW5kZWQuIEFsd2F5cyByZXR1cm5zIGZhbHNlIGZvciB0aGUgXCJMZWFmXCIgdHJlZSBhbmQgZm9yIGFuIGVtcHR5IHRyZWUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzTm9kZUV4cGFuZGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9sZGluZ1R5cGUgPT09IEZvbGRpbmdUeXBlLkV4cGFuZGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdGhhdCB0cmVlIGlzIGNvbGxhcHNlZC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBjdXJyZW50IHRyZWUgaXMgY29sbGFwc2VkLiBBbHdheXMgcmV0dXJucyBmYWxzZSBmb3IgdGhlIFwiTGVhZlwiIHRyZWUgYW5kIGZvciBhbiBlbXB0eSB0cmVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc05vZGVDb2xsYXBzZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5mb2xkaW5nVHlwZSA9PT0gRm9sZGluZ1R5cGUuQ29sbGFwc2VkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGEgY3VycmVudCBmb2xkaW5nIHR5cGU6IGV4cGFuZGVkLCBjb2xsYXBzZWQgb3IgbGVhZi5cclxuICAgKi9cclxuICBwcml2YXRlIF9zZXRGb2xkaW5nVHlwZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmNoaWxkcmVuU2hvdWxkQmVMb2FkZWQoKSkge1xyXG4gICAgICB0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlID0gRm9sZGluZ1R5cGUuQ29sbGFwc2VkO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9jaGlsZHJlbiAmJiAhaXNFbXB0eSh0aGlzLl9jaGlsZHJlbikpIHtcclxuICAgICAgdGhpcy5ub2RlLl9mb2xkaW5nVHlwZSA9IHRoaXMuaXNDb2xsYXBzZWRPbkluaXQoKSA/IEZvbGRpbmdUeXBlLkNvbGxhcHNlZCA6IEZvbGRpbmdUeXBlLkV4cGFuZGVkO1xyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2NoaWxkcmVuKSkge1xyXG4gICAgICB0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlID0gRm9sZGluZ1R5cGUuRW1wdHk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlID0gRm9sZGluZ1R5cGUuTGVhZjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGN1cnJlbnQgZm9sZGluZyB0eXBlOiBleHBhbmRlZCwgY29sbGFwc2VkIG9yIGxlYWYuXHJcbiAgICogQHJldHVybnMge0ZvbGRpbmdUeXBlfSBBIGZvbGRpbmcgdHlwZSBvZiB0aGUgY3VycmVudCB0cmVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZm9sZGluZ1R5cGUoKTogRm9sZGluZ1R5cGUge1xyXG4gICAgaWYgKCF0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlKSB7XHJcbiAgICAgIHRoaXMuX3NldEZvbGRpbmdUeXBlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlLl9mb2xkaW5nVHlwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGNzcyBjbGFzcyBmb3IgZWxlbWVudCB3aGljaCBkaXNwbGF5ZXMgZm9sZGluZyBzdGF0ZSAtIGV4cGFuZGVkLCBjb2xsYXBzZWQgb3IgbGVhZlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIGljb250YWluaW5nIGNzcyBjbGFzcyAoY2xhc3NlcylcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGZvbGRpbmdDc3NDbGFzcygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3NzQ2xhc3Nlc0Zyb21TZXR0aW5ncygpIHx8IHRoaXMuZm9sZGluZ1R5cGUuY3NzQ2xhc3M7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldENzc0NsYXNzZXNGcm9tU2V0dGluZ3MoKTogc3RyaW5nIHtcclxuICAgIGlmICghdGhpcy5ub2RlLl9mb2xkaW5nVHlwZSkge1xyXG4gICAgICB0aGlzLl9zZXRGb2xkaW5nVHlwZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlID09PSBGb2xkaW5nVHlwZS5Db2xsYXBzZWQpIHtcclxuICAgICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdjc3NDbGFzc2VzLmNvbGxhcHNlZCcsIG51bGwpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm5vZGUuX2ZvbGRpbmdUeXBlID09PSBGb2xkaW5nVHlwZS5FeHBhbmRlZCkge1xyXG4gICAgICByZXR1cm4gZ2V0KHRoaXMubm9kZS5zZXR0aW5ncywgJ2Nzc0NsYXNzZXMuZXhwYW5kZWQnLCBudWxsKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5ub2RlLl9mb2xkaW5nVHlwZSA9PT0gRm9sZGluZ1R5cGUuRW1wdHkpIHtcclxuICAgICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdjc3NDbGFzc2VzLmVtcHR5JywgbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdjc3NDbGFzc2VzLmxlYWYnLCBudWxsKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGh0bWwgdGVtcGxhdGUgdG8gcmVuZGVyIGJlZm9yZSBldmVyeSBub2RlJ3MgbmFtZS5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRpbmcgYSBodG1sIHRlbXBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbm9kZVRlbXBsYXRlKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUZW1wbGF0ZUZyb21TZXR0aW5ncygpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRUZW1wbGF0ZUZyb21TZXR0aW5ncygpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuaXNMZWFmKCkpIHtcclxuICAgICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICd0ZW1wbGF0ZXMubGVhZicsICcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBnZXQodGhpcy5ub2RlLnNldHRpbmdzLCAndGVtcGxhdGVzLm5vZGUnLCAnJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBodG1sIHRlbXBsYXRlIHRvIHJlbmRlciBmb3IgYW4gZWxlbWVudCBhY3RpdmF0aW4gbGVmdCBtZW51IG9mIGEgbm9kZS5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRpbmcgYSBodG1sIHRlbXBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbGVmdE1lbnVUZW1wbGF0ZSgpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuaGFzTGVmdE1lbnUoKSkge1xyXG4gICAgICByZXR1cm4gZ2V0KHRoaXMubm9kZS5zZXR0aW5ncywgJ3RlbXBsYXRlcy5sZWZ0TWVudScsICc8c3Bhbj48L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzYWJsZUNvbGxhcHNlT25Jbml0KCkge1xyXG4gICAgaWYgKHRoaXMubm9kZS5zZXR0aW5ncykge1xyXG4gICAgICB0aGlzLm5vZGUuc2V0dGluZ3MuaXNDb2xsYXBzZWRPbkluaXQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0NvbGxhcHNlZE9uSW5pdCgpIHtcclxuICAgIHJldHVybiAhIWdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdpc0NvbGxhcHNlZE9uSW5pdCcpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGtlZXBOb2Rlc0luRE9NKCkge1xyXG4gICAgcmV0dXJuIGdldCh0aGlzLm5vZGUuc2V0dGluZ3MsICdrZWVwTm9kZXNJbkRPTScpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdGhhdCBjdXJyZW50IHRyZWUgaXMgbmV3bHkgY3JlYXRlZCAoYWRkZWQgYnkgdXNlciB2aWEgbWVudSBmb3IgZXhhbXBsZSkuIFRyZWUgdGhhdCB3YXMgYnVpbHQgZnJvbSB0aGUgVHJlZU1vZGVsIGlzIG5vdCBtYXJrZWQgYXMgbmV3LlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBBIGZsYWcgd2hldGhlciB0aGUgdHJlZSBpcyBuZXcuXHJcbiAgICovXHJcbiAgcHVibGljIGlzTmV3KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubm9kZS5fc3RhdHVzID09PSBUcmVlU3RhdHVzLk5ldztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaWQoKTogbnVtYmVyIHwgc3RyaW5nIHtcclxuICAgIHJldHVybiBnZXQodGhpcy5ub2RlLCAnaWQnKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgaWQoaWQ6IG51bWJlciB8IHN0cmluZykge1xyXG4gICAgdGhpcy5ub2RlLmlkID0gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrIGN1cnJlbnQgdHJlZSBhcyBuZXcgKEBzZWUge0BsaW5rIGlzTmV3fSkuXHJcbiAgICovXHJcbiAgcHVibGljIG1hcmtBc05ldygpOiB2b2lkIHtcclxuICAgIHRoaXMubm9kZS5fc3RhdHVzID0gVHJlZVN0YXR1cy5OZXc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayB0aGF0IGN1cnJlbnQgdHJlZSBpcyBiZWluZyByZW5hbWVkIChpdCBpcyBpbiB0aGUgcHJvY2VzcyBvZiBpdHMgdmFsdWUgcmVuYW1pbmcgaW5pdGlhdGVkIGJ5IGEgdXNlcikuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IEEgZmxhZyB3aGV0aGVyIHRoZSB0cmVlIGlzIGJlaW5nIHJlbmFtZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQmVpbmdSZW5hbWVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubm9kZS5fc3RhdHVzID09PSBUcmVlU3RhdHVzLklzQmVpbmdSZW5hbWVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFyayBjdXJyZW50IHRyZWUgYXMgYmVpbmcgcmVuYW1lZCAoQHNlZSB7QGxpbmsgaXNCZWluZ1JlbmFtZWR9KS5cclxuICAgKi9cclxuICBwdWJsaWMgbWFya0FzQmVpbmdSZW5hbWVkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5ub2RlLl9zdGF0dXMgPSBUcmVlU3RhdHVzLklzQmVpbmdSZW5hbWVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdGhhdCBjdXJyZW50IHRyZWUgaXMgbW9kaWZpZWQgKGZvciBleGFtcGxlIGl0IHdhcyByZW5hbWVkKS5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gQSBmbGFnIHdoZXRoZXIgdGhlIHRyZWUgaXMgbW9kaWZpZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzTW9kaWZpZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlLl9zdGF0dXMgPT09IFRyZWVTdGF0dXMuTW9kaWZpZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrIGN1cnJlbnQgdHJlZSBhcyBtb2RpZmllZCAoQHNlZSB7QGxpbmsgaXNNb2RpZmllZH0pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYXJrQXNNb2RpZmllZCgpOiB2b2lkIHtcclxuICAgIHRoaXMubm9kZS5fc3RhdHVzID0gVHJlZVN0YXR1cy5Nb2RpZmllZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIGEgY2xvbmUgb2YgYW4gdW5kZXJseWluZyBUcmVlTW9kZWwgaW5zdGFuY2VcclxuICAgKiBAcmV0dXJucyB7VHJlZU1vZGVsfSBhIGNsb25lIG9mIGFuIHVuZGVybHlpbmcgVHJlZU1vZGVsIGluc3RhbmNlXHJcbiAgICovXHJcbiAgcHVibGljIHRvVHJlZU1vZGVsKCk6IFRyZWVNb2RlbCB7XHJcbiAgICBjb25zdCBtb2RlbCA9IGRlZmF1bHRzRGVlcCh0aGlzLmlzTGVhZigpID8ge30gOiB7IGNoaWxkcmVuOiBbXSB9LCB0aGlzLm5vZGUpO1xyXG5cclxuICAgIGlmICh0aGlzLmNoaWxkcmVuKSB7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgbW9kZWwuY2hpbGRyZW4ucHVzaChjaGlsZC50b1RyZWVNb2RlbCgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsO1xyXG4gIH1cclxufVxyXG4iXX0=
