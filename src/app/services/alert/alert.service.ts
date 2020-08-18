import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertComponent} from '../../components/dialogs/alert/alert.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private dialog: MatDialog) {
  }

  displaySimpleAlertDialog(title: string, message: string): MatDialogRef<AlertComponent> {
    return this.dialog.open(AlertComponent, {data: {title, message}});
  }

  displayDeleteConfirmationDialog(message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(
      AlertComponent,
      {
        data: {
          title: 'Confirm Deletion',
          message,
          buttons: [
            {
              text: 'Confirm',
              handler: () => {
                dialogRef.close(true);
              },
            },
            {
              text: 'Cancel',
              handler: () => {
                dialogRef.close();
              },
            }
          ],
        },
      },
    );
    return this.isConfirmedAfterConfirmationDialogClosed(dialogRef);
  }

  private isConfirmedAfterConfirmationDialogClosed(
    dialogRef: MatDialogRef<AlertComponent>
  ): Observable<boolean> {
    return dialogRef.afterClosed().pipe(map(confirmed => {
      return !!confirmed;
    }));
  }
}
