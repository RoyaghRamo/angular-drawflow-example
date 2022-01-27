import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawBoardComponent } from './draw-board/draw-board.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
