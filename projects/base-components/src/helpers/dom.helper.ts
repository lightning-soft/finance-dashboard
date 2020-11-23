export class DomHelper {
  static isContainerFitsElements(container: HTMLElement): boolean {
    const { clientWidth, children } = container;

    const childrenWidth = Array.prototype.reduce.call(
      children,
      (accum: number, child: HTMLElement) => accum + child.offsetWidth,
      0,
    );

    return clientWidth >= childrenWidth;
  }
}
