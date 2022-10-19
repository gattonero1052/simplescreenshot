import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './components/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@NgModule({
  declarations: [PopupComponent],
  imports: [CommonModule, PopupRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FontAwesomeModule,
    MatSlideToggleModule,
    ReactiveFormsModule]
})
export class PopupModule { }