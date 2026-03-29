/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
// third party
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/global';
import { FormBuilder, FormGroup } from '@angular/forms';
import { showError, toastShow } from 'src/app/share/shared';

@Component({
  selector: 'app-profile-one',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './profile-one.component.html',
  styleUrls: ['./profile-one.component.scss']
})
export class ProfileOneComponent implements OnInit {
  passwordType = 'password';
  passwordType2 = 'password';
  show = false;
  show2 = false;
  userDetail!: User
  errors: any = [];
  formUser!: FormGroup
  formPassword!: FormGroup

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.formUser = this.fb.group({
      name: '',
      surname: '',
      email: '',
      phone: ''
    })
    this.formPassword = this.fb.group({
      oldPassword: '',
      newPassword: '',
    })
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res: { result: User }) => {
        this.userDetail = res?.result
        this.formUser.patchValue({
          name: this.userDetail?.name,
          surname: this.userDetail?.surname,
          email: this.userDetail?.email,
          phone: this.userDetail?.phone,
        })
      }
    })
  }

  updateProfile() {
    const data = { checker: 'general', data: this.formUser?.value }
    this.authService.putProfile(data).subscribe({
      next: (res: { result: boolean }) => {
        this.errors = []
        toastShow("success", "✅ Profil mis à jour")
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory01'));
      }
    })
  }

  createNewPassword() {
    const data = { checker: 'password', data: this.formPassword?.value }
    this.authService.putProfile(data).subscribe({
      next: (res: { result: boolean }) => {
        this.errors = []
        toastShow("success", "✅ Mot de passe mis à jour")
        this.formPassword.reset()
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory01'));
      }
    })
  }

  shOldPasswd() {
    if (this.passwordType2 === 'password') {
      this.passwordType2 = 'text';
      this.show2 = true;
    } else {
      this.passwordType2 = 'password';
      this.show2 = false;
    }
  }

  shNewPasswd() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.show = true;
    } else {
      this.passwordType = 'password';
      this.show = false;
    }
  }

}


