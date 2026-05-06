/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal from "sweetalert2"
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export function invalidSelectValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === '0' ? { invalidSelect: true } : null;
}

export const isMobileApp = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';

export function formatPriceFr(value: string | number): number {
  if (typeof value === 'string') {
    // Supprime les espaces, remplace la virgule par un point
    value = value.replace(/\s/g, '').replace(',', '.');
  }

  const parsed = parseFloat(String(value));

  if (isNaN(parsed)) return 0;

  return Math.round(parsed); // ou Math.floor si tu veux toujours arrondir vers le bas
}


export function getRoleName(value: string): string | undefined {
  const role = roles.find((r) => r.value === value);
  return role?.name;
}


export function convertAmount(value: any): number { //45000,00 to 45000
  return Number(value.replace(',', '.')) | 0;
}


export function swalWithRedirect(icon: any, title: string, message: string, path: any, required: boolean) {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    allowOutsideClick: required,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Ok!"
  }).then((result) => {
    if (result.isConfirmed) {
      path
    }
  });
}

export function SwallModal(icons: any, title: string, message: string) {
  Swal.fire({
    icon: icons,
    title: title,
    text: message,
    // footer: '<a href="">Why do I have this issue?</a>'
  })
}

export function toastShow(icon: any, message: string) {
  Toast.fire({
    icon: icon,
    title: message
  })
}


export function swalWithApprobation(icon: any, title: string, message: string, confirmButtonText: string, cancelButtonText: string, doSomething: any) {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText
  }).then((result) => {
    if (result.isConfirmed) {
      doSomething
    }
  });
}


const messages: Record<number, [string, string, string]> = {
  404: ['error', 'Introuvable', 'Ressource non trouvée'],
  409: ['warning', 'Conflit', 'Cette ressource existe déjà'],
  413: ['error', 'Fichier trop volumineux', 'Réduisez la taille du fichier'],
  415: ['error', 'Format non supporté', 'Type de fichier invalide'],
  422: ['warning', 'Données invalides', 'Vérifiez les champs saisis'],
  500: ['error', 'Erreur serveur', 'Veuillez contacter l’administrateur'],
  502: ['error', 'Serveur indisponible', 'Veuillez réessayer'],
  503: ['error', 'Service indisponible', 'Réessayez plus tard'],
  504: ['error', 'Temps dépassé', 'Le serveur met trop de temps à répondre']
};

export function showError(
  error: any,
  status: any,
  table: string[],
  allErrors: any,
  idModalToClose?: HTMLElement | null
) {
  // Cas particulier 400
  if (error && status == 400) {
    table = allErrors;
    return;
  }

  // Cas 403 spécifique (droits)
  else if (status == 403) {
    if (idModalToClose) {
      idModalToClose.click(); // fermer le modal
    }

    SwallModal(
      'warning',
      'Action non autorisée',
      "Vous n'avez pas les droits nécessaires, contactez l'administrateur"
    );
    return;
  }

  // Cas généraux basés sur le mapping
  const msg = messages[status] || messages[0];

  SwallModal(msg[0], msg[1], msg[2]);
}


export function setPagination(
  callService: (page: number, searchTerm: any, startDate?: any, endDate?: any) => Observable<any>,
  page: number = 1,
  searchTerm: any,
  setState: (...args: any[]) => void,
  startDate?: any,
  endDate?: any,
  onError?: (error: any) => void
): Subscription {
  return callService(page, searchTerm, startDate, endDate).subscribe({
    next: (data: any) => {
      setState({
        listItems: data?.results,
        nberItems: data?.count,
        nextPage: data?.next,
        previousPage: data?.previous,
        currentPage: data?.page,
        page_size: data?.page_size,
        nber_pages: data?.num_pages,
        editSoldPrice: data?.editSoldPrice,
        devise: data?.devise,
        total_commission: data?.total_commission,
        total_commission_paid: data?.total_commission_paid,
        totals: data?.totals,
      });
    },
    error: (err: any) => {
      onError?.(err); // call optional handler
    }
  });
}

