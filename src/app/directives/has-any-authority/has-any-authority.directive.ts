import {Directive, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {UserService} from '../../services/user/user.service';

@Directive({
  selector: '[appHasAnyAuthority]'
})
export class HasAnyAuthorityDirective implements OnDestroy {
  private authorities: string[] = [];
  private authenticationSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  @Input()
  set appHasAnyAuthority(value: string | string[]) {
    this.authorities = typeof value === 'string' ? [value] : value;
    this.updateView();
    // Get notified each time authentication state changes.
    this.authenticationSubscription = this.userService.getAuthenticationState().subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    if (this.authenticationSubscription) {
      this.authenticationSubscription.unsubscribe();
    }
  }

  private updateView(): void {
    const hasAnyAuthority = this.userService.hasAnyAuthority(this.authorities);
    this.viewContainerRef.clear();
    if (hasAnyAuthority) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
