import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
  standalone: true, // 👈 Pour nous permettre d'importer notre pipe dans des composants standalones
})
export class MaskEmailPipe implements PipeTransform {

  transform(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return username[0] + '*'.repeat(username.length - 1) + '@' + domain;
    }

    const visiblePart = username.substring(0, 4);
    const maskedPart = '*'.repeat(username.length - 4);

    return `${visiblePart}${maskedPart}@${domain}`;
  }

}
