export class DomItemStyles {
  cellsBorderColor?: string;

  addStyle(styles: Partial<DomItemStyles>) {
    for (const style in styles) {
        this[style] = styles[style];
    }
  }

  applyNewStyles(styles: Partial<DomItemStyles>) {
    for (const style in styles) {
      if (this.hasOwnProperty(style))
        this[style] = styles[style];
    }
  }

  deleteStyle(style: string) {
    if (this.hasOwnProperty(style)) {
      delete this[style];
    }
  }
}
