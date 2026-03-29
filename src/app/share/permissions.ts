export const list_permissions = [
   {
      "name": "Gestion des utilisateurs",
      "value": "handle_users",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des clients",
      "value": "handle_clients",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des catégories et sous-catégories",
      "value": "handle_categories",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des boutiques et entrepôts",
      "value": "handle_stores_wh",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des fournisseurs",
      "value": "handle_provider",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des articles",
      "value": "handle_products",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Valider les stocks",
      "value": "handle_stock",
      rights: ["read", "edit"]
   },
   {
      "name": "Valider les articles en corbeille",
      "value": "handle_trash",
      rights: ["read", "edit"]
   },
   {
      "name": "Créer des promotions",
      "value": "handle_promotion",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Créer coupons client",
      "value": "handle_discount_client",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Voir l'historique des transferts",
      "value": "historik_transfert",
      rights: ["read"]
   },
   {
      "name": "Visualiser les stocks",
      "value": "watch_stock",
      rights: ["read"]
   },
   {
      "name": "Visualiser le tableau de bord",
      "value": "handle_dashboard",
      rights: ["read"]
   },
   {
      "name": "Gestion les dettes fournisseurs",
      "value": "view_supplier_debts",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion des dépenses",
      "value": "handle_expenses",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Gestion de proforma",
      "value": "handle_proforma",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Supprimer ses propres factures",
      "value": "delete_own_invoice",
      rights: ["read", "delete"]
   },
   {
      "name": "Supprimer mes transfert",
      "value": "delete_own_transfert",
      rights: ["read", "delete"]
   },
   {
      "name": "Supprimer les stocks",
      "value": "delete_own_stock",
      rights: ["read", "delete"]
   },
   {
      "name": "Consulter les factures d'avoir",
      "value": "watch_credit_invoice",
      rights: ["read"]
   },
   {
      "name": "Consulter les articles en rébu",
      "value": "watch_trash_prod",
      rights: ["read"]
   },
   {
      "name": "Configurer le catalogue",
      "value": "handle_ecommerce",
      rights: ["read", "create", "edit", "delete"]
   },
   {
      "name": "Ajuster les stocks",
      "value": "adjust_stock",
      rights: ["read", "create"]
   },
   {
      "name": "Consulter tous les ajustements de stocks",
      "value": "view_adjustments_stock",
      rights: ["read"]
   },
   {
      "name": "Gérer les publucités",
      "value": "handle_advertising",
      rights: ["read", "create"]
   },
]
