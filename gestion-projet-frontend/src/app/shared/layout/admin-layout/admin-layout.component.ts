import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { ThemeAssetsService } from 'src/app/core/services/theme-assets.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  assetsReady = false;

  constructor(
    private themeAssetsService: ThemeAssetsService,
    private currentUserService: CurrentUserService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.themeAssetsService.load('admin');
    this.currentUserService.refresh().subscribe();
    this.assetsReady = true;
  }

  ngOnDestroy(): void {
    this.currentUserService.clear();
    this.themeAssetsService.unload('admin');
  }
}