export function setPaginationStockMvt(
  callService: (page: number, searchTerm: any, startDate?: any, endDate?: any, typeOfMvt?: any, whStore?: any) => Observable<any>,
  page: number = 1,
  searchTerm: any,
  setState: (...args: any[]) => void,
  startDate?: any,
  endDate?: any,
  typeOfMvt?: any,
  whStore?: any,
  onError?: (error: any) => void
): Subscription {
  return callService(page, searchTerm, startDate, endDate, typeOfMvt, whStore).subscribe({
    next: (data: any) => {
      setState({
        listItems: data?.results,
        nberItems: data?.count,
        nextPage: data?.next,
        previousPage: data?.previous,
        currentPage: data?.page,
        page_size: data?.page_size,
        total_bad_quantity: data?.total_bad_quantity,
        total_expired_quantity: data?.total_expired_quantity,
        total_gift_quantity: data?.total_gift_quantity,
        total_sell_quantity: data?.total_sell_quantity,
        total_lost_quantity: data?.total_lost_quantity,
        standby_quantity: data?.standby_quantity,
        nber_pages: data?.num_pages,
        editSoldPrice: data?.editSoldPrice
      });
    },
    error: (err: any) => {
      onError?.(err); // call optional handler
    }
  });
}


export function setPaginationForInvoice(
  callService: (page: number, searchTerm: any, selectWhShop: number, startDate?: string, endDate?: string, payment?: string) => Observable<any>,
  page: number = 1,
  searchTerm: any,
  selectWhShop: number,
  setState: (data: {
    listItems: any[], nberItems: number, nextPage: string | null, previousPage: string | null, currentPage: number,
    page_size: number | null, nber_pages: number | null | null, amount_collect_day: number | null,
    amount_collect_day_tva: number | null, amount_collect_startDate: number | null, amount_collect_rangeDate: number | null
  }) => void,
  startDate?: string,
  endDate?: string,
  payment?: string
): Subscription {
  return callService(page, searchTerm, selectWhShop, startDate, endDate, payment).subscribe((data: any) => {
    setState({
      listItems: data?.results,
      nberItems: data?.count,
      nextPage: data?.next,
      previousPage: data?.previous,
      currentPage: data?.page,
      page_size: data?.page_size,
      nber_pages: data?.num_pages,
      amount_collect_day: data?.amount_collect_day,
      amount_collect_day_tva: data?.amount_collect_day_tva,
      amount_collect_startDate: data?.amount_collect_startDate,
      amount_collect_rangeDate: data?.amount_collect_rangeDate,
    });
  });
}


export function setPaginationMultiParams(
  callService: (page: number, searchTerm: any, selectWhShop: number, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any,) => Observable<any>,
  page: number = 1,
  searchTerm: any,
  selectWhShop: number,
  setState: (data: {
    listItems: any[], nberItems: number, nextPage: string | null, previousPage: string | null, currentPage: number,
    page_size: number | null, nber_pages: number | null | null, amount_collect_day: number | null,
    amount_collect_day_tva: number | null, amount_collect_startDate: number | null, amount_collect_rangeDate: number | null,
  }) => void,
  param1?: any,
  param2?: any,
  param3?: any,
  param4?: any,
  param5?: any,
): Subscription {
  return callService(page, searchTerm, selectWhShop, param1, param2, param3, param4, param5).subscribe((data: any) => {
    setState({
      listItems: data?.results,
      nberItems: data?.count,
      nextPage: data?.next,
      previousPage: data?.previous,
      currentPage: data?.page,
      page_size: data?.page_size,
      nber_pages: data?.num_pages,
      amount_collect_day: data?.amount_collect_day,
      amount_collect_day_tva: data?.amount_collect_day_tva,
      amount_collect_startDate: data?.amount_collect_startDate,
      amount_collect_rangeDate: data?.amount_collect_rangeDate,
    });
  });
}


export function slugifyTest(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                 // sépare les accents
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-z0-9\s-]/g, '')    // supprime caractères spéciaux
    .trim()
    .replace(/\s+/g, '-');           // espaces → -
}


export function loadOtherImg(tabImgs: any, newTabImg: any, url: string) {
  newTabImg = []
  for (const img in tabImgs) {
    newTabImg.push({ 'file': url + tabImgs[img]?.file })
  }
  return newTabImg
}

export function parseItem(item: any) {
  if (item) {
    return JSON.parse(item)
  }
}

export function generateComplexPassword(length: number = 8): string {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters.');
  }

  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const mandatorySpecials = '$@#';
  const additionalSpecials = '!%^&*()-_=+[]{}|;:,.<>?';
  const allSpecials = mandatorySpecials + additionalSpecials;
  const all = upper + lower + digits + allSpecials;

  // Ensure one character from each required category
  const password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    mandatorySpecials[Math.floor(Math.random() * mandatorySpecials.length)]
  ];

  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle to randomize character positions
  return password.sort(() => Math.random() - 0.5).join('');
}

