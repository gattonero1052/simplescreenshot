import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { StorageService } from '../../../../storage.service';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl } from '@angular/forms';
import { from } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faMugHot } from '@fortawesome/free-solid-svg-icons';

export interface DialogData {
  img: string
  hostname: string
  ts: number
}

@Component({
  selector: 'image-modal',
  templateUrl: 'image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageModalComponent {
  @ViewChild('imgEl') imgEl: ElementRef<HTMLImageElement>;

  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  copyDetailImage() {
    let img = new Image();
    let canvas = document.createElement('canvas');
    canvas.width = this.imgEl.nativeElement.width;
    canvas.height = this.imgEl.nativeElement.height;
    img.onload = function () {
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);

        }
      }, "image/png");
    }
    img.src = this.data.img;
  }

  downloadDetailImage() {
    let names = this.data.hostname.split('.')
    let link = document.createElement('a');
    link.download = `Screenshot - ${names.length > 1 ? names[names.length - 2] : names[0]}.png`;
    link.href = this.data.img;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-configurations',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass
  faGithub = faGithub;
  faMugHot = faMugHot;

  filters = new FormGroup({
    screenshotDateStart: new FormControl(),
    screenshotDateEnd: new FormControl(new Date()),
    website: new FormControl('')
  });

  hasUnitNumber = false;
  screenshots: string[] = []
  details: any = []
  info: any;
  detailImage: string;
  showDetailModal: boolean = false;

  constructor(
    private readonly service: StorageService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    from(this.service.get('info')).subscribe(info => {
      this.info = info;

      (async () => {
        let index = 0;
        for (let e of info) {
          let { website, ts, id } = e;
          this.details.push({ ...e, visible: true })
          this.screenshots.push(await this.service.get(`screenshot-${id}`));
        }
      })();
    });

    this.filters.valueChanges.subscribe(({
      screenshotDateStart,
      screenshotDateEnd,
      website = '' }) => {
      //using the end of the end day
      screenshotDateEnd?.setHours(23);
      screenshotDateEnd?.setMinutes(59);
      screenshotDateEnd?.setSeconds(59);
      screenshotDateEnd?.setMilliseconds(999);
      this.details.forEach((detail: any, i: number) => {
        detail.visible =
          detail.ts >= (screenshotDateStart || new Date(0))!.getTime() &&
          detail.ts <= (screenshotDateEnd || new Date(100000000000000))!.getTime() &&
          detail.website.indexOf(website) > -1
      });
    });
  }

  deleteAll() {
    this.service.deleteAll();
  }

  showDetail(screenshot: string, detail: any) {
    let domain = new URL(detail.website);

    const dialogRef = this.dialog.open(ImageModalComponent, {
      data: {
        hostname: domain.hostname,
        ts: detail.ts,
        img: screenshot
      },
    });
  }
}


