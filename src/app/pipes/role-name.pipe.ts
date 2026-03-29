import { Pipe, PipeTransform } from '@angular/core';
import { roles } from '../share/shared';

@Pipe({
  name: 'roleName',
  standalone: true, // ✅ make it standalone
})
export class RoleNamePipe implements PipeTransform {
  private roles = roles;

  transform(value: string): string {
    return this.roles.find(r => r.value === value)?.name || 'Inconnu';
  }
}

