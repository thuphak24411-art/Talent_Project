/**
 * data.js - Dữ liệu cho Sustainable Fashion Ecommerce System
 */

// Danh sách sản phẩm
const PRODUCTS = [
    { id: 1, name: 'Recycled Denim Jacket', price: 899000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', material: 'Recycled Cotton 85%', origin: 'Vietnam', certificate: 'GRS Certified', carbon: '2.3 kg', recycledRate: 85, score: 92, category: 'Jacket', stock: 15 },
    { id: 2, name: 'Organic Cotton Hoodie', price: 699000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', material: '100% Organic Cotton', origin: 'India', certificate: 'GOTS', carbon: '3.1 kg', recycledRate: 0, score: 88, category: 'Hoodie', stock: 20 },
    { id: 3, name: 'Eco-Friendly Sneakers', price: 1199000, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', material: 'Recycled Rubber', origin: 'Portugal', certificate: 'BCorp', carbon: '1.8 kg', recycledRate: 70, score: 94, category: 'Shoes', stock: 10 },
    { id: 4, name: 'Second-hand Wool Coat', price: 499000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', material: 'Wool Blend', origin: 'Italy', certificate: 'Vintage', carbon: '1.1 kg', recycledRate: 70, score: 90, category: 'Coat', stock: 5 },
    { id: 5, name: 'Bamboo Fiber T-Shirt', price: 399000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', material: 'Bamboo 100%', origin: 'China', certificate: 'OEKO-TEX', carbon: '0.9 kg', recycledRate: 0, score: 85, category: 'Shirt', stock: 30 },
    { id: 6, name: 'Recycled Polyester Backpack', price: 599000, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', material: 'Recycled PET', origin: 'Vietnam', certificate: 'GRS', carbon: '1.5 kg', recycledRate: 95, score: 96, category: 'Accessory', stock: 12 }
];

// Người dùng mặc định
const DEFAULT_USERS = [
    { id: 'U001', username: 'demo', password: 'demo123', fullname: 'Nguyễn Văn A', email: 'demo@greenthread.com', phone: '0901234567', address: '123 Đường Xanh, Quận 1, TP.HCM', avatar: 'images/avatar.png', ecoPoints: 2450, joinDate: '2024-01-15', tier: 'Gold Member' }
];

// Export cho môi trường browser
if (typeof window !== 'undefined') {
    window.PRODUCTS_DATA = PRODUCTS;
    window.DEFAULT_USERS_DATA = DEFAULT_USERS;
}