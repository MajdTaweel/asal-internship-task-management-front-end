import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      extraButtons?: { text: string, handler: () => void }[];
    },
  ) {
  }

  ngOnInit(): void {
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}
