import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Profiles } from 'src/app/models/profiles';
import { ProfilesService } from 'src/app/service/profiles.service';

@Component({
  selector: 'app-profiles-list',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.css']
})
export class ProfilesListComponent {
  profiles?: Profiles[];
  displayedColumns: string[] = ['firstName', 'email', 'contactNo', 'currentCtc', 'expectedCtc', 'noticePeriod', 'action'];
  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  searchValue: string = '';
  sortOrder: string = '';
  public pageSize = 10;
  public currentPage = 0;
  public totalSize = 0;
  public offset = this.pageSize * 0;
  pagValue: any;

  constructor(private _profilesService: ProfilesService) { }
  ngOnInit() {
    this.profilesList();
  }

  //get all profiles details
  profilesList() {
    this._profilesService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data as any;
        // this.dataSource.paginator = data.length as any;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }, 800);
        // this.profiles = data;
      }, error: (e) => alert(e.statusText)
    })
  }

  ngAfterViewInit() {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
