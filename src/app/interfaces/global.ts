/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoginUser {
  email: string;
  password: string
}

export interface Category {
  id: number;
  name: string;
}

export interface ItemsValidation {
  id: number;
  enterprise: Enterprise;
  items: any[];
  fromWhStore: Warehouse
  toWhStore: Warehouse
  transfertNber: string
  status: string
  validateAll: boolean
  created_at: any;
  updated_at: any;
}

export interface Warehouse {
  id: number;
  nameWh: string;
  typeWh: string;
  phoneWh: string;
  localisation: string;
  invoiceIndice: string,
  noteCreditIndice: string,
  transferIndice: string,
  lotIndice: string,
  collectTva: false,
  devise: any,
  editSoldPrice: boolean,
  makeGift: boolean,
  getCreditNote: boolean,
  rateTva: number,
  checked: boolean,
  wholeSale: boolean,
  configDaysWork: boolean,
  swapping: boolean
}

export interface CommandsCatalog {
  id: number,
  listItems: CartProducts[],
  warehouse: Warehouse,
  client: Client,
  nber_command: string,
  status_command: boolean,
  total_command: number,
  delivery: string,
  fee_delivery: number,
  tracking_status: number,
  city: string,
}

export interface Expensive {
  id: number;
  name: string
}

export interface CountryPayment {
  id: number;
  country: string,
  type_payment: string,
  account_nber: string,
}

export interface SaveExpensive {
  id: number
  expense: Expensive
  amount: number
  warehouse: Warehouse
  description: number
  attachement: string
  dateExpense: string
  updated_at: string
}

export interface Orders {
  id: number;
  user: User;
  enterprise: Enterprise,
  warehouse: Warehouse;
  client: Client;
  nberInvoice: string;
  listItems: CartProducts;
  typeOrder: string;
  detailsPayment: string;
  devise: string;
  amountToPay: number;
  reduction: number;
  amount_paid: number;
  amount_remaining: number;
  total_refunded: number;
  reduction_credit_note: number;
  amount_without_reduction: number;
  new_order_amount: number;
  totalTva: number;
  totalCart: number;
  created_at: number;
  amount_tva: number;
  statusPayment:boolean
}

export interface CartProducts {
  id: number;
  user: User
  product: Product
  quantity: number
  sold_price: number
  total_price: number
  amount_tva: number
  confirm: boolean
  created_at: string
  updated: string
  size: any,
  color: any,
}

export interface CreditNoteItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
}


export interface CreditNote {
  id: number;
  original_invoice: Orders;
  enterprise: Enterprise;
  warehouse: Warehouse;
  client: Client;
  credit_number: string;
  reason: string;
  refunded_items: CreditNoteItem[];
  subtotal: number;
  total_tva: number;
  total_refund: number;
  is_total_refund: boolean;
}

export interface Provider {
  id: number;
  name: string,
  code: string,
  email: string,
  phone: string,
  website: string,
  country: string,
  city: string,
  address: string,
  id_country: number,
}

export interface Promotion {
  id: number;
  enterprise: Enterprise,
  name: string,
  product: StockMvt,
  warehouseShop: Warehouse,
  percentage: number
}

export interface Discount {
  id: number;
  client: Client,
  codeDiscount: string,
  typeDiscount: string,
  percentage: number,
  amtDiscount: number,
  expDate: string,
}

export interface Client {
  id: number;
  name: string,
  email: string,
  phone: string,
}

export interface SubCategory {
  id: number;
  name: string;
  category: Category;
}

export interface TypeReward {
  id: number;
  typeReward: string;
  periodReward: string;
  amount_reward: number;
  nber_cmdes: number;
  rewardTypeClient: string
  amount_discount: number
  percentage_discount: number
}

export interface Product {
  id: number;
  enterprise: Enterprise;
  category: Category;
  subCategory: SubCategory;
  name: string;
  imageFront: string;
  quantity: number;
  total_quantity: number,
  quantityWarning: number;
  sell_price: number;
  amountCmp: number;
  code: string;
  size: string;
  color: string;
}

export interface Catalog {
  id: number;
  article: Product;
  colors: [];
  sizes: [];
  showProduct: boolean;
  othersImgs: [];
  description: string;
  selectSize: string;
  sell_price: number;
  is_sold: boolean;
  percentag_sold: number;
  sold_price: number
}

export interface InvoiceDue {
  id: number;
  invoice_number: string;
  type_payment: any,
  total_amount: number;
  amount_to_pay: string;
  status_payment: string;
  percentage: number;
  month_invoice: number;
  year_invoice: number;
  end_date_to_pay: string;
  file_payment: string;
  rejetReason: string;
}

