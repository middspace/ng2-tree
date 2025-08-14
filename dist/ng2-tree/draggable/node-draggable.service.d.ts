import { ElementRef } from '@angular/core';
import { CapturedNode } from './captured-node';
import { NodeDraggableEvent } from './draggable.events';
import { Subject } from 'rxjs';
import * as i0 from '@angular/core';
export declare class NodeDraggableService {
  draggableNodeEvents$: Subject<NodeDraggableEvent>;
  private capturedNode;
  fireNodeDragged(captured: CapturedNode, target: ElementRef): void;
  captureNode(node: CapturedNode): void;
  getCapturedNode(): CapturedNode;
  releaseCapturedNode(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NodeDraggableService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<NodeDraggableService>;
}
