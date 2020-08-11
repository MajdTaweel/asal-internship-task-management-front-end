import {Component, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';

export interface RouteNode {
  name: string;
  route?: string[];
  children?: RouteNode[];
}

const TREE_DATA: RouteNode[] = [
  {
    name: 'Admin',
    children: [
      {
        name: 'User Management',
        route: ['/', 'admin', 'user-management'],
      },
    ]
  },
];

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  isNavListOpened = false;
  treeControl = new NestedTreeControl<RouteNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<RouteNode>();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: RouteNode) => !!node?.children && node?.children?.length > 0;

  ngOnInit(): void {
  }

  onToggleNavList(): void {
    this.isNavListOpened = !this.isNavListOpened;
  }
}
