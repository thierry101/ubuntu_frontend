// src/app/services/dashboard-sse.service.ts
//Pour avoir les stats en temps réel sur le dashboard, on utilise les Server-Sent Events (SSE) :
// Le service DashboardSseService crée un Observable qui se connecte à une URL SSE spécifique pour écouter les événements du dashboard.
// Chaque fois que le serveur envoie une mise à jour, le service émet la nouvelle donnée aux abonnés, permettant ainsi au dashboard de se mettre à jour en temps réel sans avoir besoin de rafraîchir la page.

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { share, distinctUntilChanged } from 'rxjs/operators';

export type SSEEvent =
  | 'stats'
  | 'revenue_wh'
  | 'top_products'
  | 'top_clients'
  | 'sale_wh_store';

@Injectable({ providedIn: 'root' })
export class DashboardSseService {
  private baseUrl = '/api/dashboard/stream'; // adapte selon ton backend

  constructor(private zone: NgZone) { }

  /**
   * Crée un Observable SSE pour un event donné.
   * Le stream reste ouvert → le serveur pousse les mises à jour.
   */
  listen<T>(event: SSEEvent, params: Record<string, string> = {}): Observable<T> {
    return new Observable<T>(observer => {
      // Construction de l'URL avec query params
      const url = new URL(this.baseUrl, window.location.origin);
      url.searchParams.set('event', event);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const es = new EventSource(url.toString());

      es.addEventListener(event, (e: MessageEvent) => {
        // Retour dans la zone Angular pour déclencher la CD
        this.zone.run(() => {
          try {
            observer.next(JSON.parse(e.data) as T);
          } catch {
            observer.error(new Error('SSE parse error'));
          }
        });
      });

      es.onerror = () => {
        this.zone.run(() => observer.error(new Error(`SSE error on ${event}`)));
        es.close();
      };

      // Cleanup : ferme la connexion SSE quand on unsubscribe
      return () => es.close();
    }).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      share() // plusieurs subscribers = 1 seule connexion SSE
    );
  }
}