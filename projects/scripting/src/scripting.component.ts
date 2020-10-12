import { Component, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutNode } from 'layout';
import { EditorComponent } from 'ngx-monaco-editor';
import { LayoutNodeEvent } from 'layout';
import { Themes, ThemesHandler } from 'themes';

declare const monaco: any;

@UntilDestroy()
@Component({
  selector: 'app-scripting',
  templateUrl: './scripting.component.html',
  styleUrls: ['./scripting.component.scss']
})
@LayoutNode()
export class ScriptingComponent {
  @ViewChild(EditorComponent, { static: true })
  monacoComponent: EditorComponent;
  code = this.getCode();
  editorOptions: any = {
    theme: 'vs-dark',
    language: 'javascript',
    roundedSelection: true,
    autoIndent: true
  };

  constructor(protected _themesHandler: ThemesHandler) {
    this._themesHandler.themeChange$
      .pipe(untilDestroyed(this))
      .subscribe(value => window.monaco && (monaco.editor.setTheme(getEditorTheme(value))));
  }

  handleNodeEvent(name: LayoutNodeEvent) {
    if (name === LayoutNodeEvent.Resize)
      (this.monacoComponent as any)._editor.layout();
  }

  getCode(): string {
    return ('console.log("Hello Monaco");');
  }

  editorInit(editor) {
    monaco.editor.defineTheme('vs-dark', {
      base: 'vs-dark', // can also be vs or hc-black
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [
        { background: '21232D' } as any
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#21232D',
        'editorCursor.foreground': '#E85050',
        'editor.lineHighlightBackground': '#21232D',
        'editorLineNumber.foreground': '#BCCDD5',
        'editor.selectionBackground': '#88000030',
        'editor.inactiveSelectionBackground': '#88000015'
      }
    });

    monaco.editor.setTheme(getEditorTheme(this._themesHandler.theme));
  }
}

function getEditorTheme(theme: Themes) {
  return `vs-${theme}`;
}
