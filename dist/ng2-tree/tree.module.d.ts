import './rxjs-imports';
import * as i0 from '@angular/core';
import * as i1 from './draggable/node-draggable.directive';
import * as i2 from './tree.component';
import * as i3 from './editable/node-editable.directive';
import * as i4 from './menu/node-menu.component';
import * as i5 from './tree-internal.component';
import * as i6 from './utils/safe-html.pipe';
import * as i7 from '@angular/common';
export declare class TreeModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TreeModule,
    [
      typeof i1.NodeDraggableDirective,
      typeof i2.TreeComponent,
      typeof i3.NodeEditableDirective,
      typeof i4.NodeMenuComponent,
      typeof i5.TreeInternalComponent,
      typeof i6.SafeHtmlPipe
    ],
    [typeof i7.CommonModule],
    [typeof i2.TreeComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TreeModule>;
}
