// Angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  // public props
  panels = [
    {
      title: 'when do I need Extended License?',
      text: 'If your End Product which is sold - Then only your required Extended License. i.e. If you take subscription charges (monthly, yearly, etc...) from your end users in this case you required Extended License.'
    },
    {
      title: 'What Support Includes?',
      text: '6 Months of Support Includes with 1 year of free updates. We are happy to solve your bugs, issue.'
    },
    {
      title: 'Is Berry Support Typescript?',
      text: 'Yes, Berry Support the TypeScript and it is only available in Plus and Extended License.'
    },
    {
      title: 'Is there any Roadmap for Berry?',
      text: 'Berry is our flagship React Dashboard Template and we always add the new features for the long run. You can check the Roadmap in Documentation.'
    }
  ];

  isCollapsed = true;
}
