import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  isNavListOpened = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  onToggleNavList(): void {
    this.isNavListOpened = !this.isNavListOpened;
  }
}
