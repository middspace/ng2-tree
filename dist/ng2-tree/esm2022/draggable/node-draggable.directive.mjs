import { Directive, ElementRef, Inject, Input, Renderer2 } from '@angular/core';
import { NodeDraggableService } from './node-draggable.service';
import { CapturedNode } from './captured-node';
import * as i0 from '@angular/core';
import * as i1 from './node-draggable.service';
export class NodeDraggableDirective {
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
        type: i1.NodeDraggableService,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1kcmFnZ2FibGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2RyYWdnYWJsZS9ub2RlLWRyYWdnYWJsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25HLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7O0FBTS9DLE1BQU0sT0FBTyxzQkFBc0I7SUFXSjtJQUNXO0lBQ1g7SUFadEIsTUFBTSxDQUFDLHVCQUF1QixHQUFHLGtFQUFrRSxDQUFDO0lBRTNGLGFBQWEsQ0FBYTtJQUUxQixJQUFJLENBQU87SUFFbkIsaUJBQWlCLENBQWM7SUFDL0IseUJBQXlCLEdBQW1CLEVBQUUsQ0FBQztJQUV2RCxZQUM2QixPQUFtQixFQUNSLG9CQUEwQyxFQUNyRCxRQUFtQjtRQUZuQixZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQ1IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUNyRCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBRTlDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ2pELENBQUM7SUFFTSxRQUFRO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVB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Q0FBQztJQUVPLFdBQVcsQ0FBQyxTQUFpQjtRQUNuQyxNQUFNLFNBQVMsR0FBaUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztRQUNqRSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyx3QkFBd0I7UUFDOUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdHLENBQUM7d0dBekhVLHNCQUFzQixrQkFXdkIsVUFBVSxhQUNWLG9CQUFvQixhQUNwQixTQUFTOzRGQWJSLHNCQUFzQjs7NEZBQXRCLHNCQUFzQjtrQkFIbEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2lCQUM1Qjs7MEJBWUksTUFBTTsyQkFBQyxVQUFVOzswQkFDakIsTUFBTTsyQkFBQyxvQkFBb0I7OzBCQUMzQixNQUFNOzJCQUFDLFNBQVM7NENBVkgsYUFBYTtzQkFBNUIsS0FBSztnQkFFVSxJQUFJO3NCQUFuQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5vZGVEcmFnZ2FibGVTZXJ2aWNlIH0gZnJvbSAnLi9ub2RlLWRyYWdnYWJsZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ2FwdHVyZWROb2RlIH0gZnJvbSAnLi9jYXB0dXJlZC1ub2RlJztcclxuaW1wb3J0IHsgVHJlZSB9IGZyb20gJy4uL3RyZWUnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbm9kZURyYWdnYWJsZV0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOb2RlRHJhZ2dhYmxlRGlyZWN0aXZlIGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xyXG4gIHB1YmxpYyBzdGF0aWMgREFUQV9UUkFOU0ZFUl9TVFVCX0RBVEEgPSAnc29tZSBicm93c2VycyBlbmFibGUgZHJhZy1uLWRyb3Agb25seSB3aGVuIGRhdGFUcmFuc2ZlciBoYXMgZGF0YSc7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBub2RlRHJhZ2dhYmxlOiBFbGVtZW50UmVmO1xyXG5cclxuICBASW5wdXQoKSBwdWJsaWMgdHJlZTogVHJlZTtcclxuXHJcbiAgcHJpdmF0ZSBub2RlTmF0aXZlRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBkaXNwb3NlcnNGb3JEcmFnTGlzdGVuZXJzOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KEVsZW1lbnRSZWYpIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50UmVmLFxyXG4gICAgQEluamVjdChOb2RlRHJhZ2dhYmxlU2VydmljZSkgcHJpdmF0ZSBub2RlRHJhZ2dhYmxlU2VydmljZTogTm9kZURyYWdnYWJsZVNlcnZpY2UsXHJcbiAgICBASW5qZWN0KFJlbmRlcmVyMikgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyXHJcbiAgKSB7XHJcbiAgICB0aGlzLm5vZGVOYXRpdmVFbGVtZW50ID0gZWxlbWVudC5uYXRpdmVFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnRyZWUuaXNTdGF0aWMoKSkge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLm5vZGVOYXRpdmVFbGVtZW50LCAnZHJhZ2dhYmxlJywgJ3RydWUnKTtcclxuICAgICAgdGhpcy5kaXNwb3NlcnNGb3JEcmFnTGlzdGVuZXJzLnB1c2goXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5saXN0ZW4odGhpcy5ub2RlTmF0aXZlRWxlbWVudCwgJ2RyYWdlbnRlcicsIHRoaXMuaGFuZGxlRHJhZ0VudGVyLmJpbmQodGhpcykpXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZXJzRm9yRHJhZ0xpc3RlbmVycy5wdXNoKFxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMubm9kZU5hdGl2ZUVsZW1lbnQsICdkcmFnb3ZlcicsIHRoaXMuaGFuZGxlRHJhZ092ZXIuYmluZCh0aGlzKSlcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlcnNGb3JEcmFnTGlzdGVuZXJzLnB1c2goXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5saXN0ZW4odGhpcy5ub2RlTmF0aXZlRWxlbWVudCwgJ2RyYWdzdGFydCcsIHRoaXMuaGFuZGxlRHJhZ1N0YXJ0LmJpbmQodGhpcykpXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZXJzRm9yRHJhZ0xpc3RlbmVycy5wdXNoKFxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMubm9kZU5hdGl2ZUVsZW1lbnQsICdkcmFnbGVhdmUnLCB0aGlzLmhhbmRsZURyYWdMZWF2ZS5iaW5kKHRoaXMpKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2Vyc0ZvckRyYWdMaXN0ZW5lcnMucHVzaChcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLm5vZGVOYXRpdmVFbGVtZW50LCAnZHJvcCcsIHRoaXMuaGFuZGxlRHJvcC5iaW5kKHRoaXMpKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2Vyc0ZvckRyYWdMaXN0ZW5lcnMucHVzaChcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLm5vZGVOYXRpdmVFbGVtZW50LCAnZHJhZ2VuZCcsIHRoaXMuaGFuZGxlRHJhZ0VuZC5iaW5kKHRoaXMpKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgLyogdHNsaW50OmRpc2FibGU6dHlwZWRlZiAqL1xyXG4gICAgdGhpcy5kaXNwb3NlcnNGb3JEcmFnTGlzdGVuZXJzLmZvckVhY2goZGlzcG9zZSA9PiBkaXNwb3NlKCkpO1xyXG4gICAgLyogdHNsaW50OmVuYWJsZTp0eXBlZGVmICovXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdTdGFydChlOiBEcmFnRXZlbnQpOiBhbnkge1xyXG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ub2RlRHJhZ2dhYmxlU2VydmljZS5jYXB0dXJlTm9kZShuZXcgQ2FwdHVyZWROb2RlKHRoaXMubm9kZURyYWdnYWJsZSwgdGhpcy50cmVlKSk7XHJcblxyXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dCcsIE5vZGVEcmFnZ2FibGVEaXJlY3RpdmUuREFUQV9UUkFOU0ZFUl9TVFVCX0RBVEEpO1xyXG4gICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRHJhZ092ZXIoZTogRHJhZ0V2ZW50KTogYW55IHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdFbnRlcihlOiBEcmFnRXZlbnQpOiBhbnkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRoaXMuY29udGFpbnNFbGVtZW50QXQoZSkpIHtcclxuICAgICAgdGhpcy5hZGRDbGFzcygnb3Zlci1kcm9wLXRhcmdldCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnTGVhdmUoZTogRHJhZ0V2ZW50KTogYW55IHtcclxuICAgIGlmICghdGhpcy5jb250YWluc0VsZW1lbnRBdChlKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKCdvdmVyLWRyb3AtdGFyZ2V0Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyb3AoZTogRHJhZ0V2ZW50KTogYW55IHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ292ZXItZHJvcC10YXJnZXQnKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuaXNEcm9wUG9zc2libGUoZSkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm5vZGVEcmFnZ2FibGVTZXJ2aWNlLmdldENhcHR1cmVkTm9kZSgpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm5vdGlmeVRoYXROb2RlV2FzRHJvcHBlZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0Ryb3BQb3NzaWJsZShlOiBEcmFnRXZlbnQpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNhcHR1cmVkTm9kZSA9IHRoaXMubm9kZURyYWdnYWJsZVNlcnZpY2UuZ2V0Q2FwdHVyZWROb2RlKCk7XHJcbiAgICByZXR1cm4gY2FwdHVyZWROb2RlICYmIGNhcHR1cmVkTm9kZS5jYW5CZURyb3BwZWRBdCh0aGlzLm5vZGVEcmFnZ2FibGUpICYmIHRoaXMuY29udGFpbnNFbGVtZW50QXQoZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdFbmQoZTogRHJhZ0V2ZW50KTogYW55IHtcclxuICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ292ZXItZHJvcC10YXJnZXQnKTtcclxuICAgIHRoaXMubm9kZURyYWdnYWJsZVNlcnZpY2UucmVsZWFzZUNhcHR1cmVkTm9kZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb250YWluc0VsZW1lbnRBdChlOiBEcmFnRXZlbnQpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHsgeCA9IGUuY2xpZW50WCwgeSA9IGUuY2xpZW50WSB9ID0gZTtcclxuICAgIHJldHVybiB0aGlzLm5vZGVOYXRpdmVFbGVtZW50LmNvbnRhaW5zKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgY2xhc3NMaXN0OiBET01Ub2tlbkxpc3QgPSB0aGlzLm5vZGVOYXRpdmVFbGVtZW50LmNsYXNzTGlzdDtcclxuICAgIGNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNsYXNzTGlzdDogRE9NVG9rZW5MaXN0ID0gdGhpcy5ub2RlTmF0aXZlRWxlbWVudC5jbGFzc0xpc3Q7XHJcbiAgICBjbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG5vdGlmeVRoYXROb2RlV2FzRHJvcHBlZCgpOiB2b2lkIHtcclxuICAgIHRoaXMubm9kZURyYWdnYWJsZVNlcnZpY2UuZmlyZU5vZGVEcmFnZ2VkKHRoaXMubm9kZURyYWdnYWJsZVNlcnZpY2UuZ2V0Q2FwdHVyZWROb2RlKCksIHRoaXMubm9kZURyYWdnYWJsZSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
