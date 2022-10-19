import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { StorageService } from '../../../../storage.service';
import { Preset } from '../../../../storage.service';
import { Config } from '../../../../types';
import { createHotKeyBinder } from '../../../../keyBinder';

//key like startHotKeys are complex array that hard to use form 
//for two-way data binding
const FormPreset = { ...Preset, startHotKeys: undefined };

@Component({
  selector: 'app-configurations',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements AfterViewInit {
  faGithub = faGithub

  hasUnitNumber = false;
  configurationForm: FormGroup = this.fb.group(FormPreset);

  @ViewChild('keyBinderInput')
  keyBinderInputRef: ElementRef<HTMLInputElement>

  constructor(
    private fb: FormBuilder,
    private readonly service: StorageService
  ) { }

  ngAfterViewInit(): void {
    let self = this;
    (async function () {
      let config = await self.service.getAll();
      let el = self.keyBinderInputRef.nativeElement;
      createHotKeyBinder(el, (result) => {
        // console.log('result:' + result);
        self.service.save('startHotKeys', result);
      }, {
        initialValue: config.startHotKeys,
        onFocus(){ el.style.cursor = 'text'; },
        onBlur(){ el.style.cursor = 'pointer'; },
      });

      self.configurationForm = self.fb.group({ ...config, startHotKeys: undefined });
      Object.entries(FormPreset).forEach(([k], _) => {
        self.configurationForm.get(k)?.valueChanges.subscribe(async v => {
          await self.service.save(k, v);
        });
      })
    })();
  }
}
