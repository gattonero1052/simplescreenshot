import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OptionsRoutingModule } from './options-routing.module';
import { ImageModalComponent,OptionsComponent } from './components/options/options.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [ImageModalComponent,OptionsComponent],
  imports: [MatDialogModule, FontAwesomeModule, MatButtonModule, MatInputModule, MatButtonToggleModule, MatFormFieldModule, ReactiveFormsModule, CommonModule, OptionsRoutingModule, MatNativeDateModule, MatDatepickerModule]
})
export class OptionsModule { }