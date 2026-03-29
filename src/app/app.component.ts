/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'AnKeCRM';
  private isCleaning = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // Si on est à la racine, on peut décider de ne rien faire
        // ou d'afficher une alerte "Voulez-vous quitter ?"
        // console.log("On est à l'accueil, on ne ferme pas l'app");
      }
    });
    // this.initStatusBar();
    this.authService.refreshToken().subscribe({
      next: (res) => {
        if (res?.access) {
          this.authService.setAccessToken(res.access);
        }
      },
      error: (_error) => {
        this.authService.setAccessToken(null);
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.forceCloseModals();
      }
    });
  }


  forceCloseModals() { //fermer les modals quand j'ouvre et je navigue ailleurs oubliant de le fermer pour ne plus griser l'écran
    if (this.isCleaning) return;
    this.isCleaning = true;

    try {
      // 1. Fermer tous les modals visibles
      document.querySelectorAll('.modal.show').forEach((modal: any) => {
        const instance = (window as any).bootstrap?.Modal?.getInstance(modal);
        instance?.hide();
      });

      // 2. Nettoyage immédiat (critique)
      this.cleanDom();

      // 3. Nettoyage différé (corrige les bugs d’animation mobile)
      setTimeout(() => this.cleanDom(), 150);
      setTimeout(() => this.cleanDom(), 300);

    } catch (e) {
      console.error('Modal cleanup error:', e);
    } finally {
      setTimeout(() => {
        this.isCleaning = false;
      }, 400);
    }
  }

  private cleanDom() {
    // Supprime le mode modal du body
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    // Supprime TOUS les backdrops
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    // Sécurité supplémentaire mobile
    document.querySelectorAll('.modal').forEach((modal: any) => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
    });
  }

  // private async initStatusBar(): Promise<void> {
  //   if (!Capacitor.isNativePlatform()) return;
  //   try {
  //     await StatusBar.setOverlaysWebView({ overlay: false });
  //     await StatusBar.setStyle({ style: Style.Dark });
  //     await StatusBar.setBackgroundColor({ color: '#1565C0' });
  //   } catch (_e) {
  //     // StatusBar non disponible — ignoré silencieusement
  //   }
  // }
}