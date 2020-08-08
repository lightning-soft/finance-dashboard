import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef, HostListener,
  Injector,
  Input,
  NgZone,
  ViewChild
} from '@angular/core';
import { LazyLoadingService } from '../LazyLoadingService';
import { scripts } from '../lazyLoadingConfig';
import { LayoutService } from './layout.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

type NgComponent<T> = new (...params: any[]) => T;

declare const GoldenLayout;
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [
    LayoutService
  ]
})
export class LayoutComponent implements AfterViewInit {

  private layout: GoldenLayout = null;

  @ViewChild('container') container;

  @Input() private config = null;
  @Input() onLayoutReady;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private zone: NgZone,
    private modal: NzModalService,
    private lazyLoadingService: LazyLoadingService,
    private layoutService: LayoutService,
  ) { }

  ngAfterViewInit(): void {
    this.lazyLoadingService.loadScripts([scripts.GoldenLayout])
      .then(() => {
        this.layout = new GoldenLayout(this.config, this.container.nativeElement);
        this.onLayoutReady();
      });


  }

  init() {
    this.layout.on('stackCreated', (stack) => {
      stack.header.element.append('<div class="stack__plus">+</div>');
    });
    this.layout.init();
    document.addEventListener('click', (event) => {
      const classList = [...event.target['classList']];
      if (classList && classList.includes('stack__plus')) {
        this.openLinks(event.clientX, event.clientY);
      }

    });
    this.layout.on('stateChanged', (event) => {
      this.layoutService.onStateChange();
    });


  }

  openLinks(x, y) {
    // this.modal.create({
    //   nzContent: AddComponentComponent,
    //   nzFooter: null,
    //   nzClosable: false,
    //   nzStyle: {
    //     left: x  + 'px',
    //     top: y + 'px'
    //   }
    // /*  height: '200px',
    //   width: '200px',
    //   hasBackdrop: true,
    //   position: {
    //     top:  y + 'px',
    //     left: x + 'px'
    //   }*/
    // });
  }

  registerComponent<T>(componentName: string, entryComponent: NgComponent<T>) {

    this.layout.registerComponent(componentName, (container: GoldenLayout.Container) => {

      let component: ComponentRef<T>;

      // create angular component in angular zone and append it in to layout container
      this.zone.run(_ => {
        component = this.createComponent(entryComponent, container);
        const view: HTMLElement = (component.hostView as any).rootNodes[0];
        container.getElement().append(view);
      });


      // destroy angular component
      container.on('destroy', () => {
        this.zone.run(_ => {
          this.destroyComponent(component);
        });
      });
    });
  }

  createComponent<T>(entryComponent: NgComponent<T>, container: GoldenLayout.Container) {
    const factory = this.componentFactoryResolver.resolveComponentFactory<T>(entryComponent);

    const injector = Injector.create([
      { provide: 'Container', useValue: container },
      { provide: 'GoldenLayout', useValue: this.layout }
    ], this.injector);

    const component = factory.create(injector);
    this.appRef.attachView(component.hostView);

    return component;
  }

  destroyComponent(component: ComponentRef<any>) {
    this.appRef.detachView(component.hostView);
    component.destroy();
  }

  @HostListener('window:resize')
  public onResize(): void {
    if (this.layout)
      this.layout.updateSize();

  }

  addComponent(componentName: string) {
    const goldenLayout = this.layout;
    const content = goldenLayout.selectedItem || goldenLayout.root.contentItems[0];
    const item = {
      type: 'component',
      componentName,
      componentState: null
    };

    try {
      if (content) {
        content.addChild(item);
      } else {
        goldenLayout.root.addChild(item);
      }
      this.onResize();
    } catch (e) {
      console.log(e);
    }
  }
}
