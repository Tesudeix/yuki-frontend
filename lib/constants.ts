export const PHONE_REGEX = /^\+\d{9,15}$/;

export const PASSWORD_MIN_LENGTH = 6;

// Superadmin phone; entering 8-digit local (e.g., 94641031) normalizes to +97694641031
export const ADMIN_PHONE = (process.env.NEXT_PUBLIC_ADMIN_PHONE || "+97694641031").trim();

export const TOKEN_STORAGE_KEY = "yuki.auth.token";
export const USER_STORAGE_KEY = "yuki.auth.user";
export const ADMIN_TOKEN_STORAGE_KEY = "yuki.auth.adminToken";
export const ADMIN_PROFILE_STORAGE_KEY = "yuki.auth.adminProfile";

// Marketplace product categories
export const PRODUCT_CATEGORIES = [
  "Хоол",
  "Хүнс",
  "Бөөнний түгээлт",
  "Урьдчилсан захиалга",
  "Кофе амттан",
  "Алкохол",
  "Гэр ахуй & хүүхэд",
  "Эргэнэтэд үйлдвэрлэв",
  "Бэлэг & гоо сайхан",
  "Гадаад захиалга",
] as const;
