import { Pipe } from '@angular/core';
import * as i0 from '@angular/core';
import * as i1 from '@angular/platform-browser';
export class SafeHtmlPipe {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FmZS1odG1sLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvc2FmZS1odG1sLnBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7OztBQUlwRCxNQUFNLE9BQU8sWUFBWTtJQUNJO0lBQTNCLFlBQTJCLFNBQXVCO1FBQXZCLGNBQVMsR0FBVCxTQUFTLENBQWM7SUFBRyxDQUFDO0lBRS9DLFNBQVMsQ0FBQyxLQUFhO1FBQzVCLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQzt3R0FOVSxZQUFZO3NHQUFaLFlBQVk7OzRGQUFaLFlBQVk7a0JBRHhCLElBQUk7bUJBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVIdG1sIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XHJcblxyXG5AUGlwZSh7IG5hbWU6ICdzYWZlSHRtbCcgfSlcclxuZXhwb3J0IGNsYXNzIFNhZmVIdG1sUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIHNhbml0aXplcjogRG9tU2FuaXRpemVyKSB7fVxyXG5cclxuICBwdWJsaWMgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcpOiBTYWZlSHRtbCB7XHJcbiAgICAvLyByZXR1cm4gdmFsdWU7XHJcbiAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwodmFsdWUpO1xyXG4gIH1cclxufVxyXG4iXX0=
