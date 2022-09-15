import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor';
import { SVG } from 'mathjax-full/js/output/svg';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
@Component({
  selector: 'mathjax',
  templateUrl: './mathjax.component.html',
  styleUrls: ['./mathjax.component.scss']
})
export class MathjaxComponent implements AfterViewInit {
  @Input() public content: string;
  @Output() public mathjaxRendered = new EventEmitter();

  public ngAfterViewInit() {
    setTimeout(() => {
      RegisterHTMLHandler(browserAdaptor());
      const html = mathjax.document(document, {
        InputJax: new TeX({
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          packages: ['base', 'ams', 'noundefined', 'newcommand', 'boldsymbol']
        }),
        OutputJax: new SVG({ fontCache: 'none' })
      });
      html.findMath()
        .compile()
        .getMetrics()
        .typeset()
        .updateDocument();
    }, 1000)
  }
}
