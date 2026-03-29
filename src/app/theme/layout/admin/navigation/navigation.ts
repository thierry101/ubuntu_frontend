/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  roles?: any;
  permissions?: any;
  all_permissions?: any;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  accessAdminWh?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'setting',
    title: 'Paramètres',
    type: 'item',
    roles: ['Admin'],
    classes: 'nav-item',
    url: '/settings',
    icon: 'ti ti-settings'
  },
  {
    id: 'default',
    title: 'Tableau de bord',
    permissions: ['handle_dashboard'],
    roles: ['Admin', 'Daf'],
    type: 'item',
    classes: 'nav-item',
    url: '/dashboard',
    icon: 'ti ti-dashboard',
    breadcrumbs: false
  },
  {
    id: 'analytics',
    title: 'Prévision I.A',
    roles: ['Admin'],
    type: 'item',
    classes: 'nav-item',
    url: '/analytics',
    icon: 'ti ti-chart-line',
    breadcrumbs: false
  },
  {
    id: 'users-permissions',
    title: 'Utilisateurs et accès',
    roles: ['Admin'],
    permissions: ['handle_users'],
    url: '/home-users-permissions',
    type: 'item',
    classes: 'nav-item',
    icon: 'ti ti-users'
  },
  {
    id: 'home_prod',
    title: 'Gestion des articles',
    roles: ['Admin'],
    permissions: ['handle_provider', 'handle_categories', 'handle_products'],
    url: '/home-product',
    type: 'item',
    classes: 'nav-item',
    icon: 'ti ti-package'
  },
  {
    id: 'statistics',
    roles: ['Admin'],
    title: 'Entrepôt/boutique',
    permissions: ['handle_stores_wh'],
    type: 'item',
    classes: 'nav-item',
    url: '/handle-store-warehouse',
    icon: 'ti ti-building-warehouse'
  },
  {
    id: 'handle_stock',
    title: 'Gestion des stocks',
    roles: ['Admin', 'siteAdmin', 'Agent', 'Agency',],
    permissions: ['watch_stock', 'handle_stock', 'handle_trash', 'historik_transfert', 'watch_trash_prod'],
    type: 'item',
    classes: 'nav-item',
    url: '/home-stock',
    icon: 'ti ti-stack'
  },
  {
    id: 'invoice_in',
    title: 'Saisir une facture',
    roles: ['siteAdmin'], //on doit trouver le moyen dé vérifier que l'admin appartienne à un entrepôt
    type: 'item',
    accessAdminWh: true, //aide à vérifier pour donner accès à l'admin qui est dans un entrepôt
    classes: 'nav-item',
    url: '/input-invoice',
    icon: 'ti ti-file-invoice'
  },
  {
    id: 'home_clients_promo',
    roles: ['Admin'],
    permissions: ['handle_clients', 'handle_promotion', 'handle_discount_client'],
    title: 'Clients & promotions',
    type: 'item',
    classes: 'nav-item',
    url: '/home-client-promotion',
    icon: 'ti ti-discount'
  },
  {
    id: 'home_finance',
    roles: ['Admin', 'siteAdmin', 'Daf', 'Agent', 'Agency',],
    permissions: ['view_supplier_debts', 'handle_expenses', 'handle_proforma'],
    title: 'Finances',
    type: 'item',
    classes: 'nav-item',
    url: '/home-finance',
    icon: 'ti ti-coin'
  },
  {
    id: 'home_ecommerce',
    roles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller'],
    permissions: ['handle_ecommerce'],
    title: 'E-commerce',
    type: 'item',
    classes: 'nav-item',
    url: '/home-ecommerce',
    icon: 'ti ti-coin'
  },
  {
    id: 'application',
    roles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller'],
    title: 'Application',
    type: 'group',
    icon: 'ti ti-apps',
    children: [
      {
        id: 'histSeller',
        roles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller', 'Daf'],
        title: 'Historique des ventes',
        type: 'item',
        classes: 'nav-item',
        url: '/sales-history',
        icon: 'ti ti-history'
      }
    ]
  },
  {
    id: 'audit_log',
    title: 'Audit log',
    roles: ['Admin', 'Administrateur'],
    type: 'item',
    classes: 'nav-item',
    url: '/audit-log',
    icon: 'ti ti-shield-lock'
  },

  // About partner
  {
    id: 'partner_setting',
    title: 'Paramètres',
    roles: ['Partner'],
    type: 'item',
    classes: 'nav-item',
    url: '/space-partner',
    icon: 'ti ti-settings'
  },
  {
    id: 'comission',
    title: 'Mes commissions',
    roles: ['Partner'],
    type: 'item',
    classes: 'nav-item',
    url: '/list-commission',
    icon: 'ti ti-settings'
  },

  // About the super admin
  {
    id: 'global_setting',
    title: 'Paramètres',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/global-setting',
    icon: 'ti ti-settings'
  },
    {
    id: 'country_city',
    title: 'Pays-Villes',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/upload-country-city',
    icon: 'ti ti-settings'
  },
  {
    id: 'list_partners',
    title: 'Partenaires',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/list-all-partners',
    icon: 'ti ti-users'
  },
  {
    id: 'list_enterprises',
    title: 'Entreprises',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/list-all-enterprises',
    icon: 'ti ti-building'
  },
  {
    id: 'list_invoices_client',
    title: 'Factures entreprise',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/all-invoices-enterprises',
    icon: 'ti ti-building'
  },
  {
    id: 'pay_partner',
    title: 'Payer partenaire',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/payment-partner',
    icon: 'ti ti-building'
  },
  {
    id: 'list_faq',
    title: 'FAQ',
    roles: ['big_root'],
    type: 'item',
    classes: 'nav-item',
    url: '/list-all-enterprisese', //edit-faq
    icon: 'ti ti-building'
  }
];

