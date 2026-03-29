// Angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-under-constructor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './under-constructor.component.html',
  styleUrls: ['./under-constructor.component.scss']
})
export class UnderConstructorComponent {}