export interface Partner {
  id: number;
  name: string,
  surname: string,
  email: string,
  country: string,
  city: string
  phone: string,
  code_promo: string,
  type_reduction: string,
  percentage: number,
  amountReduction: number,
  statut: number,
  percentage_negociate: number,
  percentage_reduction: number,
  reasonRejection: string,
  phone_mobile_money: string;
  amount_reduction: string;
  timing_applying: string;
  set_by_us: boolean
}

export interface SettingCatalog {
  id: number;
  banner: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
  enable_promotion: boolean;
  random_affect: boolean;
  text_promotion: string,
  bg_color: string,
  bar_color: string,
  nber_items: number,
  whatsapp_msg: string
}


export interface Enterprise {
  id: number;
  nameEtprise: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  devise: string;
  itemNber: number;
  nberWhatsappMsg: number;
  backgroundColor: string;
  url_site: string;
  logo: string;
  signaturePreview: string;
  state_setting: boolean;
  grantAgencyToSell: boolean;
  yesWhSecond: boolean;
  stockVerif: boolean;
  wholeSale: boolean;
  allowWhatsapp: boolean;
  expiredProd: boolean;
  defective: boolean;
  signature: string;
  rccm: string;
  niu: string;
}

export interface ProductWhStore {
  id: number;
  stockWhStore: StockMvt,
  quantity: number,
  sellPrice: number,
  discount: number
  warningStock: number
  created_at: string
}

export interface MovementStock {
  user: User
  product: Product
  from_provider: Provider
  from_warehouse: Warehouse
  to_warehouse: Warehouse
  indiceStock: string
  quantity: number
  move_type: string
  notes: string
  created_at: string
}

export interface OpenHour {
  day: string;
  label: string;
  active: string;
  start_time: string;
  end_time: string;
}

export interface AuditLog {
  id: number;
  user: User,
  enterprise: Enterprise,
  path: string,
  method: string,
  remote_address: string,
  payload: string,
  user_agent: string,
  message: string,
  timestamp: string,
  status_code: number
}

export interface User {
  id: number;
  whStore: Warehouse;
  enterprise: Enterprise;
  email: string;
  name: string;
  surname: string;
  phone: string;
  role: string;
  image: string;
  is_verified: boolean;
  acceptTerms: boolean;
  is_active: boolean;
  // Add other properties if you have them (e.g., name, username)
}

export interface Permission {
  id: number;
  user: User;
  content_type: string;         // permission category/type
  permission_type: string[];    // ['create', 'edit', 'delete'] etc.
  // Add other properties if any
}

export interface PermissionDefinition {
  name: string;
  value: string;
}

export interface globalInterface {
  name: string;
  value: string;
}

export interface AdminSetting {
  id: number;
  name: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  logo: string;
  rccm: string;
  niu: string;
  item_per_page: number;
  state_setting: boolean;
  partner_percentag: number;
  site_url: string,
  indice_invoice: string,
  tracking_url: string,
  digit_length: number,
  simple_whatsapp: number,
  pub_whatsapp: number,
}

export interface Provider {
  id: number;
  enterprise: Enterprise;
  name: string;
  provider_code: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  city: string;
  address: string;
  category: string;
  status: boolean
  payment_terms: string;
  documents: string;
  notes: string;
}

export interface StockMvt {
  id: number;
  enterprise: Enterprise;
  warehouse: Warehouse;
  product: Product;
  provider: Provider;
  quantity: number;
  sellPrice: number;
  indiceStock: string;
  purchase_price: number;
  validStock: boolean;
  created_at: any;
  expDate: any;
}


export interface AdjustStock {
  id: number;
  enterprise: Enterprise;
  warehouse: Warehouse;
  product: Product;
  provider: Provider;
  quantity: number;
  sellPrice: number;
  lotWhStock: StockMvt;
  adjustmentType: number; // 0 for addition, 1 for subtraction
  created_at: any;
  expDate: any;
}

export interface TrashProd {
  id: number;
  warehouse: Warehouse;
  product: Product;
  provider: Provider;
  quantity: number;
  sellPrice: number;
  indiceStock: string;
  purchase_price: number;
  confirm: boolean;
  created_at: any;
  expDate: any;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page?: number;
  page_size?: number | null;
  num_pages?: number | null;
}

export interface PaginationState<T> {
  listItems: T[];
  nberItems: number;
  nextPage: string | null;
  previousPage: string | null;
  currentPage?: number;
  page_size?: number | null;
  nber_pages?: number | null;
}

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}


