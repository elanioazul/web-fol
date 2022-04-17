import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CubeComponent } from './cube/cube.component';
import { ModelComponent } from './model/model.component';
import { StacyComponent } from './stacy/stacy.component'

const routes: Routes = [
  {
    path: "",
    component: CubeComponent
  },
  {
    path: "model",
    component: ModelComponent
  },
  {
    path: "stacy",
    component: StacyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
