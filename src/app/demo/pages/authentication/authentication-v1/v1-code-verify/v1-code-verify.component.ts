/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MaskEmailPipe } from 'src/app/pipes/mask-email.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { showError, toastShow } from 'src/app/share/shared';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MyThemeComponent } from '../my-theme/my-theme.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-v1-code-verify',
  standalone: true,
  imports: [CommonModule, SharedModule, MaskEmailPipe, MyThemeComponent, LogoComponent],
  templateUrl: './v1-code-verify.component.html',
  styleUrls: ['./v1-code-verify.component.scss']
})
export class V1CodeVerifyComponent implements OnInit {

  email: string = ""
  errors: any = []
  formCode !: FormGroup
  codes: any = ['code1', 'code2', 'code3', 'code4', 'code5', 'code6'];
  cooldown = 0;
  isResending = false;
  private cooldownTimer?: any;
  @ViewChildren('codeInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private authService: AuthService, private fb: FormBuilder, private route: Router) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (localStorage.getItem("email")) {
      this.email = localStorage.getItem("email") || ''
    }
    this.formCode = this.fb.group({
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: '',
      email: ''
    })
    // if (this.email) {
    //   this.authService.rePostOtp(this.email).subscribe({
    //     next: () => {

    //     },
    //     error: (err) => {
    //       this.errors = err.error?.errors || [];
    //       this.isResending = false;
    //       showError(err, err.status, this.errors, err.error);

    //       // Si backend fournit cooldown_remaining même en erreur (429)
    //       const cooldown = err.error?.cooldown_remaining;
    //       if (cooldown && cooldown > 0) {
    //         this.startCooldown(cooldown);
    //       }
    //     }

    //   });
    // }
    // 3. VÉRIFIER LE COOLDOWN (SANS APPEL API)
    // Restaure cooldown si présent dans localStorage
    const cooldownExpiry = localStorage.getItem('otpCooldown');
    if (cooldownExpiry) {
      const remaining = Math.max(0, Math.floor((+cooldownExpiry - Date.now()) / 1000));
      if (remaining > 0) {
        this.startCooldown(remaining);
      } else {
        localStorage.removeItem('otpCooldown');
      }
    }
  }


  validCode() {
    this.formCode.patchValue({ email: this.email });

    this.authService.postConfirmOtp(this.formCode?.value).subscribe({
      next: (res: any) => {
        toastShow("success", "✅ Votre code d'authentification a été validé avec succès.");
        this.route.navigate(['/login']);
        localStorage.removeItem("email");
        this.email = '';
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error);
      }
    });
  }


  resendOtp() {
    const email = localStorage.getItem("email");

    if (this.cooldown > 0) return; // bloque si cooldown actif
    if (!email) {
      toastShow('info', '⚠️ Aucune adresse email trouvée.');
      return;
    }

    this.isResending = true;

    this.authService.rePostOtp(email).subscribe({
      next: (res: any) => {
        toastShow("success", "✅ Votre code d'authentification a été envoyé avec succès.");
        this.isResending = false;
        this.errors = [];
        // Démarrage du cooldown avec la valeur du backend
        this.startCooldown(res.cooldown_remaining || 60);
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        this.isResending = false;
        showError(err, err.status, this.errors, err.error);

        // Si backend fournit cooldown_remaining même en erreur (429)
        const cooldown = err.error?.cooldown_remaining;
        if (cooldown && cooldown > 0) {
          this.startCooldown(cooldown);
        }
      }
    });
  }


  onInput(event: Event, index: number) { //pour switcher d'un input à un autre après avoir entré un caractère
    const input = event.target as HTMLInputElement | null;

    if (!input) return;

    if (input.value && index < this.inputs.length - 1) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }



  onKeyDown(event: KeyboardEvent, index: number) { //pour supprimer le contenu input après input
    const input = event.target as HTMLInputElement | null;

    if (!input) return;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }



  onPaste(event: ClipboardEvent) { //lorsque l'utilisateur copie le code pour le coller
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    digits.split('').forEach((digit, index) => {
      if (this.codes[index]) {
        this.formCode.get(this.codes[index])?.setValue(digit);
      }
    });

    const lastIndex = digits.length - 1;
    if (lastIndex >= 0 && lastIndex < this.inputs.length) {
      this.inputs.toArray()[lastIndex].nativeElement.focus();
    }
  }


  // startCooldown(seconds: number) {
  //   this.cooldown = seconds;

  //   this.cooldownTimer = setInterval(() => {
  //     this.cooldown--;

  //     if (this.cooldown === 0) {
  //       clearInterval(this.cooldownTimer);
  //     }
  //   }, 1000);
  // }

  startCooldown(seconds: number) {
    this.cooldown = seconds;
    const expiresAt = Date.now() + seconds * 1000;
    localStorage.setItem('otpCooldown', expiresAt.toString());

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      this.cooldown = remaining;
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }




}
