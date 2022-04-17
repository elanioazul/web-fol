import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CubeComponent } from './cube/cube.component';
import { ModelComponent } from './model/model.component';
import { StacyComponent } from './stacy/stacy.component';

@NgModule({
  declarations: [
    AppComponent,
    CubeComponent,
    ModelComponent,
    StacyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
