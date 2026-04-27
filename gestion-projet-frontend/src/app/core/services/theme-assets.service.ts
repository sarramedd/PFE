import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

type AssetScope = 'admin' | 'frontoffice' | 'auth';

@Injectable({
  providedIn: 'root'
})
export class ThemeAssetsService {
  private readonly assetMap: Record<AssetScope, { styles: string[]; scripts: string[] }> = {
    admin: {
      styles: [
        'assets/template/vendors/css/vendor.bundle.base.css',
        'assets/template/css/style.css'
      ],
      scripts: [
        'assets/template/vendors/js/vendor.bundle.base.js',
        'assets/template/vendors/chart.js/Chart.min.js',
        'assets/template/vendors/progressbar.js/progressbar.min.js',
        'assets/template/vendors/jvectormap/jquery-jvectormap.min.js',
        'assets/template/vendors/jvectormap/jquery-jvectormap-world-mill-en.js',
        'assets/template/vendors/owl-carousel-2/owl.carousel.min.js',
        'assets/template/js/off-canvas.js',
        'assets/template/js/hoverable-collapse.js',
        'assets/template/js/misc.js',
        'assets/template/js/settings.js',
        'assets/template/js/todolist.js',
        'assets/template/js/dashboard.js'
      ]
    },
    frontoffice: {
      styles: [
        'assets/frontoffice/sneat/vendor/fonts/boxicons.css',
        'assets/frontoffice/sneat/vendor/css/core.css',
        'assets/frontoffice/sneat/vendor/css/theme-default.css',
        'assets/frontoffice/sneat/vendor/libs/perfect-scrollbar/perfect-scrollbar.css',
        'assets/frontoffice/sneat/vendor/libs/apex-charts/apex-charts.css',
        'assets/frontoffice/sneat/css/demo.css'
      ],
      scripts: [
        'assets/frontoffice/sneat/vendor/js/helpers.js',
        'assets/frontoffice/sneat/js/config.js',
        'assets/frontoffice/sneat/vendor/libs/jquery/jquery.js',
        'assets/frontoffice/sneat/vendor/libs/popper/popper.js',
        'assets/frontoffice/sneat/vendor/js/bootstrap.js',
        'assets/frontoffice/sneat/vendor/libs/perfect-scrollbar/perfect-scrollbar.js',
        'assets/frontoffice/sneat/vendor/js/menu.js',
        'assets/frontoffice/sneat/vendor/libs/apex-charts/apexcharts.js',
        'assets/frontoffice/sneat/js/main.js'
      ]
    },
    auth: {
      styles: [
        'assets/frontoffice/sneat/vendor/fonts/boxicons.css',
        'assets/frontoffice/sneat/vendor/css/core.css',
        'assets/frontoffice/sneat/vendor/css/theme-default.css',
        'assets/frontoffice/sneat/vendor/libs/perfect-scrollbar/perfect-scrollbar.css',
        'assets/frontoffice/sneat/vendor/css/pages/page-auth.css',
        'assets/frontoffice/sneat/css/demo.css'
      ],
      scripts: [
        'assets/frontoffice/sneat/vendor/js/helpers.js',
        'assets/frontoffice/sneat/js/config.js',
        'assets/frontoffice/sneat/vendor/libs/jquery/jquery.js',
        'assets/frontoffice/sneat/vendor/libs/popper/popper.js',
        'assets/frontoffice/sneat/vendor/js/bootstrap.js',
        'assets/frontoffice/sneat/vendor/libs/perfect-scrollbar/perfect-scrollbar.js',
        'assets/frontoffice/sneat/vendor/js/menu.js',
        'assets/frontoffice/sneat/js/main.js'
      ]
    }
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  async load(scope: AssetScope): Promise<void> {
    this.unload(scope);

    for (const href of this.assetMap[scope].styles) {
      this.appendStyle(scope, href);
    }

    for (const src of this.assetMap[scope].scripts) {
      await this.appendScript(scope, src);
    }
  }

  unload(scope: AssetScope): void {
    const nodes = this.document.querySelectorAll(`[data-asset-scope="${scope}"]`);
    nodes.forEach((node) => node.parentNode?.removeChild(node));
  }

  private appendStyle(scope: AssetScope, href: string): void {
    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-asset-scope', scope);
    this.document.head.appendChild(link);
  }

  private appendScript(scope: AssetScope, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.async = false;
      script.defer = false;
      script.setAttribute('data-asset-scope', scope);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      this.document.body.appendChild(script);
    });
  }
}
