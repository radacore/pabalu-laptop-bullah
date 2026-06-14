export type MasterData = {
    id: number;
    name: string;
    slug?: string;
    color?: string | null;
    is_active?: boolean;
    sort_order?: number | null;
    description?: string | null;
};

export type Brand = MasterData;
export type Category = MasterData;
export type LaptopSource = MasterData;
export type LaptopStatus = MasterData;
export type ServiceStatus = MasterData;
export type PaymentMethod = MasterData;
export type SparepartType = MasterData;
export type TransactionCategory = MasterData & {
    type?: 'income' | 'expense';
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type User = {
    id: number;
    name: string;
    email?: string;
};

export type LaptopSpecification = {
    id?: number;
    laptop_id?: number;
    processor?: string | null;
    ram?: string | null;
    storage?: string | null;
    display?: string | null;
    graphics?: string | null;
    operating_system?: string | null;
    battery?: string | null;
    condition?: string | null;
    other_specifications?: string | null;
};

export type LaptopPhoto = {
    id: number;
    laptop_id?: number;
    file_path: string;
    caption?: string | null;
    sort_order?: number;
};

export type Laptop = {
    id: number;
    sku: string;
    name?: string | null;
    brand: string;
    model: string;
    laptop_source_id?: number | null;
    laptop_status_id?: number | null;
    purchase_date?: string | null;
    cost_price: number | string;
    selling_price: number | string;
    repair_cost?: number | string | null;
    additional_cost?: number | string | null;
    mines?: string | null;
    description?: string | null;
    internal_note?: string | null;
    sold_at?: string | null;
    status?: LaptopStatus | null;
    source?: LaptopSource | null;
    specification?: LaptopSpecification | null;
    photos?: LaptopPhoto[];
};

export type Customer = {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
};

export type Service = {
    id: number;
    service_code: string;
    customer_id?: number;
    customer?: Customer | null;
    device_name?: string | null;
    brand?: string | null;
    model?: string | null;
    serial_number?: string | null;
    kelengkapan?: string | null;
    complaint?: string | null;
    initial_condition?: string | null;
    estimated_cost?: number | null;
    final_cost?: number | null;
    estimated_completion_date?: string | null;
    service_status_id?: number | null;
    status?: ServiceStatus | null;
    tracking_code?: string;
    payment_status?: string;
    received_at: string;
    completed_at?: string | null;
    picked_up_at?: string | null;
    parts?: ServicePart[];
};

export type ServicePart = {
    id: number;
    service_id?: number;
    kind?: 'used' | 'sold';
    sparepart_type_id?: number | null;
    name?: string;
    part_name?: string | null;
    quantity: number;
    cost_price?: number | string | null;
    price?: number;
    unit_price?: number | null;
    total_price?: number | null;
    selling_price?: number | null;
    installation_fee?: number | null;
    note?: string | null;
    type?: SparepartType | null;
};

export type ServiceUpdate = {
    id: number;
    service_id?: number;
    title?: string | null;
    note?: string | null;
    description?: string | null;
    status_to?: string | null;
    new_status?: string | null;
    status?: ServiceStatus | null;
    created_at: string;
};

export type FinancialTransaction = {
    id: number;
    transaction_code: string;
    transaction_category_id?: number | null;
    payment_method_id?: number | null;
    amount: number;
    type: 'income' | 'expense';
    description?: string | null;
    transaction_date: string;
    related_type?: string | null;
    related_id?: number | null;
    created_by: number;
    category?: TransactionCategory | null;
    paymentMethod?: PaymentMethod | null;
};

export type DashboardStats = {
    total_laptops_available: number;
    total_laptops_sold: number;
    total_laptops_this_month: number;
    total_active_services: number;
    total_completed_services: number;
    total_income_this_month: number;
    total_expense_this_month: number;
};

export type WebsiteSetting = {
    id: number;
    website_name: string;
    tagline?: string | null;
    logo?: string | null;
    logo_url?: string | null;
    address?: string | null;
    whatsapp_number?: string | null;
    phone?: string | null;
    email?: string | null;
    operational_hours_weekday?: string | null;
    operational_hours_weekend?: string | null;
    google_maps_embed?: string | null;
    footer_description?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    updated_by?: number | null;
    updated_at?: string;
};
