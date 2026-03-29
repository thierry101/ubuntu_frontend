/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { generateComplexPassword, roles, setPagination, showError, toastShow } from 'src/app/share/shared';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "../../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../../reusableComponents/search-list/search-list.component";
import { Enterprise, globalInterface, User, Warehouse } from 'src/app/interfaces/global';
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from '../../../reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from "../../../reusableComponents/submit-spinner/submit-spinner.component";

@Component({
  selector: 'app-list-style-v2',
  standalone: true,
  imports: [CommonModule, SharedModule, ImagePipe, SetPaginationComponent, SearchListComponent, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './list-style-v2.component.html',
  styleUrls: ['./list-style-v2.component.scss']
})
export class ListStyleV2Component implements OnInit {
  // private Method
  titleModal: string = ''
  isLoading: boolean = false
  isSaving: boolean = false
  idUsrToEdit !: any
  roles: globalInterface[] = []
  errors: any = []
  formUser: FormGroup
  formResetPassword: FormGroup
  editUser: boolean = false
  users: User[] = []
  // listPermissions!: any
  nber_pages: number = 0
  url: string = ''
  searchTerm: string = ''
  passwordType = 'password';
  show = false;
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  warehouses: Warehouse[] = []
  newWarehouses: Warehouse[] = []
  the_setting!: Enterprise

  constructor(private fb: FormBuilder, private authService: AuthService, private publicService: PublicService) {
    this.formUser = this.fb.group({
      name: [''],
      surname: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['',],
      whShop: [0],
      role: [0, Validators.required],
      password: ['']
    })
    this.formResetPassword = this.fb.group({
      name: [''],
      surname: [''],
      email: [''],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.url = environment.apiUrl;
    this.fetchUsers(1)
    this.publicService.enterpriseCustomisation$.subscribe((data) => {
      if (data) {
        this.the_setting = data
      }
    });
  }

  filterRoles(): void {
    const yesWhSecond = this.the_setting?.yesWhSecond;
    const allRoles = roles
    this.roles = yesWhSecond ? allRoles : allRoles.filter(type => type.value !== 'Agent');
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchUsers(1); // reset to first page on search
  }

  fetchUsers(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.authService.getRegisterByAdmin.bind(this.authService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.users = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number) {
    if (page < 1 || page > this.pagination.nber_pages) return;
    this.fetchUsers(page);
  }


  resetFormUser() {
    this.filterRoles();
    this.publicService.getWarehouseStore().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result;
      }
    });
    this.newWarehouses = []
    this.editUser = false
    this.titleModal = 'Ajouter un utilisateur'
    this.errors = []
    this.formUser = this.fb.group({
      name: [''],
      surname: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['',],
      whShop: [0],
      role: [0, Validators.required],
      password: ['']
    })
  }

  registerUser() {
    this.isLoading = true
    this.isSaving = true
    this.authService.postRegisterByAdmin(this.formUser?.value).subscribe({
      next: (res: { result: User }) => {
        this.fetchUsers(1)
        toastShow('success', "✅ Utilisateur enregistré avec succès");
        document.getElementById('closeModalRegister')?.click();
        this.isLoading = false
        this.isSaving = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalRegister'));
      }
    });
  }

  saveEditUser() {
    this.isSaving = true
    const data = {
      checker: 'edit',
      data: this.formUser?.value,
    };
    this.authService.putUser(this.idUsrToEdit, data).subscribe({
      next: (res: { result: User }) => {
        toastShow('success', "✅ Utilisateur mis à jour");
        document.getElementById('closeModalRegister')?.click();
        this.users = this.users.filter((user: User) => user.id !== this.idUsrToEdit);
        this.isSaving = false
        this.fetchUsers(1)
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalRegister'));
      }
    });
  }

  editTheUser(user: User) {
    this.filterRoles();
    this.editUser = true;
    this.idUsrToEdit = user?.id;
    this.errors = [];
    this.titleModal = 'Modifier un utilisateur';

    this.publicService.getWarehouseStore().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result || [];
        const role = user?.role;

        if (['Agency', 'Seller'].includes(role)) {
          this.newWarehouses = this.warehouses.filter(w => w.typeWh === 'Boutique');
        } else if (['siteAdmin', 'Admin'].includes(role)) {
          this.newWarehouses = this.warehouses.filter(w => w.typeWh === 'Principal');
        } else if (role === 'Agent') {
          this.newWarehouses = this.warehouses.filter(w => w.typeWh === 'Secondaire');
        } else {
          this.newWarehouses = [];
        }

        // 🔥 PATCH VALUE APRÈS le chargement des options
        this.formUser.patchValue({
          name: user?.name,
          surname: user?.surname,
          email: user?.email,
          phone: user?.phone,
          whShop: user?.whStore?.id ?? 0,
          role: user?.role ?? 0,
        });
      }
    });
  }


  resetPasswordUser(user: User) {
    this.editUser = true
    this.idUsrToEdit = user?.id
    this.errors = []
    this.titleModal = 'Modifier le mot de passe'
    this.formResetPassword.patchValue({
      email: user?.email,
      name: user?.name,
      surname: user?.surname,
      password: ''
    })
  }

  generatePassword() {
    const newPassd = generateComplexPassword(8)
    this.formResetPassword.patchValue({
      password: newPassd
    })
  }

  saveResetPassword() {
    const data = {
      checker: 'resetPassword',
      data: this.formResetPassword.get('password')?.value
    }
    this.authService.putUser(this.idUsrToEdit, data).subscribe({
      next: () => {
        toastShow('success', "✅ Mot de passe mis à jour");
        const t_psswd = document.getElementById('closeModalResetPassword')
        t_psswd?.click()
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalRegister'));
      }
    })
  }

  deleteUser(idUser: number) {
    this.idUsrToEdit = idUser
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cet utilisateur!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteUser(idUser).subscribe({
          next: () => {
            this.fetchUsers(1)
            toastShow('success', "✅ Utilisateur supprimé avec succès");
          },
          error: (err) => {
            showError(err, err.status, this.errors, err.error);
          }
        });
      }
    });
  }

  showWhStoreBasedRole() {
    const role = this.formUser.get('role')?.value;
    this.formUser.patchValue({
      whShop: 0
    })
    if (['Agency', 'Seller'].includes(role)) {
      this.newWarehouses = this.warehouses.filter(item => item.typeWh === "Boutique")
    }
    if (['siteAdmin', 'Admin'].includes(role)) {
      this.newWarehouses = this.warehouses.filter(item => item.typeWh === "Principal")
    }
    if (['Agent'].includes(role)) {
      this.newWarehouses = this.warehouses.filter(item => item.typeWh === "Secondaire")
    }
    if (!['siteAdmin', 'Agent', 'Agency', 'Seller', 'Admin'].includes(role)) {
      this.newWarehouses = []
    }
  }

  shPasswd() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.show = true;
    } else {
      this.passwordType = 'password';
      this.show = false;
    }
  }

  returnRole(item: string) {
    return roles.find((role: globalInterface) => role?.value === item)?.name;
  }

  trackByUserId(index: number, list: any): number {
    return list?.id;
  }
}


