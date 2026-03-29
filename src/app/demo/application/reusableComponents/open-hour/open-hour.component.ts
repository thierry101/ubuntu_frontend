/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { OpenHour } from 'src/app/interfaces/global';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-open-hour',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './open-hour.component.html',
  styleUrl: './open-hour.component.scss'
})
export class OpenHourComponent implements OnInit, OnDestroy {

  errorData: any;
  countdown = '';
  private timerSub?: Subscription;
  private nextOpenDate?: Date;
  workSchedule:OpenHour[] = []

  constructor() { }


  ngOnInit(): void {
    // Receive the error passed through router navigation state
    this.errorData = history.state.error;
    this.workSchedule = this.errorData?.hour_open
    if (this.errorData?.next_day && this.errorData?.open_hour) {
      this.nextOpenDate = this.getNextOpenDate(
        this.errorData?.next_day,
        this.errorData?.open_hour
      );
      this.startCountdown();
    }
  }


  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  private getNextOpenDate(dayName: string, time: string): Date {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const targetDay = dayMap[dayName.toLowerCase()];
    const now = new Date();
    const next = new Date(now);

    const currentDay = now.getDay();
    let daysUntilNext = targetDay - currentDay;

    // Parse open time
    const [hours, minutes] = time.split(':').map(Number);

    // If same day
    if (daysUntilNext === 0) {
      const openToday = new Date(now);
      openToday.setHours(hours, minutes, 0, 0);

      // If open time is still in the future today → use today
      if (openToday > now) {
        return openToday;
      } else {
        // Already passed → go to next week
        daysUntilNext = 7;
      }
    } else if (daysUntilNext < 0) {
      daysUntilNext += 7;
    }

    next.setDate(now.getDate() + daysUntilNext);
    next.setHours(hours, minutes, 0, 0);
    return next;
  }

  private startCountdown(): void {
    if (!this.nextOpenDate) return;

    this.timerSub = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const diff = this.nextOpenDate!.getTime() - now;

      if (diff <= 0) {
        this.countdown = 'Ouverture imminente...';
        this.timerSub?.unsubscribe();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      this.countdown =
        (days > 0 ? `${days}j ` : '') +
        `${hours}h ${minutes}m ${seconds}s`;
    });
  }

}
