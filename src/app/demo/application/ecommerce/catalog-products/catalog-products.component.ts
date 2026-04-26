/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { Catalog, Product } from 'src/app/interfaces/global';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { all_colors } from 'src/app/share/colors';
import { all_sizes } from 'src/app/share/sizes';
import { QuillModule } from 'ngx-quill';
import { CatalogService } from 'src/app/services/catalog.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { PublicService } from 'src/app/services/public.service';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import Swal from 'sweetalert2';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";

@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [SharedModule, SelectedComponent, ImagePipe, NgSelectModule, QuillModule, SpinnersComponent, SetPaginationComponent, SubmitSpinnerComponent, SearchListComponent],
  templateUrl: './catalog-products.component.html',
  styleUrl: './catalog-products.component.scss'
})
export class CatalogProductsComponent implements OnInit {

  searchTerm: string = '';
  devise: string = ''
  titleModal: string = '';
  isActive: string = '';
  editProduct = false;
  all_products: Product[] = [];
  all_catalogs: Catalog[] = [];
  errors: any = [];
  productDetail: any = { // For product selection
    reference: '',
    image: ''
  };
  all_colors!: any
  all_sizes!: any
  selected_sizes: any[] = []
  previewUrl: string | ArrayBuffer | null = null;
  multiplePreviewUrls: string[] = [];
  isLoading: boolean = false
  editCatalog: boolean = false
  itemToEdit!: Catalog
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  formCatalog!: FormGroup
  isSaving: boolean = false
  searchTermCatalog: string = ''

  constructor(private fb: FormBuilder, private catalogService: CatalogService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
    this.fetchCatalogs(1)
    this.all_colors = all_colors
    this.all_sizes = all_sizes
    this.formCatalog = this.fb.group({
      product: 0,
      sellPrice: 0,
      isSold: false,
      percentagSold: 0,
      amountSold: 0,
      mainImg: '',
      colors: [],
      c_sizes: [],
      otherImgs: [],
      description: '',
      stateProd: true,
      selectSize: 0
    })
  }


  resetFormCatalog() {
    this.titleModal = "Créer un catalogue"
    this.searchTerm = ''
    this.previewUrl = ''
    this.editCatalog = false
    this.multiplePreviewUrls = []
    this.clickOutsideModal()
    this.errors = []
    this.formCatalog = this.fb.group({
      product: 0,
      mainImg: '',
      sellPrice: 0,
      isSold: false,
      percentagSold: 0,
      amountSold: 0,
      colors: [],
      c_sizes: [],
      otherImgs: [],
      description: '',
      selectSize: 0,
      stateProd: true
    })
  }

