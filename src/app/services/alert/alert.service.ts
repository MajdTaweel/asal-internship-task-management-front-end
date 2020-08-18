import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertComponent} from '../../components/dialogs/alert/alert.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Release} from '../../models/release.model';
import {ReleaseService} from '../release/release.service';

interface ReleaseDueAlertContent {
  text: string;
  type: 'overdue' | 'near';
  date: Date | string;
  days: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private dialog: MatDialog, private releaseService: ReleaseService) {
  }

  displaySimpleAlertDialog(title: string, message: string): MatDialogRef<AlertComponent> {
    return this.dialog.open(AlertComponent, {data: {title, message}});
  }

  displayReleasesDuesAlertDialog(releases: Release[]): MatDialogRef<AlertComponent> {
    const contents = this.getReleasesDuesAlertContent(releases);
    let message = '';

    const overdue = contents.filter(content => content.type === 'overdue');
    if (overdue.length) {
      message += '<span>The following releases are overdue:<span/><ul>';
      overdue.forEach(content => {
        message += `<li class="text-danger">${content.text} - ${content.days === 0
          ? 'today'
          : content.days + ' overdue'}</li>`;
      });
      message += '</ul>';
    }

    const near = contents.filter(content => content.type === 'near');
    if (near.length) {
      message += '<span>The following releases\' due dates are near:<span/><ul>';
      near.forEach(content => {
        message += `<li class="text-warning">${content.text} - ${content.days} days left</li>`;
      });
      message += '</ul>';
    }
    return this.displaySimpleAlertDialog('Notice!', message);
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

  private getReleasesDuesAlertContent(releases: Release[]): ReleaseDueAlertContent[] {
    const contents = [];
    const day = 24 * 60 * 60 * 1000;

    releases.forEach(release => {
      const content: ReleaseDueAlertContent = {
        text: release.title,
        type: 'overdue',
        date: release.deadline,
        days: 0,
      };
      if (this.releaseService.isOverdue(release)) {
        contents.push(content);
      } else if (this.releaseService.isAlmostDue(release)) {
        contents.push({...content, type: 'near'});
      }
      if (typeof content.date === 'string') {
        content.date = new Date(content.date);
      }
      content.days = content.date.valueOf() - (new Date()).valueOf();
      content.days = Math.floor((content.days < 0 ? -content.days : content.days) / day);
      return content;
    });
    return contents;
  }
}
