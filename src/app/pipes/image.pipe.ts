/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImagePipe implements PipeTransform {
  url: string = environment.siteUrlMedia; // exemple: https://monserveur.com

  transform(value: any, ...args: unknown[]): unknown {

    // Si la valeur est vide ou nulle
    if (!value) {
      return 'assets/images/gallery.jpg';
    }

    // Si la valeur ressemble à une image encodée en base64
    if (typeof value === 'string' && value.length > 1500) {
      return value;
    }

    // Si la valeur est déjà une URL complète (http:// ou https://)
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return value;
    }

    // -------------------------
    // LOGIQUE /media
    // -------------------------
    let path = value as string;

    if (!path.includes('/media')) {
      // On ajoute /media uniquement si absent
      path = '/media/' + path.replace(/^\/+/, '');
      // retire les slashs avant pour éviter //media//image.jpg
    }

    // -------------------------
    // Assemblage final avec l'URL du serveur
    // -------------------------
    let separator = '';

    if (this.url.endsWith('/') && path.startsWith('/')) {
      separator = '';
      path = path.substring(1);
    } else if (!this.url.endsWith('/') && !path.startsWith('/')) {
      separator = '/';
    }

    return this.url + separator + path;
  }
}