  fetchCatalogs(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.catalogService.getAllCatalogs.bind(this.catalogService), page, this.searchTermCatalog, (data: any) => {
      this.pagination = data;
      this.all_catalogs = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  onPageChange(page: number) {
    this.fetchCatalogs(page);
  }

  onSearchChangeStock(term: string) {
    this.searchTermCatalog = term;
    this.fetchCatalogs(1);
  }

  // Product search/selection
  fetchProducts(page: number = 1) {
    this.catalogService.getAllProductsEcommerce(page, this.searchTerm).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
    if (!term) {
      this.productDetail = { reference: '', image: '' };
      this.formCatalog.patchValue({ // Set form values based on selected product to send in backend
        product: 0,
        reference: ''
      });
    }
  }

  saveProduct() {
    this.isSaving = true
    const btnClose = document.getElementById('closeModalCatlog003')
    this.catalogService.postCatalog(this.formCatalog?.value).subscribe({
      next: (res: { result: Catalog }) => {
        this.isSaving = false
        this.all_catalogs?.unshift(res?.result)
        this.errors = []
        btnClose?.click()
        toastShow("success", "✅ Aricle créé")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, btnClose);
      }
    })
  }


  checkSoldPrice() {
    this.calculSoldPrice()
  }


  calculSoldPrice() {
    const sellPrice = this.formCatalog.get('sellPrice')?.value || 0;
    const percentageSold = this.formCatalog.get('percentagSold')?.value || 0;
    if (this.formCatalog.get('isSold')) {
      this.formCatalog.patchValue({
        amountSold: Math.round(sellPrice - ((sellPrice * percentageSold) / 100))
      })
    }
  }

  saveEditProduct() {
    this.isSaving = true
    const btnClose = document.getElementById('closeModalCatlog003')
    const data = { checker: 'editCatalogProd', data: this.formCatalog?.value }
    this.catalogService.putCatalog(data, this.itemToEdit?.id).subscribe({
      next: (res: { result: Catalog }) => {
        this.all_catalogs = this.all_catalogs.filter((prod: any) => prod.id !== this.itemToEdit?.id)
        this.all_catalogs?.unshift(res?.result)
        this.isSaving = false
        btnClose?.click()
        toastShow("success", "✅ Aricle Modifié")
      },
      error: (err) => {
        this.errors = [];
        this.isSaving = false
        this.errors = err.error.errors;
        this.isLoading = false
        showError(err, err.status, this.errors, err.error, btnClose);
      }
    })
  }

  changeStatut(event: any, idCatalog: number) {
    // const btnClose = document.getElementById('closeModalCatlog003')
    const isActive = event.target.checked;
    const data = {
      checker: 'activeProd',
      data: isActive
    }
    this.catalogService.putCatalog(data, idCatalog).subscribe({
      next: () => {
        toastShow("success", "✅ Aricle Modifié")
      }
    })
  }

  fillModal(product: Catalog) {
    this.all_products = []
    this.errors = []
    this.itemToEdit = product
    this.editCatalog = true
    let colorsValue: any;
    this.titleModal = "Modifier le catalogue"
    this.catalogService.getCatalog(product?.id).subscribe({
      next: (res: { result: Catalog }) => {
        const tResult = res?.result
        this.searchTerm = tResult?.article?.name
        this.previewUrl = tResult?.article?.imageFront
        this.multiplePreviewUrls = tResult?.othersImgs

        if (Array.isArray(tResult?.colors) && tResult.colors.some(c => typeof c === 'object')) {
          // Si c'est un tableau d'objets → on récupère juste les noms
          colorsValue = tResult.colors.map((c: any) => c?.name);
        } else {
          // Si c'est déjà un tableau de strings (ou vide)
          colorsValue = tResult?.colors || [];
        }
        const selectedCategory = this.all_sizes?.find((siz: any) => siz?.name === tResult?.selectSize);
        this.selected_sizes = selectedCategory?.sizes || [];
        this.formCatalog.patchValue({
          product: tResult?.article?.id || 0,
          otherImgs: this.multiplePreviewUrls || [],
          colors: colorsValue,
          c_sizes: tResult?.sizes || [],
          description: tResult?.description || '',
          selectSize: tResult?.selectSize || 0,
          stateProd: tResult?.showProduct,
          sellPrice: tResult?.sell_price,
          isSold: tResult?.is_sold,
          percentagSold: tResult?.percentag_sold,
          amountSold: tResult?.sold_price
        })
      }
    })
  }

  deleteProduct(product: Catalog) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer ce coupon!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result: any) => {
      if (result?.isConfirmed) {
        this.catalogService.deleteCatalog(product?.id).subscribe({
          next: () => {
            this.all_catalogs = this.all_catalogs.filter((catalog: Catalog) => catalog?.id !== product?.id);
            toastShow('success', "✅ Article supprimé avec succès");
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCatlog003'));
          }
        });
      }
    });
  }


  selectProduct(produ: Product): void {
    if (produ?.name && produ?.name !== this.searchTerm) {
      this.searchTerm = produ?.name;
      this.previewUrl = produ?.imageFront
      this.productDetail = { // Set product details for display to user
        reference: produ?.code,
        image: produ?.imageFront
      };
      this.formCatalog.patchValue({ // Set form values based on selected product to send in backend
        product: produ?.id,
        sellPrice: Math.trunc(produ?.sell_price ?? 0)
      });
    }
  }


  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.previewUrl = reader.result ?? null; // ✅ ensures no 'undefined' value
        this.formCatalog.patchValue({
          mainImg: this.previewUrl
        })
      };
      reader.readAsDataURL(file);
    }
  }


  selectedSizesBasedName() {
    const selectCat = this.formCatalog?.get('selectSize')?.value;
    const selectedCategory = this.all_sizes?.find((siz: any) => siz?.name === selectCat);
    this.selected_sizes = selectedCategory?.sizes || [];
    this.formCatalog.patchValue({
      c_sizes: [],
    });
  }


  onMultipleImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    // Keep existing images, just append new ones
    const newFiles = Array.from(input.files);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.multiplePreviewUrls.push(e.target.result);
        this.formCatalog.patchValue({
          otherImgs: this.multiplePreviewUrls
        })
      };
      reader.readAsDataURL(file);
    });

    // 🔹 Reset input value so that selecting the same file again will still trigger 'change'
    input.value = '';
  }


  removePreviewImage(index: number): void {
    this.multiplePreviewUrls.splice(index, 1);
  }

  clickOutsideModal() {
    this.all_products = [];
  }

  trackByProductId(index: number, product: any): number {
    return product?.id; // or any unique field
  }

}