export function getDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


//********************** Scan bar code  son **********************
export function playBeep() {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(940, context.currentTime);
  gainNode.gain.setValueAtTime(0.3, context.currentTime);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.1); // ← 1 milliseconde exactement
}


export const otherRoles = [
  {
    "name": "Super Administrateur",
    "value": "big_root"
  },
  {
    "name": "Partenaire",
    "value": "Partner"
  },
]


export const servicesProvided = [
  {
    "name": "Message WhatsApp", "value": "whatsapp_msg"
  },
  {
    "name": "Message WhatsApp publicitaire", "value": "whatsapp_msg_pub"
  },
  {
    "name": "Abonnement mensuel", "value": "abonnement"
  }
]


export const roles = [
  {
    "name": "Administrateur",
    "value": "Admin"
  },
  {
    "name": "Responsable entrepôt principal",
    "value": "siteAdmin"
  },
  {
    "name": "Responsable entrepôt secondaire",
    "value": "Agent"
  },
  {
    "name": "Directeur financier",
    "value": "Daf"
  },
  {
    "name": "Responsable boutique",
    "value": "Agency"
  },
  {
    "name": "Caissièr(e)",
    "value": "Seller"
  },
]

export const typesPayment = [
  {
    "name": "Espèce",
    "value": "cash"
  },
  {
    "name": "Wave",
    "value": "wave"
  },
  {
    "name": "MoMo",
    "value": "momo"
  },
  {
    "name": "Moov Money",
    "value": "moov"
  },
  {
    "name": "Orange Money",
    "value": "orange"
  },
  {
    "name": "Carte Bancaire",
    "value": "cart"
  },
]

export const adminTypesPayment = [
  {
    "name": "Wave",
    "value": "wave"
  },
  {
    "name": "MoMo",
    "value": "momo"
  },
  {
    "name": "Moov Money",
    "value": "moov"
  },
  {
    "name": "Orange Money",
    "value": "orange"
  },
  {
    "name": "Carte Bancaire",
    "value": "cart"
  },
]

export const workflowCommand = [{ name: 'En attente de prise en compte', value: 0 }, { name: 'préparation de la commande', value: 1 },
{ name: 'commande en cours de livraison', value: 2 }, { name: 'commande livrée', value: 3 }]

export const itermsNber = [1, 2, 10, 20, 30, 40, 50]
export const typeSales = [{ "name": "vente", 'value': 'sell' }, { "name": "Don", 'value': 'gift' }, { "name": "Troc", 'value': 'exchange' }]
export const typesWarehouses = [{ "name": "Principal", "value": "Principal" }, { "name": "Annexe", "value": "Secondaire" }, { "name": "Boutique", "value": "Boutique" }]
export const states = ["A faire", "En attente de paiement", "Payée", "Livrée"]
export const devises = [{ "name": "XOF", "value": 'XOF' }, { "name": "FCFA", "value": 'FCFA' },
{ "name": "GNF", "value": 'GNF' }, { "name": "Naira", "value": 'Naira' }]
export const BasesReward = [{ name: "Nombre de commandes", value: "nberCmdes" }, { name: "Montant total d'achat", value: "amntBuy" }]
export const PeriodsReward = [{ name: "Semaine", value: "week" }, { name: "Mois", value: "month" }, { name: "Trimestre", value: "quarter" },
{ name: "Semestre", value: "half" }, { name: "Annuel", value: 'year' }, { name: 'Non défini', value: 'un_defined' }]
export const typeRwsClient = [{ name: 'Montant', value: 'amt' }, { name: 'Pourcentage', value: 'percentage' }]


export const allCountries = [
  {
    "name": "Cameroun",
    "value": "Cameroun"
  },
  {
    "name": "Sénégal",
    "value": "Sénégal"
  },
  {
    "name": "Gabon",
    "value": "Gabon"
  },
  {
    "name": "Cote D'Ivoire",
    "value": "Cote D'Ivoire"
  },
  {
    "name": "République Démocratique du congo",
    "value": "République Démocratique du congo"
  },
  {
    "name": "Tchad",
    "value": "Tchad"
  },
  {
    "name": "Burkina Faso",
    "value": "Burkina Faso"
  },
  {
    "name": "Mali",
    "value": "Mali"
  },
  {
    "name": "Togo",
    "value": "Togo"
  }
]

