import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, Output, Renderer2 } from '@angular/core';
import { NodeEditableEventAction } from './editable.events';
import * as i0 from '@angular/core';
export class NodeEditableDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1lZGl0YWJsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZWRpdGFibGUvbm9kZS1lZGl0YWJsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUVMLE1BQU0sRUFDTixTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFxQix1QkFBdUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDOztBQUsvRSxNQUFNLE9BQU8scUJBQXFCO0lBUUg7SUFDQztJQVI5QixvQ0FBb0M7SUFDTixTQUFTLENBQVM7SUFDaEQsbUNBQW1DO0lBRWxCLFlBQVksR0FBb0MsSUFBSSxZQUFZLENBQW9CLEtBQUssQ0FBQyxDQUFDO0lBRTVHLFlBQzZCLFFBQW1CLEVBQ2xCLFVBQXNCO1FBRHZCLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUNqRCxDQUFDO0lBRUcsUUFBUTtRQUNiLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRXBELElBQUksYUFBYSxFQUFFO1lBQ2pCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN2QjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFHTSxhQUFhLENBQUMsWUFBb0I7UUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFHTSwyQkFBMkIsQ0FBQyxZQUFvQjtRQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUdNLGFBQWE7UUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDckIsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDckIsTUFBTSxFQUFFLHVCQUF1QixDQUFDLE1BQU07U0FDdkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzt3R0F2Q1UscUJBQXFCLGtCQVF0QixTQUFTLGFBQ1QsVUFBVTs0RkFUVCxxQkFBcUI7OzRGQUFyQixxQkFBcUI7a0JBSGpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtpQkFDM0I7OzBCQVNJLE1BQU07MkJBQUMsU0FBUzs7MEJBQ2hCLE1BQU07MkJBQUMsVUFBVTs0Q0FQVSxTQUFTO3NCQUF0QyxLQUFLO3VCQUFDLGNBQWM7Z0JBR0osWUFBWTtzQkFBNUIsTUFBTTtnQkFrQkEsYUFBYTtzQkFEbkIsWUFBWTt1QkFBQyxhQUFhLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztnQkFNN0MsMkJBQTJCO3NCQURqQyxZQUFZO3VCQUFDLE1BQU0sRUFBRSxDQUFDLHFCQUFxQixDQUFDO2dCQU10QyxhQUFhO3NCQURuQixZQUFZO3VCQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBIb3N0TGlzdGVuZXIsXHJcbiAgSW5qZWN0LFxyXG4gIElucHV0LFxyXG4gIE9uSW5pdCxcclxuICBPdXRwdXQsXHJcbiAgUmVuZGVyZXIyXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5vZGVFZGl0YWJsZUV2ZW50LCBOb2RlRWRpdGFibGVFdmVudEFjdGlvbiB9IGZyb20gJy4vZWRpdGFibGUuZXZlbnRzJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25vZGVFZGl0YWJsZV0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOb2RlRWRpdGFibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQge1xyXG4gIC8qIHRzbGludDpkaXNhYmxlOm5vLWlucHV0LXJlbmFtZSAqL1xyXG4gIEBJbnB1dCgnbm9kZUVkaXRhYmxlJykgcHVibGljIG5vZGVWYWx1ZTogc3RyaW5nO1xyXG4gIC8qIHRzbGludDplbmFibGU6bm8taW5wdXQtcmVuYW1lICovXHJcblxyXG4gIEBPdXRwdXQoKSBwdWJsaWMgdmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Tm9kZUVkaXRhYmxlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxOb2RlRWRpdGFibGVFdmVudD4oZmFsc2UpO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KFJlbmRlcmVyMikgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxyXG4gICAgQEluamVjdChFbGVtZW50UmVmKSBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWZcclxuICApIHt9XHJcblxyXG4gIHB1YmxpYyBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICBpZiAobmF0aXZlRWxlbWVudCkge1xyXG4gICAgICBuYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRQcm9wZXJ0eShuYXRpdmVFbGVtZW50LCAndmFsdWUnLCB0aGlzLm5vZGVWYWx1ZSk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdrZXl1cC5lbnRlcicsIFsnJGV2ZW50LnRhcmdldC52YWx1ZSddKVxyXG4gIHB1YmxpYyBhcHBseU5ld1ZhbHVlKG5ld05vZGVWYWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnZhbHVlQ2hhbmdlZC5lbWl0KHsgdHlwZTogJ2tleXVwJywgdmFsdWU6IG5ld05vZGVWYWx1ZSB9KTtcclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInLCBbJyRldmVudC50YXJnZXQudmFsdWUnXSlcclxuICBwdWJsaWMgYXBwbHlOZXdWYWx1ZUJ5TG9vc2luZ0ZvY3VzKG5ld05vZGVWYWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnZhbHVlQ2hhbmdlZC5lbWl0KHsgdHlwZTogJ2JsdXInLCB2YWx1ZTogbmV3Tm9kZVZhbHVlIH0pO1xyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcigna2V5dXAuZXNjJylcclxuICBwdWJsaWMgY2FuY2VsRWRpdGluZygpOiB2b2lkIHtcclxuICAgIHRoaXMudmFsdWVDaGFuZ2VkLmVtaXQoe1xyXG4gICAgICB0eXBlOiAna2V5dXAnLFxyXG4gICAgICB2YWx1ZTogdGhpcy5ub2RlVmFsdWUsXHJcbiAgICAgIGFjdGlvbjogTm9kZUVkaXRhYmxlRXZlbnRBY3Rpb24uQ2FuY2VsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19
