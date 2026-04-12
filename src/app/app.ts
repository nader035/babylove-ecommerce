import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Toast } from './shared/components/toast/toast';
import { PreferencesStore } from './core/stores/preferences.store';
import * as AOS from 'aos';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('baby-store');
  private platformId = inject(PLATFORM_ID);
  private transloco = inject(TranslocoService);
  private preferencesStore = inject(PreferencesStore);

  constructor() {
    effect(() => {
      const lang = this.preferencesStore.language();
      this.transloco.setActiveLang(lang);

      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 1000,
        once: true,
        mirror: false,
      });
    }
  }
}
