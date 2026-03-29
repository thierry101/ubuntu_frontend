/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { NgSelectModule } from '@ng-select/ng-select';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { SubCategory, Category, Product } from 'src/app/interfaces/global';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { all_sizes } from 'src/app/share/sizes';
import { all_colors } from 'src/app/share/colors';
import { convertAmount, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import Swal from 'sweetalert2';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { PublicService } from 'src/app/services/public.service';
import { TooltipComponent } from 'src/app/demo/application/reusableComponents/tooltip/tooltip.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [SearchListComponent, ImagePipe, NgSelectModule, SharedModule, SetPaginationComponent, SpinnersComponent, 
    TooltipComponent, SubmitSpinnerComponent, SelectedComponent],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit {

  logoPreview: string | ArrayBuffer | null = null;
  searchTerm: string = ''
  list_categories: Category[] = []
  list_subCategories: SubCategory[] = []
  formArticle: FormGroup
  selectSize: any = 0
  all_products: Product[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  all_sizes!: any
  all_colors!: any
  editProduct: boolean = false
  productToEdit!: Product
  idProduct: number = 0
  selected_sizes!: any
  pages: number[] = [];
  errors: any = []
  titleModal: string = ''
  isLoading: boolean = false
  isSaving: boolean = false
  searchTermCat: string = ''
  searchTermSubCat: string = ""
  devise: string = '';

  constructor(private articleManagementService: ArticleManagementService, private publicService: PublicService, private fb: FormBuilder) {
    this.formArticle = this.fb.group({
      category: "Choisir...",
      subCategory: "Choisir...",
      name: '',
      barCode: '',
      size: 'Choisir...',
      color: 0,
      image: { name: '', file: '' },
      warningQty: 0,
      sellPrice: 0
    })
  }

  ngOnInit(): void {
    // Supprimer un article uniquement si la quantité est égale à 0
    this.all_sizes = all_sizes
    this.all_colors = all_colors
    this.fetchProducts(1)
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }

  onSearchCategory(term: string) {
    this.searchTermCat = term;
    this.articleManagementService.getCategory(1, this.searchTermCat).subscribe({
      next: (res: any) => {
        this.list_categories = res?.results
      }
    })
  }

  selectCategory(category: Category) {
    if (category?.name) {
      this.searchTermCat = category?.name
      this.clearTable()
      this.formArticle.patchValue({
        category: category?.id
      })
    }
  }

  onSearchSubCategoryBasedCat(term: string) {
    this.searchTermSubCat = term;
    if (this.formArticle.get('category')?.value) {
      this.articleManagementService.getSubCatBasedCat(this.formArticle.get('category')?.value, this.searchTermSubCat).subscribe({
        next: (res: any) => {
          this.list_subCategories = res?.result
        }
      })
    }
  }

  selectSubCategoryBasedCat(subCategory: SubCategory) {
    if (subCategory?.name) {
      this.searchTermSubCat = subCategory?.name
      this.clearTable()
      this.formArticle.patchValue({
        subCategory: subCategory?.id
      })
    }
  }

  // ******************************* About retrieve article, pagination and search  *******************************
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // reset to first page on search
  }

  fetchProducts(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.articleManagementService.getAllProducts.bind(this.articleManagementService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_products = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  onPageChange(page: number) {
    this.fetchProducts(page);
  }
  // ******************************* End retrieve article, pagination and search  *******************************


  saveProduct() {
    this.isSaving = true
    this.articleManagementService.postProduct(this.formArticle?.getRawValue()).subscribe({
      next: () => {
        this.fetchProducts(1)
        this.list_subCategories = []
        toastShow("success", "✅ Aricle ajouté avec succès")
        this.isSaving = false
        this.logoPreview = ''
        this.searchTermCat = ''
        this.searchTermSubCat = ''
        this.errors = []
        this.selectSize = 0
        this.formArticle.patchValue({
          category: "Choisir...",
          subCategory: "Choisir...",
          name: '',
          barCode: '',
          size: 0,
          color: 'Choisir...',
          image: '',
          warningQty: 0,
          sellPrice: 0

        })
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalProd004'));
      }
    })
  }

  saveEditProduct() {
    this.isSaving = true
    this.articleManagementService.putProduct(this.productToEdit?.id, this.formArticle?.getRawValue()).subscribe({
      next: (res: { product: Product }) => {
        this.all_products = this.all_products.filter((prod: any) => prod.id !== this.productToEdit?.id)
        this.all_products?.unshift(res?.product)
        toastShow("success", "✅ Aricle mis à jour avec sucès")
        this.isSaving = false
        document.getElementById('closeModalProd004')?.click()
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalProd004'));
      }
    })
  }

  deleteProduct(idProduct: number) {
    this.idProduct = idProduct
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
        this.articleManagementService.deleteProduct(idProduct).subscribe({
          next: () => {
            this.all_products = this.all_products.filter((category: any) => category?.id !== idProduct);
            this.fetchProducts(1)
            toastShow('success', "✅ Produit supprimé avec succès");
            this.errors = []
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, document.getElementById('closeSubCat05'));
          }
        });
      }
    });
  }

  fillModal(product: Product) {
    this.idProduct = product?.id
    this.titleModal = "Modifier le produit"
    this.searchTermCat = product.category?.name
    this.searchTermSubCat = product?.subCategory?.name
    this.productToEdit = product
    this.selectSize = 0
    this.selected_sizes = []
    this.formArticle.patchValue({
      size: 0,
    })
    if (product?.size) {
      this.all_sizes.forEach((t_size: any) => {
        const hasSize42 = t_size.sizes.some((size: any) => size?.value === product?.size);
        if (hasSize42) {
          this.selectSize = t_size?.name
          this.selected_sizes = t_size?.sizes
        }
      });
    }

    this.editProduct = true
    this.logoPreview = product?.imageFront
    this.errors = []
    this.formArticle.patchValue({
      category: product?.category?.id,
      subCategory: product?.subCategory?.id,
      name: product?.name,
      barCode: product?.code,
      size: product?.size,
      color: product?.color,
      warningQty: product?.quantityWarning,
      sellPrice: convertAmount(product?.sell_price)
    })
  }


  resetFormProduct() {
    this.clearTable()
    this.searchTermCat = ''
    this.searchTermSubCat = ''
    this.titleModal = "Enregistrer un produit"
    this.logoPreview = ''
    this.selectSize = 0
    this.selected_sizes = []
    this.all_sizes = all_sizes
    this.editProduct = false
    this.errors = []
    this.formArticle.patchValue({
      category: "Choisir...",
      subCategory: "Choisir...",
      name: '',
      barCode: '',
      size: 0,
      color: 'Choisir...',
      image: '',
      warningQty: 0,
    })
  }

  onLogoChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.formArticle.patchValue({
          image: {
            name: file.name,
            file: reader.result
          }
        })
      };
    }
  }

  selectedSizesBasedName() {
    this.selected_sizes = this.all_sizes.find((size: any) => size?.name === this.selectSize)?.sizes
    this.formArticle.patchValue({
      size: 0,
    })
  }

  getSize(siz: string) {
    const foundItem = all_sizes
      .flatMap(category => category.sizes.map(size => ({ category: category.name, ...size })))
      .find(size => size.value === siz);
    // to return category, we need to print : foundItem?.category
    return foundItem?.name
  }

  getColor(color: string) {
    return this.all_colors.find((colo: any) => colo?.value === color)?.name

  }


  clearTable() {
    this.list_categories = []
    this.list_subCategories = []
  }


  generateRandom8DigitNumber() {
    const min = 10000000; // Smallest 8-digit number (10^7)
    const max = 99999999; // Largest 8-digit number (10^8 - 1)
    this.formArticle.patchValue({
      barCode: Math.floor(Math.random() * (max - min + 1)) + min
    })
  }

  trackByProductId(index: number, product: any): number {
    return product?.id; // or any unique field
  }


}
