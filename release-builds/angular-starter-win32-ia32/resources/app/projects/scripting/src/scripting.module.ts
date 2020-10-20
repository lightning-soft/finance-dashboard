import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { ScriptingComponent } from './scripting.component';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: './assets', // configure base path for monaco scripting default: './assets'
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => { console.log((window as any).monaco); }
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  exports: [
    ScriptingComponent
  ],
  declarations: [ScriptingComponent]
})
export class ScriptingModule implements LazyModule {
  get components(): ComponentStore {
    return {
      scripting: ScriptingComponent
    };
  }
}
