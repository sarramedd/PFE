import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { ThemeAssetsService } from 'src/app/core/services/theme-assets.service';

@Component({
  selector: 'app-frontoffice-layout',
  templateUrl: './frontoffice-layout.component.html',
  styleUrls: ['./frontoffice-layout.component.css']
})
export class FrontofficeLayoutComponent implements OnInit, OnDestroy {
  assetsReady = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private themeAssetsService: ThemeAssetsService,
    private currentUserService: CurrentUserService
  ) {}

  async ngOnInit(): Promise<void> {
    const html = this.document.documentElement;
    const body = this.document.body;

    this.renderer.addClass(html, 'light-style');
    this.renderer.addClass(html, 'layout-menu-fixed');
    this.renderer.setAttribute(html, 'dir', 'ltr');
    this.renderer.setAttribute(html, 'data-theme', 'theme-default');
    this.renderer.setAttribute(html, 'data-assets-path', 'assets/frontoffice/sneat/');
    this.renderer.setAttribute(html, 'data-template', 'vertical-menu-template-free');

    this.renderer.addClass(body, 'frontoffice-sneat');
    await this.themeAssetsService.load('frontoffice');
    this.currentUserService.refresh().subscribe();
    this.assetsReady = true;
  }

  ngOnDestroy(): void {
    const html = this.document.documentElement;
    const body = this.document.body;

    this.renderer.removeClass(html, 'light-style');
    this.renderer.removeClass(html, 'layout-menu-fixed');
    this.renderer.removeAttribute(html, 'dir');
    this.renderer.removeAttribute(html, 'data-theme');
    this.renderer.removeAttribute(html, 'data-assets-path');
    this.renderer.removeAttribute(html, 'data-template');
    this.renderer.removeClass(body, 'frontoffice-sneat');
    this.currentUserService.clear();
    this.themeAssetsService.unload('frontoffice');
  }
}
