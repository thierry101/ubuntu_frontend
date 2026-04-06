/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { list_permissions } from 'src/app/share/permissions';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from '../../../reusableComponents/set-pagination/set-pagination.component';
import { SearchListComponent } from "../../../reusableComponents/search-list/search-list.component";
import { Permission, PermissionDefinition, User } from 'src/app/interfaces/global';
import { SelectedComponent } from '../../../reusableComponents/selected/selected.component';
import { SpinnersComponent } from '../../../reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from '../../../reusableComponents/submit-spinner/submit-spinner.component';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-list-permissions',
  standalone: true,
  imports: [SharedModule, CommonModule, SetPaginationComponent, SubmitSpinnerComponent, SpinnersComponent, SearchListComponent, NgSelectModule, SelectedComponent],
  templateUrl: './list-permissions.component.html',
  styleUrl: './list-permissions.component.scss'
})
export class ListPermissionsComponent implements OnInit {
  users: User[] = []
  searchTerm: string = ''
  searchTermUsr: string = ''
  editPerm: boolean = false
  isSaving: boolean = false
  permissionToEdit !: Permission
  allPermissions: PermissionDefinition[] = []
  listPermissions: Permission[] = []
  errors: any = []
  formPermission: FormGroup
  pagination!: any;
  count = 0;
  next: string | null = null;
  previous: string | null = null;
  currentPage = 1;
  pages: number[] = [];
  url: string = ''
  titleModal: string = 'Ajouter une permission'
  idPermission: number = 0
  showRead: boolean = true
  showCreate: boolean = true
  showEdit: boolean = true
  showDelete: boolean = true
  isLoading: boolean = false

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.formPermission = this.fb.group({
      user: ['', Validators.required],
      permission: ['Choisir...', Validators.required],
      edit_p: [false, Validators.required],
      delete_p: [false, Validators.required],
      create_p: [false, Validators.required],
      read_p: [false, Validators.required],
    });
  }

  ngOnInit(): void {
    this.allPermissions = list_permissions
    this.fetchPermissions(1)
  }

  //  *************************************$ Pagination start **************************************
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchPermissions(1); // reset to first page on search
  }

  fetchPermissions(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.authService.getPermission.bind(this.authService), page, this.searchTerm, (data: any) => {
      this.pagination = data
      this.listPermissions = data?.listItems; //Retrieve all permissions
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number) {
    this.fetchPermissions(page);
  }
  // ************************** Pagination end **************************************

  savePermission() {
    this.isLoading = true;
    this.isSaving = true;

    const payload = this.formPermission.getRawValue();

    this.authService.postPermission(payload).pipe(
      switchMap(() => { // après avoir posté la permission, on vérifie si c'est pour l'utilisateur actuel si oui on refresh la session pour mettre à jour les permissions en temps réel
        // ✅ Vérifier si la permission assignée concerne l'utilisateur connecté
        const currentUserId = this.authService.currentUser?.id;
        const targetUserId = payload.user;

        if (currentUserId === targetUserId) {
          return this.authService.refreshSession(); // ✅ refresh uniquement si c'est lui-même
        }

        return of(null); // ✅ autre utilisateur → pas besoin de refresh
      })
    ).subscribe({
      next: () => {
        this.fetchPermissions(1);
        toastShow("success", "✅ Permission assignée avec succès");

        this.searchTerm = '';
        this.errors = [];
        this.isSaving = false;
        this.isLoading = false;

        this.formPermission.reset({
          user: null,
          permission: 'Choisir...',
          read_p: false,
          create_p: false,
          edit_p: false,
          delete_p: false
        });

        this.formPermission.get('read_p')?.enable();

        this.showRead = false;
        this.showCreate = false;
        this.showEdit = false;
        this.showDelete = false;

        document.getElementById('closeModalPermission')?.click();
      },
      error: (err) => {
        this.isSaving = false;
        this.isLoading = false;
        this.errors = err.error?.errors || [];
        showError(
          err,
          err.status,
          this.errors,
          err.error,
          document.getElementById('closeModalPermission')
        );
      }
    });
  }


  saveEditPermission() {
    this.isLoading = true
    const payload = this.formPermission.getRawValue(); // ✅ inclut read_p même désactivé
    this.authService.putPermission(this.permissionToEdit?.id, payload).subscribe({
      next: (res: any) => {
        this.fetchPermissions(1);
        toastShow("success", "✅ Permission mise à jour");
        document.getElementById('closeModalPermission')?.click();
        this.isLoading = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalPermission'));
      }
    });
  }


  deletePermission(idPermi: number) {
    this.idPermission = idPermi
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cette permission!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deletePermission(idPermi).subscribe({
          next: () => {
            this.fetchPermissions(1);
            toastShow('success', "✅ Permission supprimé avec succès");
          },
          error: (err) => {
            showError(err, err?.status, this.errors, err?.error);
          }
        });
      }
    });
  }

  resetModal() {
    // reset des erreurs et états
    this.errors = [];
    this.searchTerm = '';
    this.searchTermUsr = ''
    this.titleModal = 'Ajouter une permission';
    this.editPerm = false;

    // cacher tous les droits
    this.showRead = false;
    this.showCreate = false;
    this.showEdit = false;
    this.showDelete = false;

    // réinitialiser complètement le formulaire
    this.formPermission.reset({
      user: null,
      permission: 'Choisir...',
      read_p: false,
      create_p: false,
      edit_p: false,
      delete_p: false
    });

    // important : réactiver read_p pour éviter qu'il reste disabled
    this.formPermission.get('read_p')?.enable();
  }


  // getUser() {
  //   this.fetchUsers(1)
  // }


  onPermissionSelect(permission: any) {
    if (!permission) return;

    // Reset UI
    this.showRead = false;
    this.showCreate = false;
    this.showEdit = false;
    this.showDelete = false;

    // Activer les droits selon la configuration
    this.showRead = permission?.rights?.includes("read");
    this.showCreate = permission?.rights?.includes("create");
    this.showEdit = permission?.rights?.includes("edit");
    this.showDelete = permission?.rights?.includes("delete");

    // Réinitialiser les valeurs du formulaire
    this.formPermission.patchValue({
      read_p: false,
      create_p: false,
      edit_p: false,
      delete_p: false,
    });

    // Activer read_p au cas où il avait été désactivé
    this.formPermission.get("read_p")?.enable();
  }


  searchUser(term: string): void {
    this.searchTermUsr = term;
    this.fetchUsers(1);
  }


  fetchUsers(page: number = 1) {
    this.authService.getRegisterByAdmin(page, this.searchTermUsr).subscribe({
      next: (data: { results: User[] }) => {
        this.users = data?.results;
      }
    });
  }


  selectUser(user: User): void {
    this.searchTermUsr = user?.email; // Set search term to selected product name
    this.users = []
    this.formPermission.patchValue({
      user: user?.id
    })
  }

  clickOutsideModal() {
    this.users = []
  }

  returnNamePermission(valuePermission: string) {
    return this.allPermissions.find((permission: PermissionDefinition) => permission?.value === valuePermission)?.name;
  }

  editPermission(permission: Permission) {
    const tPermission = this.allPermissions.find(
      (perm: any) => perm.value === permission.content_type
    );

    this.idPermission = permission.id;
    this.titleModal = "Modifier une permission";
    this.editPerm = true;
    this.permissionToEdit = permission;
    this.errors = [];

    // 1️⃣ — Récupérer les droits API
    const readP = permission.permission_type.includes("read");
    const createP = permission.permission_type.includes("create");
    const editP = permission.permission_type.includes("edit");
    const deleteP = permission.permission_type.includes("delete");

    // 2️⃣ — D'abord afficher les bons droits dans l’UI
    this.formPermission.patchValue({
      permission: tPermission,
      user: permission.user.id
    });

    this.onPermissionSelect(tPermission); // ← important : à faire AVANT remplissage final

    // 3️⃣ — Ensuite patcher les valeurs des checkbox
    // (maintenant les inputs existent et ne seront plus reset)
    this.formPermission.patchValue({
      read_p: readP,
      create_p: createP,
      edit_p: editP,
      delete_p: deleteP
    });

    // 4️⃣ — Enfin gérer automatiquement le read_p désactivé si besoin
    this.checkRigth();

    // Remplir le champ d’email
    this.searchTermUsr = permission.user.email;
  }




  // Prochaine permission : valider les stocks
  checkRigth() {
    const isCreate = this.formPermission.get("create_p")?.value;
    const isEdit = this.formPermission.get("edit_p")?.value;
    const isDelete = this.formPermission.get("delete_p")?.value;

    const hasSpecial = isCreate || isEdit || isDelete;

    if (hasSpecial) {
      this.formPermission.patchValue({ read_p: true });
      this.formPermission.get("read_p")?.disable();
    } else {
      this.formPermission.get("read_p")?.enable();
    }
  }



  trackById(index: number, product: any): number {
    return product?.id; // or any unique field
  }
}
