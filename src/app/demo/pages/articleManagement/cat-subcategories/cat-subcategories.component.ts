/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';
import { Category, SubCategory } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";

@Component({
  selector: 'app-cat-subcategories',
  standalone: true,
  imports: [SharedModule, NgSelectModule, SubmitSpinnerComponent, SetPaginationComponent, SearchListComponent, SpinnersComponent, SelectedComponent],
  templateUrl: './cat-subcategories.component.html',
  styleUrl: './cat-subcategories.component.scss'
})
export class CatSubcategoriesComponent implements OnInit {

  nameCategory: string = ''
  subCategory: any = { category: 0, nameSubcategory: '' }
  listCategories: Category[] = [];
  listCategoriesSearch: Category[] = [];
  listSubCategories: SubCategory[] = []
  errors: any = []
  selectCat: any = 'Choisir...'
  nameSubCat: string = ''
  catToEdit !: any
  subCatToEdit !: any
  editCat: boolean = false
  editSubCat: boolean = false
  isSaving: boolean = false
  isLoading: boolean = false
  isLoadingSub: boolean = false
  titleModal: string = "Ajouter une catégorie"
  titleModalSub: string = "Ajouter une catégorie"
  pagination!: any;
  pages: number[] = [];
  searchTerm: string = ""
  searchTermSubCat: string = ""
  searchTermSubCatForCat: string = ""
  paginationSubCat!: any;
  pagesSubCat: number[] = [];

  constructor(private articleService: ArticleManagementService) { }

  ngOnInit(): void {
    this.fetchCategories(1)
    this.fetchSubCategories(1)

  }


  fetchCategories(page: number = 1) {
    this.isLoading = true
    setPagination(this.articleService.getCategory.bind(this.articleService), page, this.searchTerm, (data: any) => {
      this.pagination = data
      this.listCategories = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    })
  }


  onPageChange(page: number) {
    this.fetchCategories(page);
  }


  onSearchCategoryforSub(term: string) {
    this.searchTermSubCatForCat = term;
    this.articleService.getCategory(1, this.searchTermSubCatForCat).subscribe({
      next: (res: any) => {
        this.listCategoriesSearch = res?.results
      }
    })
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchCategories(1);
  }


  selectCategoryForSub(category: Category) {
    if (category?.name) {
      this.selectCat = category?.id
      this.searchTermSubCatForCat = category?.name
      this.listCategoriesSearch = []
    }
  }


  fetchSubCategories(page: number = 1) {
    this.isLoadingSub = true
    setPagination(this.articleService.getSubCategory.bind(this.articleService), page, this.searchTermSubCat, (data: any) => {
      this.paginationSubCat = data
      this.listSubCategories = data?.listItems;
      this.pagesSubCat = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoadingSub = false
    })
  }


  onPageChangeSub(page: number) {
    this.fetchSubCategories(page);
  }


  onSearchChangeSub(term: string) {
    this.searchTermSubCat = term;
    this.fetchSubCategories(1);
  }


  saveCategory() {
    this.isLoading = true
    const data = { nameCat: this.nameCategory }
    this.articleService.postCategory(data).subscribe({
      next: (res: any) => {
        this.fetchCategories(1);
        this.nameCategory = ''
        this.isLoading = false
        toastShow('success', "✅ Catégorie enregistrée avec succès")
        this.errors = []
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  saveEditCategory() {
    this.isSaving = true
    const data = { nameCat: this.nameCategory }
    this.articleService.putCategory(this.catToEdit?.id, data).subscribe({
      next: (res: any) => {
        this.listCategories = this.listCategories.filter((category: any) => category.id !== this.catToEdit?.id)
        this.listCategories?.unshift(res?.result)
        document.getElementById("closeModalCategory")?.click()
        this.errors = []
        this.isSaving = false
        toastShow('success', "✅ Catégorie mise à jour avec succès")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  deleteCategory(idCat: number) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cette catégorie!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleService.deleteCategory(idCat).subscribe({
          next: (res: any) => {
            this.listCategories = this.listCategories.filter((category: any) => category?.id !== idCat);
            this.fetchCategories(1);
            toastShow('success', "✅ Catégorie supprimée avec succès");
          },
          error: (err) => {
            showError(err, err.status, this.errors, err.error);
          }
        });
      }
    });
  }


  saveSubCategory() {
    this.isSaving = true
    const data = {
      idCat: this.selectCat,
      nameSubCat: this.nameSubCat
    };

    this.articleService.postSubCategory(data).subscribe({
      next: (res: any) => {
        this.listSubCategories?.unshift(res?.result);
        this.selectCat = 'Choisir...';
        this.nameSubCat = '';
        this.searchTermSubCatForCat = ''
        this.fetchSubCategories(1);
        toastShow('success', "✅ Sous-catégorie ajoutée avec succès");
        this.errors = [];
        this.isSaving = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalSubCategory'));
      }
    });
  }


  saveEditSubCategory() {
    this.isSaving = true
    const data = {
      idCat: this.selectCat,
      nameSubCat: this.nameSubCat
    }
    this.articleService.putSubCategory(this.subCatToEdit?.id, data).subscribe({
      next: (res: any) => {
        this.listSubCategories = this.listSubCategories.filter((subCategory: any) => subCategory.id !== this.subCatToEdit?.id)
        this.listSubCategories?.unshift(res?.result)
        this.selectCat = 'Choisir...'
        this.nameSubCat = ''
        this.isSaving = false
        toastShow('success', "✅ Sous-catégorie modifiée avec succès")
        document.getElementById('closeModalSubCategory')?.click()
        this.errors = []
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalSubCategory'));
      }
    })
  }

  deleteSubCategory(idSubCat: number) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cette sous-catégorie!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleService.deleteSubCategory(idSubCat).subscribe({
          next: () => {
            this.listSubCategories = this.listSubCategories.filter((subCategory: any) => subCategory?.id !== idSubCat);
            this.fetchSubCategories(1);
            toastShow('success', "✅ Sous-catégorie supprimée avec succès")
          },
          error: (err) => {
            showError(err, err.status, this.errors, err.error);

          }
        })
      }
    });
  }

  fillCategory(item: any) {
    this.nameCategory = item?.name
    this.catToEdit = item
    this.editCat = true
    this.titleModal = "Éditer une catégorie"
    this.errors = []
  }

  fillSubCategory(subCat: any) {
    this.clearTab()
    this.editSubCat = true
    this.subCatToEdit = subCat
    this.titleModalSub = "Éditer une sous-catégorie"
    this.selectCat = subCat?.category?.id
    this.searchTermSubCatForCat = subCat?.category?.name
    this.nameSubCat = subCat?.name
    this.errors = []
  }

  resetForm() {
    this.editCat = false
    this.titleModal = "Ajouter une catégorie"
    this.nameCategory = '',
      this.errors = []
  }

  resetSubCat() {
    this.editSubCat = false
    this.titleModalSub = "Ajouter une sous-catégorie"
    this.selectCat = 'Choisir...'
    this.nameSubCat = ''
    this.clearTab()
    this.searchTermSubCatForCat = ''
    this.errors = []
  }

  clearTab() {
    this.listCategoriesSearch = []
  }

  trackById(index: number, item: any): number {
    return item?.id; // or any unique field
  }

  trackById2(index: number, item: any): number {
    return item?.id; // or any unique field
  }

}
