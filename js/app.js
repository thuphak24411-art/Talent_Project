/**
 * app.js - Sustainable Fashion Ecommerce System
 * Version 21.2 - Sửa lỗi thanh bar và sự kiện
 */

// ==================== 1. KHỞI TẠO DỮ LIỆU ====================

const DATA_API_BASE = 'http://localhost:3000/api';
const productEntryState = { uploadedImages: Array(8).fill(null) };

function normalizeProductRecord(product, index = 0, category = null) {
    if (!product) {
        return null;
    }

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const priceFromVariants = variants.length > 0 ? Number(variants[0].price) || 0 : 0;
    const price = Number(product.price ?? product.Price ?? priceFromVariants) || 0;

    return {
        id: product.id ?? index + 1,
        productID: product.productID || `PR${String(index + 1).padStart(6, '0')}`,
        name: product.name || product.productName || '',
        productName: product.productName || product.name || '',
        price,
        image: product.image || null,
        material: product.material || '',
        origin: product.origin || '',
        certificate: product.certificate || product.certification || '',
        certification: product.certification || product.certificate || '',
        blockchainQR: product.blockchainQR || '',
        description: product.description || '',
        carbon: product.carbon || (product.carbonFootprint !== undefined && product.carbonFootprint !== null ? String(product.carbonFootprint) : ''),
        carbonFootprint: product.carbonFootprint !== undefined ? Number(product.carbonFootprint) : null,
        recycledRate: Number(product.recycledRate ?? product.recycled_ratio ?? 0) || 0,
        recycled_ratio: Number(product.recycled_ratio ?? product.recycledRate ?? 0) || 0,
        score: Number(product.score ?? 0) || 0,
        stock: Number(product.stock ?? variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)) || 0,
        variants,
        brandID: product.brandID || '',
        categoryId: category?.CateID || product.CateID || null,
        categoryName: category?.CateName || product.CateName || null
    };
}

function flattenProducts(source) {
    if (!Array.isArray(source)) {
        return [];
    }

    if (source.some(item => item && Array.isArray(item.products))) {
        const flattened = [];

        source.forEach(category => {
            const products = Array.isArray(category.products) ? category.products : [];

            products.forEach(product => {
                const normalized = normalizeProductRecord(product, flattened.length, category);
                if (normalized) {
                    flattened.push(normalized);
                }
            });
        });

        return flattened;
    }

    return source.map((product, index) => normalizeProductRecord(product, index)).filter(Boolean);
}

function normalizeUserRecord(user, role = 'customer', index = 0) {
    if (!user) {
        return null;
    }

    const username = user.username || user.userName || '';
    const fullname = user.fullname || user.fullName || user.brandName || user.recyclerName || '';
    const id = user.id || user.customerID || user.brandID || user.recyclerID || `U${String(index + 1).padStart(6, '0')}`;
    const inferredRole = user.brandID ? 'brand' : user.recyclerID ? 'recycler' : role;

    return {
        id,
        customerID: user.customerID || (inferredRole === 'customer' ? id : null),
        brandID: user.brandID || (inferredRole === 'brand' ? id : null),
        recyclerID: user.recyclerID || (inferredRole === 'recycler' ? id : null),
        username,
        userName: username,
        password: user.password || user.passwords || '',
        passwords: user.passwords || user.password || '',
        fullname,
        fullName: fullname,
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        address: user.address || '',
        avatar: user.avatar || 'images/avatar.png',
        ecoPoints: Number(user.ecoPoints ?? user.eco_point ?? 0) || 0,
        eco_point: Number(user.eco_point ?? user.ecoPoints ?? 0) || 0,
        joinDate: user.joinDate || user.join_date || '',
        join_date: user.join_date || user.joinDate || '',
        tier: user.tier || 'Bronze Member',
        bank_name: user.bank_name || '',
        bank_account: user.bank_account || '',
        tax_code: user.tax_code || user['tax code'] || '',
        legal_rep: user.legal_rep || user.legalRep || '',
        role: inferredRole
    };
}

function flattenUsers(source) {
    if (!Array.isArray(source)) {
        return [];
    }

    if (source.some(item => item && (item.customers || item.brands || item.recyclers))) {
        const flattened = [];

        source.forEach(group => {
            const role = Array.isArray(group.brands) ? 'brand' : Array.isArray(group.recyclers) ? 'recycler' : 'customer';
            const records = group.customers || group.brands || group.recyclers || [];

            records.forEach(record => {
                const normalized = normalizeUserRecord(record, role, flattened.length);
                if (normalized) {
                    flattened.push(normalized);
                }
            });
        });

        return flattened;
    }

    return source.map((user, index) => normalizeUserRecord(user, user?.role || 'customer', index)).filter(Boolean);
}

function normalizeOrderRecord(order, index = 0, customerId = null) {
    if (!order) {
        return null;
    }

    const products = Array.isArray(order.products)
        ? order.products.map((product, productIndex) => ({
            id: product.id || product.productID || productIndex + 1,
            productID: product.productID || product.id || null,
            name: product.name || product.productName || '',
            productName: product.productName || product.name || '',
            price: Number(product.price ?? product.Price ?? 0) || 0,
            quantity: Number(product.quantity ?? 1) || 1,
            size: product.size || '',
            image: product.image || null,
            variants: Array.isArray(product.variants) ? product.variants : []
        }))
        : [];

    return {
        orderId: order.orderId || order.orderID || `ORD${String(index + 1).padStart(6, '0')}`,
        orderID: order.orderID || order.orderId || `ORD${String(index + 1).padStart(6, '0')}`,
        invoiceNumber: order.invoiceNumber || '',
        userId: order.userId || customerId || order.customerID || '',
        customerID: order.customerID || customerId || order.userId || '',
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        shippingAddress: order.shippingAddress || '',
        products,
        subtotal: Number(order.subtotal ?? 0) || 0,
        shippingFee: Number(order.shippingFee ?? 0) || 0,
        tax: Number(order.tax ?? 0) || 0,
        amount: Number(order.amount ?? order.total ?? 0) || 0,
        total: Number(order.total ?? order.amount ?? 0) || 0,
        paymentMethod: order.paymentMethod || '',
        status: order.status || '',
        date: order.date || '',
        ecoPointsEarned: Number(order.ecoPointsEarned ?? 0) || 0
    };
}

function flattenOrders(source) {
    if (!Array.isArray(source)) {
        return [];
    }

    if (source.some(item => item && Array.isArray(item.orders))) {
        const flattened = [];

        source.forEach(group => {
            const customerId = group.customerID || group.userId || '';
            const orders = Array.isArray(group.orders) ? group.orders : [];

            orders.forEach(order => {
                const normalized = normalizeOrderRecord(order, flattened.length, customerId);
                if (normalized) {
                    flattened.push(normalized);
                }
            });
        });

        return flattened;
    }

    return source.map((order, index) => normalizeOrderRecord(order, index)).filter(Boolean);
}

async function loadBootstrapData() {
    const response = await fetch(`${DATA_API_BASE}/bootstrap`);
    if (!response.ok) {
        throw new Error(`Bootstrap request failed: ${response.status}`);
    }

    return response.json();
}

function initFallbackData() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([
            { id: 1, name: 'Recycled Denim Jacket', price: 899000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', material: 'Recycled Cotton 85%', origin: 'Vietnam', certificate: 'GRS Certified', carbon: '2.3 kg', recycledRate: 85, score: 92, stock: 15 },
            { id: 2, name: 'Organic Cotton Hoodie', price: 699000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', material: '100% Organic Cotton', origin: 'India', certificate: 'GOTS', carbon: '3.1 kg', recycledRate: 0, score: 88, stock: 20 }
        ]));
    }

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { id: 'CM000001', username: 'demo', password: 'demo123', fullname: 'Nguyễn Văn A', email: 'demo@greenthread.com', phone: '0901234567', address: '123 Đường Xanh, Quận 1, TP.HCM', avatar: 'images/avatar.png', ecoPoints: 2450, joinDate: '2024-01-15', tier: 'Gold Member', role: 'customer' }
        ]));
    }

    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }

    if (!localStorage.getItem('recycleHistory')) {
        localStorage.setItem('recycleHistory', JSON.stringify([
            { id: 'R001', userId: 'CM000001', productName: 'Old Cotton Shirt', recycledAt: '2024-02-10', pointsEarned: 200, status: 'Completed' }
        ]));
    }

    if (!localStorage.getItem('usedProductsPurchased')) {
        localStorage.setItem('usedProductsPurchased', JSON.stringify([
            { id: 'UP001', userId: 'CM000001', productName: 'Pre-owned Nike Shoes', amount: 1, price: 500000, purchasedAt: '2024-01-10' }
        ]));
    }

    if (!localStorage.getItem('cartItems')) localStorage.setItem('cartItems', JSON.stringify([]));
    if (!sessionStorage.getItem('currentUser')) sessionStorage.setItem('currentUser', JSON.stringify(null));
    if (!localStorage.getItem('currentOrder')) localStorage.setItem('currentOrder', JSON.stringify(null));
    if (!localStorage.getItem('buyNowProduct')) localStorage.setItem('buyNowProduct', JSON.stringify(null));
    if (!localStorage.getItem('checkoutItems')) localStorage.setItem('checkoutItems', JSON.stringify([]));
    if (!localStorage.getItem('invoicePDFData')) localStorage.setItem('invoicePDFData', JSON.stringify(null));
}

async function initData() {
    try {
        const bootstrap = await loadBootstrapData();

        localStorage.setItem('products', JSON.stringify(flattenProducts(bootstrap.products || [])));
        localStorage.setItem('users', JSON.stringify(flattenUsers(bootstrap.users || [])));
        localStorage.setItem('orders', JSON.stringify(flattenOrders(bootstrap.orders || [])));
    } catch (error) {
        console.warn('Không tải được dữ liệu từ server, dùng dữ liệu dự phòng.', error);
        initFallbackData();
        localStorage.setItem('products', JSON.stringify(flattenProducts(JSON.parse(localStorage.getItem('products')) || [])));
        localStorage.setItem('users', JSON.stringify(flattenUsers(JSON.parse(localStorage.getItem('users')) || [])));
        localStorage.setItem('orders', JSON.stringify(flattenOrders(JSON.parse(localStorage.getItem('orders')) || [])));
    }

    if (!localStorage.getItem('cartItems')) localStorage.setItem('cartItems', JSON.stringify([]));
    if (!sessionStorage.getItem('currentUser')) sessionStorage.setItem('currentUser', JSON.stringify(null));
    if (!localStorage.getItem('currentOrder')) localStorage.setItem('currentOrder', JSON.stringify(null));
    if (!localStorage.getItem('buyNowProduct')) localStorage.setItem('buyNowProduct', JSON.stringify(null));
    if (!localStorage.getItem('checkoutItems')) localStorage.setItem('checkoutItems', JSON.stringify([]));
    if (!localStorage.getItem('invoicePDFData')) localStorage.setItem('invoicePDFData', JSON.stringify(null));
}

function getProducts() {
    return flattenProducts(JSON.parse(localStorage.getItem('products')) || []);
}

function getUsers() {
    return flattenUsers(JSON.parse(localStorage.getItem('users')) || []);
}

function getOrders() {
    return flattenOrders(JSON.parse(localStorage.getItem('orders')) || []);
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!currentUser) {
        return null;
    }

    const role = currentUser.role || (currentUser.brandID ? 'brand' : currentUser.recyclerID ? 'recycler' : 'customer');
    const resolvedId = currentUser.id || currentUser.customerID || currentUser.brandID || currentUser.recyclerID || null;
    const resolvedCustomerID = currentUser.customerID || (role === 'customer' ? resolvedId : null);
    const resolvedBrandID = currentUser.brandID || (role === 'brand' ? resolvedId : null);
    const resolvedRecyclerID = currentUser.recyclerID || (role === 'recycler' ? resolvedId : null);

    return {
        id: resolvedId,
        customerID: resolvedCustomerID,
        brandID: resolvedBrandID,
        recyclerID: resolvedRecyclerID,
        username: currentUser.username || currentUser.userName || '',
        userName: currentUser.userName || currentUser.username || '',
        fullname: currentUser.fullname || currentUser.fullName || '',
        fullName: currentUser.fullName || currentUser.fullname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.phoneNumber || '',
        phoneNumber: currentUser.phoneNumber || currentUser.phone || '',
        address: currentUser.address || '',
        bank_name: currentUser.bank_name || '',
        bank_account: currentUser.bank_account || '',
        tax_code: currentUser.tax_code || '',
        legal_rep: currentUser.legal_rep || '',
        ecoPoints: Number(currentUser.ecoPoints ?? currentUser.eco_point ?? 0) || 0,
        eco_point: Number(currentUser.eco_point ?? currentUser.ecoPoints ?? 0) || 0,
        joinDate: currentUser.joinDate || currentUser.join_date || '',
        join_date: currentUser.join_date || currentUser.joinDate || '',
        tier: currentUser.tier || 'Bronze Member',
        role
    };
}

// ==================== 2. HÀM KIỂM TRA ĐĂNG NHẬP ====================

function isLoggedIn() {
    const currentUser = getCurrentUser();
    return currentUser !== null && currentUser.id !== undefined;
}

function requireLogin() {
    if (!isLoggedIn()) {
        showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'warning');
        return false;
    }
    return true;
}

function redirectToHomepage() {
    if (isLoggedIn()) {
        window.location.href = 'user.html';
    } else {
        window.location.href = 'homePage.html';
    }
}

function checkProtectedPageAccess() {
    const pageName = window.location.pathname.split('/').pop() || 'homePage.html';
    const protectedPages = ['cart.html', 'buynow.html', 'myprofile.html', 'invoice.html', 'invoicepdf.html'];
    
    if (protectedPages.includes(pageName) && !isLoggedIn()) {
        showToast('Vui lòng đăng nhập để truy cập trang này!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return false;
    }

    if (pageName === 'admin_dashboard.html') {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            showToast('Vui lòng đăng nhập bằng tài khoản admin để truy cập', 'warning');
            setTimeout(() => {
                window.location.href = 'login_admin.html';
            }, 1000);
            return false;
        }
    }

    return true;
}

// ==================== 3. UTILITY FUNCTIONS ====================

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
}

function generateId(prefix = '') {
    return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: #2A4D39; color: white; padding: 12px 24px;
            border-radius: 40px; z-index: 100000; font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: opacity 0.3s;
            white-space: nowrap; font-weight: 500;
            z-index: 999999;
        `;
        document.body.appendChild(toast);
    }
    toast.style.backgroundColor = type === 'error' ? '#c0392b' : type === 'warning' ? '#e67e22' : '#2A4D39';
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function closeAllDropdowns() {
    const menuDropdown = document.getElementById('menuDropdown');
    const notiDropdown = document.getElementById('notificationDropdown');
    const filterDropdown = document.getElementById('filterDropdown');
    if (menuDropdown) menuDropdown.style.display = 'none';
    if (notiDropdown) notiDropdown.style.display = 'none';
    if (filterDropdown) filterDropdown.style.display = 'none';
}

// ==================== 4. DROPDOWN MENU ====================

function createMenuDropdown() {
    const oldMenu = document.getElementById('menuDropdown');
    if (oldMenu) oldMenu.remove();
    
    const menuDropdown = document.createElement('div');
    menuDropdown.id = 'menuDropdown';
    menuDropdown.style.cssText = `
        position: absolute; top: 55px; left: 20px;
        background: white; border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        width: 250px; z-index: 100001; display: none;
        overflow: hidden;
    `;
    
    const isLoggedInStatus = isLoggedIn();
    
    let menuHTML = `
        <a href="#" id="menuHomeLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-home" style="width: 25px;"></i> Homepage
        </a>
        <a href="#" id="menuProfileLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-user" style="width: 25px;"></i> My Profile
        </a>
        <a href="#" id="menuOrdersLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-shopping-bag" style="width: 25px;"></i> My Orders
        </a>
        <a href="#" id="menuCartLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-shopping-cart" style="width: 25px;"></i> Cart
        </a>
        <a href="#" id="menuLanguageLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-globe" style="width: 25px;"></i> Language
        </a>
        <a href="#" id="menuSupportLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <i class="fas fa-headset" style="width: 25px;"></i> Support
        </a>
    `;
    
    if (isLoggedInStatus) {
        menuHTML += `
            <a href="#" id="menuLogoutLink" style="display: block; padding: 14px 20px; text-decoration: none; color: #c0392b; border-top: 1px solid #eee; transition: background 0.2s;">
                <i class="fas fa-sign-out-alt" style="width: 25px;"></i> Logout
            </a>
        `;
    }
    
    menuDropdown.innerHTML = menuHTML;
    
    const links = menuDropdown.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => { link.style.background = '#f5f5f5'; });
        link.addEventListener('mouseleave', () => { link.style.background = 'white'; });
    });
    
    document.body.appendChild(menuDropdown);
    return menuDropdown;
}

function toggleMenu() {
    let menuDropdown = document.getElementById('menuDropdown');
    if (!menuDropdown) menuDropdown = createMenuDropdown();
    
    if (menuDropdown.style.display === 'block') {
        menuDropdown.style.display = 'none';
    } else {
        closeAllDropdowns();
        menuDropdown.style.display = 'block';
    }
}

// ==================== 5. NOTIFICATION DROPDOWN ====================

function createNotificationDropdown() {
    const oldNoti = document.getElementById('notificationDropdown');
    if (oldNoti) oldNoti.remove();
    
    const notiDropdown = document.createElement('div');
    notiDropdown.id = 'notificationDropdown';
    notiDropdown.style.cssText = `
        position: absolute; top: 55px; right: 120px;
        background: white; border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        width: 320px; z-index: 100001; display: none;
        max-height: 400px; overflow-y: auto;
    `;
    notiDropdown.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: bold; background: #f9f9f9;">
            <i class="fas fa-bell"></i> Thông báo
        </div>
        <div class="noti-item" style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; gap: 12px;">
                <i class="fas fa-check-circle" style="color: #27ae60; font-size: 20px;"></i>
                <div>
                    <strong>Order Payment Successful</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Đơn hàng của bạn đã thanh toán thành công</p>
                    <span style="font-size: 11px; color: #999;">2 phút trước</span>
                </div>
            </div>
        </div>
        <div class="noti-item" style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; gap: 12px;">
                <i class="fas fa-ticket-alt" style="color: #f39c12; font-size: 20px;"></i>
                <div>
                    <strong>Voucher Available</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Mã GREEN20 giảm 20% cho đơn hàng 500k</p>
                    <span style="font-size: 11px; color: #999;">1 giờ trước</span>
                </div>
            </div>
        </div>
        <div class="noti-item" style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; gap: 12px;">
                <i class="fas fa-truck" style="color: #3498db; font-size: 20px;"></i>
                <div>
                    <strong>Shipping Update</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Đơn hàng của bạn đang được giao</p>
                    <span style="font-size: 11px; color: #999;">3 giờ trước</span>
                </div>
            </div>
        </div>
        <div class="noti-item" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; gap: 12px;">
                <i class="fas fa-fire" style="color: #e67e22; font-size: 20px;"></i>
                <div>
                    <strong>New Promotion</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Mua 2 tặng 1 sản phẩm tái chế</p>
                    <span style="font-size: 11px; color: #999;">Hôm qua</span>
                </div>
            </div>
        </div>
    `;
    
    const notiItems = notiDropdown.querySelectorAll('.noti-item');
    notiItems.forEach(item => {
        item.addEventListener('mouseenter', () => { item.style.background = '#f9f9f9'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'white'; });
        item.addEventListener('click', () => {
            showToast('Đã đọc thông báo', 'info');
            notiDropdown.style.display = 'none';
        });
    });
    
    document.body.appendChild(notiDropdown);
    return notiDropdown;
}

function toggleNotification() {
    let notiDropdown = document.getElementById('notificationDropdown');
    if (!notiDropdown) notiDropdown = createNotificationDropdown();
    
    if (notiDropdown.style.display === 'block') {
        notiDropdown.style.display = 'none';
    } else {
        closeAllDropdowns();
        notiDropdown.style.display = 'block';
    }
}

// ==================== 6. FILTER DROPDOWN ====================

function createFilterDropdown() {
    const oldFilter = document.getElementById('filterDropdown');
    if (oldFilter) oldFilter.remove();
    
    const filterDropdown = document.createElement('div');
    filterDropdown.id = 'filterDropdown';
    filterDropdown.style.cssText = `
        position: absolute; top: 55px; right: 70px;
        background: white; border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        width: 240px; z-index: 100001; display: none;
    `;
    filterDropdown.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: bold; background: #f9f9f9;">
            <i class="fas fa-filter"></i> Filter by Sustainability
        </div>
        <label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <input type="checkbox" value="Recycled"> ♻️ Recycled Material
        </label>
        <label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <input type="checkbox" value="Organic"> 🌱 Organic
        </label>
        <label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;">
            <input type="checkbox" value="Low Carbon"> 🌍 Low Carbon
        </label>
        <label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.2s;">
            <input type="checkbox" value="Circular"> 🔄 Circular
        </label>
        <div style="padding: 12px 16px; border-top: 1px solid #eee; background: #f9f9f9;">
            <button onclick="applyFilterAndClose()" style="width: 100%; background: #2A4D39; color: white; padding: 8px; border: none; border-radius: 8px; cursor: pointer;">Áp dụng</button>
        </div>
    `;
    
    const labels = filterDropdown.querySelectorAll('label');
    labels.forEach(label => {
        label.addEventListener('mouseenter', () => { label.style.background = '#f5f5f5'; });
        label.addEventListener('mouseleave', () => { label.style.background = 'white'; });
    });
    
    document.body.appendChild(filterDropdown);
    return filterDropdown;
}

function toggleFilter() {
    let filterDropdown = document.getElementById('filterDropdown');
    if (!filterDropdown) filterDropdown = createFilterDropdown();
    
    if (filterDropdown.style.display === 'block') {
        filterDropdown.style.display = 'none';
    } else {
        closeAllDropdowns();
        filterDropdown.style.display = 'block';
    }
}

function applyFilterAndClose() {
    const checkboxes = document.querySelectorAll('#filterDropdown input[type="checkbox"]');
    const selected = [];
    checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
    
    if (selected.length > 0) {
        showToast('Đã lọc theo: ' + selected.join(', '), 'success');
    } else {
        showToast('Đã xóa bộ lọc', 'info');
    }
    
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) filterDropdown.style.display = 'none';
}

// ==================== 7. AUTHENTICATION ====================
async function loginUser(username, password) {

    if (!username || !password) {
        showToast('Vui lòng nhập tên đăng nhập và mật khẩu', 'error');
        return false;
    }

    const findUser = (usersList) => {
        return (usersList || []).find(
            u =>
                (u.userName === username || u.username === username) &&
                (u.passwords === password || u.password === password)
        );
    };

    try {
        const response = await fetch(`${DATA_API_BASE}/customers`);
        const data = await response.json();

        const users = data.customers || data.users || getUsers();
        const user = findUser(users);

        if (!user) {
            showToast('Sai tên đăng nhập hoặc mật khẩu', 'error');
            return false;
        }

        const currentUser = {
            id: user.customerID || user.brandID || user.recyclerID || user.id,
            username: user.userName || user.username,
            fullname: user.fullName || user.fullname || user.brandName || user.recyclerName || '',
            email: user.email || '',
            phone: user.phoneNumber || user.phone || '',
            address: user.address || '',
            bank_name: user.bank_name || '',
            bank_account: user.bank_account || '',
            tax_code: user.tax_code || '',
            legal_rep: user.legal_rep || user.legalRep || '',
            ecoPoints: Number(user.eco_point ?? user.ecoPoints ?? 0) || 0,
            joinDate: user.join_date || user.joinDate || '',
            tier: user.tier || 'Bronze Member',
            role: user.role || (user.brandID ? 'brand' : user.recyclerID ? 'recycler' : 'customer')
        };

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        showToast(`Chào mừng ${currentUser.fullname} trở lại!`, 'success');

        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }

        let redirectUrl = 'homePage.html';

        switch (currentUser.role) {
            case 'brand':
                redirectUrl = 'brandprofile.html';
                break;
            case 'recycler':
                redirectUrl = 'recyclerprofile.html';
                break;
            default:
                redirectUrl = 'homePage.html';
        }

        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 800);

        return true;
    } catch (error) {
        console.error(error);

        const fallbackUser = findUser(getUsers());
        if (fallbackUser) {
            const currentUser = {
                id: fallbackUser.customerID || fallbackUser.brandID || fallbackUser.recyclerID || fallbackUser.id,
                username: fallbackUser.userName || fallbackUser.username,
                fullname: fallbackUser.fullName || fallbackUser.fullname || fallbackUser.brandName || fallbackUser.recyclerName || '',
                email: fallbackUser.email || '',
                phone: fallbackUser.phoneNumber || fallbackUser.phone || '',
                address: fallbackUser.address || '',
                bank_name: fallbackUser.bank_name || '',
                bank_account: fallbackUser.bank_account || '',
                tax_code: fallbackUser.tax_code || '',
                legal_rep: fallbackUser.legal_rep || fallbackUser.legalRep || '',
                ecoPoints: Number(fallbackUser.eco_point ?? fallbackUser.ecoPoints ?? 0) || 0,
                joinDate: fallbackUser.join_date || fallbackUser.joinDate || '',
                tier: fallbackUser.tier || 'Bronze Member',
                role: fallbackUser.role || (fallbackUser.brandID ? 'brand' : fallbackUser.recyclerID ? 'recycler' : 'customer')
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`Chào mừng ${currentUser.fullname} trở lại! (dữ liệu cục bộ)`, 'success');

            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }

            setTimeout(() => {
                window.location.href = currentUser.role === 'brand' ? 'brandprofile.html' : currentUser.role === 'recycler' ? 'recyclerprofile.html' : 'homePage.html';
            }, 800);
            return true;
        }

        showToast('Không thể kết nối tới server', 'error');
        return false;
    }

}

async function registerCustomer(
    fullname,
    username,
    email,
    phone,
    password,
    confirmpassword,
    role = 'customer') 
    {

    if (!fullname || !username || !email || !phone || !password || !confirmpassword) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return false;
    }

    if (password !== confirmpassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return false;
    }

    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showToast('Email không hợp lệ', 'error');
        return false;
    }

    const fallbackRegister = () => {
        const users = getUsers();
        const id = `CM${String(users.filter(user => !user.brandID && !user.recyclerID).length + 1).padStart(6, '0')}`;
        const newUser = {
            username,
            userName: username,
            password,
            passwords: password,
            fullname,
            fullName: fullname,
            email,
            phone,
            phoneNumber: phone,
            address: '',
            avatar: 'images/avatar.png',
            eco_point: 0,
            joinDate: new Date().toISOString().split('T')[0],
            join_date: new Date().toISOString().split('T')[0],
            tier: 'Bronze Member'
        };

        users.push(newUser);
        saveUsers(users);
        return newUser;
    };

    try {

        const response = await fetch(
            'http://localhost:3000/api/customers/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname,
                    username,
                    email,
                    phone,
                    password
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            showToast(
                data.message || 'Đăng ký thất bại',
                'error'
            );
            return false;
        }

        console.log('✅ Đã lưu vào user.json:', data.customer);

        showToast(
            'Đăng ký thành công! Vui lòng đăng nhập.',
            'success'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return true;

    } catch (error) {

        console.error('Lỗi đăng ký:', error);

        fallbackRegister();

        showToast(
            'Không kết nối được server, đã lưu tạm trên trình duyệt.',
            'warning'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return false;
    }
    }

// ==================== ĐĂNG KÝ BRAND (FIX) ====================
async function registerBrand(
    brandname,
    username,
    brandemail,
    brandphone,
    brandaddress,
    bankname,
    bankaccount,
    taxcode,
    legalrep,
    password,
    confirmpassword,
    role = 'brand'
) {

    if (!brandname || !username || !brandemail || !brandphone ||
        !brandaddress || !bankname || !bankaccount ||
        !taxcode || !legalrep || !password || !confirmpassword) {

        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return false;
    }

    if (password !== confirmpassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return false;
    }

    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return false;
    }

    if (!brandemail.includes('@') || !brandemail.includes('.')) {
        showToast('Email không hợp lệ', 'error');
        return false;
    }

    const fallbackRegister = () => {
        const users = getUsers();
        const id = `BR${String(users.filter(user => user.brandID).length + 1).padStart(6, '0')}`;
        const newBrand = {
            username,
            userName: username,
            password,
            passwords: password,
            fullname: brandname,
            fullName: brandname,
            email: brandemail,
            phone: brandphone,
            phoneNumber: brandphone,
            address: brandaddress,
            bank_name: bankname,
            bank_account: bankaccount,
            tax_code: taxcode,
            legal_rep: legalrep,
            joinDate: new Date().toISOString().split('T')[0],
            join_date: new Date().toISOString().split('T')[0],
        };

        users.push(newBrand);
        saveUsers(users);
        return newBrand;
    };

    try {
        // ✅ FIX: Gửi đúng field name theo server.js
        const response = await fetch(
            'http://localhost:3000/api/customers/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: role,
                    username: username,
                    password: password,
                    brandname: brandname,
                    brandemail: brandemail,
                    brandphone: brandphone,
                    brandaddress: brandaddress,
                    bankname: bankname,
                    bankaccount: bankaccount,
                    taxcode: taxcode,
                    legalrep: legalrep
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Đăng ký thất bại', 'error');
            return false;
        }

        console.log('✅ Brand đã được lưu:', data);

        showToast(
            'Đăng ký thương hiệu thành công! Vui lòng đăng nhập.',
            'success'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return true;

    } catch (error) {
        console.error('Lỗi đăng ký brand:', error);

        fallbackRegister();

        showToast(
            'Không kết nối được server, đã lưu tạm trên trình duyệt.',
            'warning'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return false;
    }
}

async function registerRecycler(
    recyclername,
    username,
    recycleremail,
    recyclerphone,
    recycleraddress,
    bankname,
    bankaccount,
    taxcode,
    legalrep,
    password,
    confirmpassword,
    role = 'recycler'
) {

    if (!recyclername || !username || !recycleremail ||
        !recyclerphone || !recycleraddress ||
        !bankname || !bankaccount ||
        !taxcode || !legalrep ||
        !password || !confirmpassword) {

        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return false;
    }

    if (password !== confirmpassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return false;
    }

    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return false;
    }

    if (!recycleremail.includes('@') || !recycleremail.includes('.')) {
        showToast('Email không hợp lệ', 'error');
        return false;
    }

    const fallbackRegister = () => {
        const users = getUsers();
        const id = `RC${String(users.filter(user => user.recyclerID).length + 1).padStart(6, '0')}`;
        const newRecycler = {
            id,
            recyclerID: id,
            username,
            userName: username,
            password,
            passwords: password,
            fullname: recyclername,
            fullName: recyclername,
            email: recycleremail,
            phone: recyclerphone,
            phoneNumber: recyclerphone,
            address: recycleraddress,
            bank_name: bankname,
            bank_account: bankaccount,
            tax_code: taxcode,
            legal_rep: legalrep,
            joinDate: new Date().toISOString().split('T')[0],
            join_date: new Date().toISOString().split('T')[0],
        };

        users.push(newRecycler);
        saveUsers(users);
        return newRecycler;
    };

    try {
        // ✅ FIX: Gửi đúng field name theo server.js
        const response = await fetch(
            'http://localhost:3000/api/customers/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: role,
                    username: username,
                    password: password,
                    // Recycler specific fields - đúng tên field server mong đợi
                    recyclername: recyclername,
                    recycleremail: recycleremail,
                    recyclerphone: recyclerphone,
                    recycleraddress: recycleraddress,
                    bankname: bankname,
                    bankaccount: bankaccount,
                    taxcode: taxcode,
                    legalrep: legalrep
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Đăng ký thất bại', 'error');
            return false;
        }

        console.log('✅ Recycler đã được lưu:', data);

        showToast(
            'Đăng ký đơn vị tái chế thành công! Vui lòng đăng nhập.',
            'success'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return true;

    } catch (error) {
        console.error('Lỗi đăng ký recycler:', error);

        fallbackRegister();

        showToast(
            'Không kết nối được server, đã lưu tạm trên trình duyệt.',
            'warning'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

        return false;
    }
}

function logoutUser() {
    sessionStorage.removeItem('currentUser');
    localStorage.setItem('cartItems', JSON.stringify([]));
    updateCartBadge();
    showToast('Đã đăng xuất', 'success');
    setTimeout(() => window.location.href = 'homePage.html', 500);
}

// ==================== 8. CART SYSTEM ====================

function updateCartBadge() {
    const currentUser = getCurrentUser();
    let totalItems = 0;
    
    if (currentUser) {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    
    const cartIcon = document.querySelector('.cart-icon, .fa-shopping-cart');
    if (cartIcon && cartIcon.parentElement) {
        let badge = cartIcon.parentElement.querySelector('.cart-badge');
        
        if (totalItems > 0 && currentUser) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `
                    position: absolute; top: -10px; right: -15px;
                    background: #e67e22; color: white;
                    border-radius: 50%; min-width: 20px; height: 20px;
                    font-size: 11px; display: flex; align-items: center;
                    justify-content: center; font-weight: bold; padding: 0 4px;
                `;
                cartIcon.parentElement.style.position = 'relative';
                cartIcon.parentElement.appendChild(badge);
            }
            badge.innerText = totalItems > 99 ? '99+' : totalItems;
            badge.style.display = 'flex';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }
}

function addToCart(product, quantity = 1, size = 'M', productType = 'Standard') {
    if (!requireLogin()) {
        return false;
    }
    
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size && item.type === productType);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ ...product, quantity, size, type: productType });
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Đã thêm ${product.name} (Size: ${size}) vào giỏ hàng!`, 'success');
    return true;
}

function goToCart() {
    if (!requireLogin()) {
        return;
    }
    window.location.href = 'cart.html';
}

// ==================== 9. CART PAGE ====================

function loadCartPage() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummaryContainer = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <h2>🛒 My Cart</h2>
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <button onclick="redirectToHomepage()" style="margin-top: 20px; background: #2A4D39; color: white; padding: 10px 30px; border: none; border-radius: 40px; cursor: pointer;">Tiếp tục mua sắm</button>
            </div>
        `;
        if (cartSummaryContainer) {
            cartSummaryContainer.innerHTML = `
                <h3>Checkout Details</h3>
                <div class="summary-row"><span>Subtotal</span><span>0 VNĐ</span></div>
                <div class="summary-row"><span>Shipping</span><span>0 VNĐ</span></div>
                <div class="summary-row"><span>Tax</span><span>0 VNĐ</span></div>
                <hr>
                <div class="summary-row total"><span>Total</span><span>0 VNĐ</span></div>
                <div class="green-shipping"><i class="fa-solid fa-leaf"></i> Green Shipping 🌿<p>Carbon-neutral delivery available</p></div>
                <button class="checkout-btn" onclick="proceedToCheckout()"><i class="fa-solid fa-credit-card"></i> Buy Now</button>
            `;
        }
        return;
    }
    
    let itemsHtml = `<h2>🛒 My Cart</h2>
        <div class="select-all">
            <input type="checkbox" id="selectAllCheckbox" onclick="toggleSelectAll()">
            <label for="selectAllCheckbox">Select All</label>
        </div>`;
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsHtml += `
            <div class="cart-item" data-index="${index}" style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #eee; background: white; margin-bottom: 10px; border-radius: 12px;">
                <input type="checkbox" class="product-check" data-index="${index}" onchange="updateCartSummary()">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div class="product-info" style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
                    <p style="margin: 0; color: #e67e22; font-weight: bold;">${formatCurrency(item.price)}</p>
                    <small style="color: #666;">Size: ${item.size || 'M'} | Loại: ${item.type || 'Standard'}</small>
                </div>
                <div class="quantity" style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateCartItemQuantity(${index}, -1)" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${index}, 1)" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                </div>
                <div class="item-total" style="min-width: 120px; text-align: right; font-weight: bold;">
                    ${formatCurrency(itemTotal)}
                </div>
                <button onclick="removeCartItem(${index})" style="background: none; border: none; color: #c0392b; font-size: 20px; cursor: pointer;">🗑️</button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHtml;
    
    const shipping = 20000;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    if (cartSummaryContainer) {
        cartSummaryContainer.innerHTML = `
            <h3>Checkout Details</h3>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Shipping</span><span>${formatCurrency(shipping)}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Tax</span><span>${formatCurrency(tax)}</span>
            </div>
            <hr style="margin: 15px 0;">
            <div class="summary-row total" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 18px;">
                <span>Total</span><span style="color: #e67e22;">${formatCurrency(total)}</span>
            </div>
            <div class="green-shipping" style="background: #e8f5e9; padding: 12px; border-radius: 12px; margin-bottom: 20px;">
                <i class="fa-solid fa-leaf"></i> Green Shipping 🌿
                <p style="margin: 5px 0 0 0; font-size: 12px;">Carbon-neutral delivery available</p>
            </div>
            <button class="checkout-btn" onclick="proceedToCheckout()" style="width: 100%; background: #2A4D39; color: white; padding: 14px; border: none; border-radius: 40px; font-size: 16px; cursor: pointer;">
                <i class="fa-solid fa-credit-card"></i> Buy Now
            </button>
        `;
    }
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const checkboxes = document.querySelectorAll('.product-check');
    let selectedTotal = 0;
    
    checkboxes.forEach((cb, idx) => {
        if (cb.checked && cart[idx]) {
            selectedTotal += cart[idx].price * cart[idx].quantity;
        }
    });
    
    const subtotal = selectedTotal;
    const shipping = subtotal > 0 ? 20000 : 0;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    const summaryDiv = document.querySelector('.cart-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <h3>Checkout Details</h3>
            <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
            <div class="summary-row"><span>Shipping</span><span>${formatCurrency(shipping)}</span></div>
            <div class="summary-row"><span>Tax</span><span>${formatCurrency(tax)}</span></div>
            <hr>
            <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
            <div class="green-shipping"><i class="fa-solid fa-leaf"></i> Green Shipping 🌿<p>Carbon-neutral delivery available</p></div>
            <button class="checkout-btn" onclick="proceedToCheckout()"><i class="fa-solid fa-credit-card"></i> Buy Now</button>
        `;
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.product-check');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateCartSummary();
}

function updateCartItemQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        loadCartPage();
        updateCartBadge();
    }
}

function removeCartItem(index) {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cart));
    loadCartPage();
    updateCartBadge();
}

function proceedToCheckout() {
    if (!requireLogin()) {
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const checkboxes = document.querySelectorAll('.product-check');
    const selectedItems = [];
    
    checkboxes.forEach((cb, idx) => {
        if (cb.checked && cart[idx]) {
            selectedItems.push(cart[idx]);
        }
    });
    
    if (selectedItems.length === 0) {
        showToast('Vui lòng chọn sản phẩm để thanh toán', 'warning');
        return;
    }
    
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    window.location.href = 'buynow.html';
}

// ==================== 10. BUY NOW PAGE (SỬA LẠI) ====================

function loadBuyNowPage() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    let productsList = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    let buyNowProduct = JSON.parse(localStorage.getItem('buyNowProduct'));
    
    if (buyNowProduct && !productsList.length) {
        productsList = [buyNowProduct];
    }
    
    if (productsList.length === 0) {
        showToast('Không có sản phẩm để thanh toán', 'error');
        setTimeout(() => window.location.href = 'cart.html', 1000);
        return;
    }
    
    let subtotal = 0;
    let productsHtml = '';
    
    productsList.forEach((item, idx) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        productsHtml += `
            <p>
                <input type="number" id="amount_${idx}" value="${item.quantity}" style="width: 60px;" readonly>
                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                ${item.name} (Size: ${item.size || 'M'})
                <input type="number" id="price_${idx}" value="${item.price}" style="width: 100px;" readonly>
                <label>VNĐ</label>
            </p>
            <hr>
        `;
    });
    
    const shipping = 20000;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    const orderDetailsTd = document.querySelector('.cart table tr:first-child td:first-child');
    if (orderDetailsTd) {
        orderDetailsTd.innerHTML = `
            <h1>Order Details</h1>
            <hr>
            ${productsHtml}
            <p> <label for="shippingfee">Shipping Fee</label> <input type="number" id="shippingfee" value="${shipping}" style="text-align: right;" readonly></p>
            <p> <label for="Tax">Tax</label> <input type="number" id="Tax" value="${tax}" style="text-align: right;" readonly></p>
            <p> <label for="total">Total</label> <input type="number" id="total" value="${total}" style="text-align: right;" readonly></p>
            <button class="checkout-btn" id="finalBuyNowBtn">
                <i class="fa-solid fa-credit-card"></i>
                Buy Now
            </button>
        `;
        
        const finalBtn = document.getElementById('finalBuyNowBtn');
        if (finalBtn) {
            finalBtn.onclick = () => processBuyNowPayment();
        }
    }
    
    window.currentBuyNowProducts = productsList;
    setupPaymentMethodSelection();
}

// ==================== KIỂM TRA VÀ QUẢN LÝ THÔNG TIN THANH TOÁN ====================

function checkPaymentInfoExists(userId) {
    const paymentInfo = JSON.parse(localStorage.getItem('paymentInfo')) || {};
    return paymentInfo[userId] && paymentInfo[userId].cardNumber && paymentInfo[userId].cardNumber.length > 0;
}

function getPaymentInfo(userId) {
    const paymentInfo = JSON.parse(localStorage.getItem('paymentInfo')) || {};
    return paymentInfo[userId] || null;
}

function savePaymentInfo(userId, paymentData) {
    const paymentInfo = JSON.parse(localStorage.getItem('paymentInfo')) || {};
    paymentInfo[userId] = {
        cardNumber: paymentData.cardNumber,
        cardHolder: paymentData.cardHolder,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        savedAt: new Date().toISOString()
    };
    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
    showToast('Đã lưu thông tin thanh toán!', 'success');
}

function openPaymentInfoModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Vui lòng đăng nhập!', 'warning');
        return;
    }
    
    const existingInfo = getPaymentInfo(currentUser.id);
    
    const modal = document.createElement('div');
    modal.id = 'paymentInfoModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 100003;
        display: flex; justify-content: center; align-items: center;
    `;
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; width: 500px; max-width: 90%;">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fa-solid fa-credit-card" style="font-size: 48px; color: #2A4D39;"></i>
                <h2 style="margin-top: 10px;">Thông tin thanh toán</h2>
                <p style="color: #666; font-size: 14px;">Vui lòng nhập thông tin thẻ thanh toán của bạn</p>
            </div>
            <div style="margin: 20px 0;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Số thẻ</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" 
                    oninput="formatCardNumber(this)"
                    style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px;">
                
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tên chủ thẻ</label>
                <input type="text" id="cardHolder" placeholder="Nguyễn Văn A" 
                    style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px;">
                
                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Ngày hết hạn</label>
                        <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" 
                            oninput="formatExpiryDate(this)"
                            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">CVV</label>
                        <input type="password" id="cvv" placeholder="123" maxlength="4" 
                            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="submitPaymentInfo()" style="flex: 1; background: #2A4D39; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                    <i class="fa-solid fa-save"></i> Lưu thông tin
                </button>
                <button onclick="closePaymentInfoModal()" style="flex: 1; background: #ccc; color: #333; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                    Hủy
                </button>
            </div>
        </div>
    `;
    
    // Nếu đã có thông tin cũ, điền vào form
    setTimeout(() => {
        if (existingInfo) {
            const cardNumberInput = document.getElementById('cardNumber');
            const cardHolderInput = document.getElementById('cardHolder');
            const expiryDateInput = document.getElementById('expiryDate');
            const cvvInput = document.getElementById('cvv');
            
            if (cardNumberInput) cardNumberInput.value = existingInfo.cardNumber;
            if (cardHolderInput) cardHolderInput.value = existingInfo.cardHolder;
            if (expiryDateInput) expiryDateInput.value = existingInfo.expiryDate;
            if (cvvInput) cvvInput.value = existingInfo.cvv;
        }
    }, 50);
    
    document.body.appendChild(modal);
}

function closePaymentInfoModal() {
    const modal = document.getElementById('paymentInfoModal');
    if (modal) modal.remove();
}

function submitPaymentInfo() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Vui lòng đăng nhập!', 'warning');
        return;
    }
    
    const cardNumber = document.getElementById('cardNumber')?.value.trim();
    const cardHolder = document.getElementById('cardHolder')?.value.trim();
    const expiryDate = document.getElementById('expiryDate')?.value.trim();
    const cvv = document.getElementById('cvv')?.value.trim();
    
    // Validate thông tin
    if (!cardNumber) {
        showToast('Vui lòng nhập số thẻ!', 'warning');
        return;
    }
    
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        showToast('Số thẻ không hợp lệ (13-19 số)!', 'warning');
        return;
    }
    
    if (!cardHolder) {
        showToast('Vui lòng nhập tên chủ thẻ!', 'warning');
        return;
    }
    
    if (!expiryDate) {
        showToast('Vui lòng nhập ngày hết hạn!', 'warning');
        return;
    }
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
        showToast('Ngày hết hạn không hợp lệ (MM/YY)!', 'warning');
        return;
    }
    
    if (!cvv) {
        showToast('Vui lòng nhập CVV!', 'warning');
        return;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
        showToast('CVV phải có 3-4 số!', 'warning');
        return;
    }
    
    // Lưu thông tin
    savePaymentInfo(currentUser.id, {
        cardNumber: cardNumber,
        cardHolder: cardHolder,
        expiryDate: expiryDate,
        cvv: cvv
    });
    
    closePaymentInfoModal();
    showToast('Đã lưu thông tin thanh toán! Bạn có thể thanh toán ngay.', 'success');
}

// Format số thẻ khi nhập (thêm khoảng trắng sau mỗi 4 số)
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    if (value.length > 0) {
        let parts = [];
        for (let i = 0; i < value.length; i += 4) {
            parts.push(value.substr(i, 4));
        }
        value = parts.join(' ');
    }
    input.value = value;
}

// Format ngày hết hạn (tự động thêm /)
function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
}

// ==================== 10b. PROCESS BUY NOW PAYMENT (SỬA - COD không cần thông tin thẻ) ====================

function setupPaymentMethodSelection() {
    const walletCards = document.querySelectorAll('.wallet-card');
    walletCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            document.querySelectorAll('.wallet-card, .cod-btn').forEach(c => {
                c.style.border = '';
                c.style.background = '';
                c.style.color = '';
                c.classList.remove('selected');
                const checkIcon = c.querySelector('.check-icon');
                if (checkIcon) checkIcon.remove();
            });
            
            card.style.border = '2px solid #2A4D39';
            card.style.borderRadius = '12px';
            card.classList.add('selected');
            card.style.position = 'relative';
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fa-solid fa-circle-check check-icon';
            checkIcon.style.cssText = 'position: absolute; top: -8px; right: -8px; color: #27ae60; font-size: 20px; background: white; border-radius: 50%;';
            card.appendChild(checkIcon);
        });
    });
    
    const codBtn = document.querySelector('.cod-btn');
    if (codBtn) {
        codBtn.style.cursor = 'pointer';
        codBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            document.querySelectorAll('.wallet-card, .cod-btn').forEach(c => {
                c.style.border = '';
                c.style.background = '';
                c.style.color = '';
                c.classList.remove('selected');
                const checkIcon = c.querySelector('.check-icon');
                if (checkIcon) checkIcon.remove();
            });
            
            codBtn.style.background = '#2A4D39';
            codBtn.style.color = 'white';
            codBtn.classList.add('selected');
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fa-solid fa-circle-check check-icon';
            checkIcon.style.cssText = 'margin-left: 8px; font-size: 16px;';
            codBtn.appendChild(checkIcon);
        });
    }
}

function processBuyNowPayment() {
    if (!requireLogin()) {
        return;
    }
    
    const products = window.currentBuyNowProducts || [];
    if (products.length === 0) {
        showToast('Không có sản phẩm để thanh toán', 'error');
        return;
    }
    
    // KIỂM TRA ĐÃ CHỌN PHƯƠNG THỨC THANH TOÁN
    const selectedCrypto = document.querySelector('.payment-methods .wallet-card.selected');
    const selectedCOD = document.querySelector('.cod-btn.selected');
    
    if (!selectedCrypto && !selectedCOD) {
        showToast('Vui lòng chọn phương thức thanh toán trước khi thanh toán!', 'warning');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để thanh toán', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    
    let selectedPaymentMethod = 'Blockchain Wallet';
    let isCOD = false;
    
    if (selectedCrypto) {
        const walletName = selectedCrypto.querySelector('span')?.innerText;
        selectedPaymentMethod = walletName ? walletName + ' (Crypto)' : 'Crypto Wallet';
        isCOD = false;
    }
    
    if (selectedCOD) {
        selectedPaymentMethod = 'Cash on Delivery';
        isCOD = true;
    }
    
    // *** QUAN TRỌNG: Nếu chọn COD thì KHÔNG cần kiểm tra thông tin thẻ ***
    if (!isCOD) {
        // Chỉ kiểm tra thông tin thanh toán khi chọn Crypto Wallet
        const hasPaymentInfo = checkPaymentInfoExists(currentUser.id);
        if (!hasPaymentInfo) {
            showToast('Vui lòng thêm thông tin thẻ thanh toán trước khi thanh toán bằng Crypto!', 'warning');
            openPaymentInfoModal();
            return;
        }
    }
    
    const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 20000;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    const ecoPointsEarned = Math.floor(total / 10000) * 10;
    
    const orderId = generateId('ORD');
    const invoiceNumber = 'INV-' + new Date().getFullYear() + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    // Tạo order object
    const order = {
        orderId, invoiceNumber, userId: currentUser.id,
        customerName: currentUser.fullname, customerEmail: currentUser.email,
        customerPhone: currentUser.phone, shippingAddress: currentUser.address,
        products: products, subtotal, shippingFee: shipping, discount: 0, tax, amount: total,
        paymentMethod: selectedPaymentMethod, status: isCOD ? 'Pending Payment' : 'Processing',
        date: new Date().toISOString(), ecoPointsEarned: ecoPointsEarned
    };
    
    // Nếu thanh toán bằng Crypto, thêm thông tin thẻ vào order
    if (!isCOD) {
        const paymentInfo = getPaymentInfo(currentUser.id);
        if (paymentInfo) {
            order.paymentInfo = {
                cardLast4: paymentInfo.cardNumber.slice(-4),
                cardHolder: paymentInfo.cardHolder,
                paidAt: new Date().toISOString()
            };
        }
    } else {
        // COD: thêm ghi chú
        order.paymentInfo = {
            method: 'Cash on Delivery',
            note: 'Khách hàng sẽ thanh toán khi nhận hàng',
            expectedPaymentDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0]
        };
    }
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].ecoPoints += ecoPointsEarned;
        saveUsers(users);
        sessionStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ecoPoints: users[userIndex].ecoPoints }));
    }
    
    if (JSON.parse(localStorage.getItem('checkoutItems'))?.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify([]));
        localStorage.removeItem('checkoutItems');
        updateCartBadge();
    }
    
    localStorage.removeItem('buyNowProduct');
    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.setItem('invoicePDFData', JSON.stringify(order));
    
    if (isCOD) {
        showToast(`Đặt hàng thành công! Mã đơn: ${orderId}. Bạn sẽ thanh toán khi nhận hàng.`, 'success');
    } else {
        showToast(`Đặt hàng thành công! Mã đơn: ${orderId}`, 'success');
    }
    setTimeout(() => { window.location.href = 'invoice.html'; }, 1000);
}
// ==================== 11. PRODUCT DETAIL PAGE ====================

function loadProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;
    const products = getProducts();
    const product = products.find(p => p.id === productId) || products[0];
    
    const productNameEl = document.querySelector('.product-info h1');
    if (productNameEl) productNameEl.innerText = product.name;
    
    const priceEl = document.querySelector('.price');
    if (priceEl) priceEl.innerText = formatCurrency(product.price);
    
    const infoCards = document.querySelectorAll('.info-card p');
    if (infoCards.length >= 6) {
        infoCards[0].innerText = product.material;
        infoCards[1].innerText = product.origin;
        infoCards[2].innerText = product.certificate;
        infoCards[3].innerText = product.carbon;
        infoCards[4].innerText = product.recycledRate + '%';
        infoCards[5].innerText = product.score + '%';
    }
    
    const mainImage = document.querySelector('.main-image img');
    if (mainImage) mainImage.src = product.image;
    
    const thumbnails = document.querySelectorAll('.thumbnail-list img');
    if (thumbnails.length > 0) thumbnails[0].src = product.image;
    
    let selectedSize = 'M';
    const sizeBtns = document.querySelectorAll('.sizes button');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.innerText;
        });
        if (btn.classList.contains('active')) {
            selectedSize = btn.innerText;
        }
    });
    
    const minusBtn = document.querySelector('.quantity-box button:first-child');
    const plusBtn = document.querySelector('.quantity-box button:last-child');
    const qtyInput = document.querySelector('.quantity-box input');
    if (minusBtn && plusBtn && qtyInput) {
        minusBtn.onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        };
        plusBtn.onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val < product.stock) qtyInput.value = val + 1;
        };
    }
    
    let selectedType = 'Standard';
    const typeRadios = document.querySelectorAll('.type input[type="radio"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                selectedType = radio.value;
            }
        });
        if (radio.checked) {
            selectedType = radio.value;
        }
    });
    
    const addToCartBtn = document.querySelector('.cart-btn');
    if (addToCartBtn) {
        addToCartBtn.onclick = () => {
            const quantity = parseInt(qtyInput?.value || 1);
            addToCart(product, quantity, selectedSize, selectedType);
        };
    }
    
    const buyNowBtn = document.querySelector('.buy-btn');
    if (buyNowBtn) {
        buyNowBtn.onclick = () => {
            if (!requireLogin()) {
                return;
            }
            const quantity = parseInt(qtyInput?.value || 1);
            const productToBuy = { ...product, quantity, size: selectedSize, type: selectedType };
            localStorage.setItem('buyNowProduct', JSON.stringify(productToBuy));
            window.location.href = 'buynow.html';
        };
    }
}

// ==================== 12. INVOICE PAGES ====================

function loadInvoicePage() {
    if (!isLoggedIn()) {
        showToast('Vui lòng đăng nhập để xem hóa đơn!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }
    
    const order = JSON.parse(localStorage.getItem('currentOrder'));
    if (!order) { 
        window.location.href = 'homePage.html'; 
        return; 
    }
    
    const nameInput = document.querySelector('.bill-to input');
    if (nameInput) nameInput.value = order.customerName;
    
    const emailP = document.querySelector('.bill-to p:nth-child(3)');
    if (emailP) emailP.innerText = order.customerEmail;
    
    const phoneP = document.querySelector('.bill-to p:nth-child(4)');
    if (phoneP) phoneP.innerText = order.customerPhone;
    
    const addressP = document.querySelector('.bill-to p:nth-child(5)');
    if (addressP) addressP.innerText = order.shippingAddress;
    
    const paymentStrong = document.querySelector('.payment-method .wallet-box strong');
    if (paymentStrong) paymentStrong.innerText = order.paymentMethod;
    
    const tbody = document.querySelector('.product-table tbody');
    if (tbody) {
        let productsHtml = '';
        order.products.forEach(item => {
            productsHtml += `
                <tr>
                    <td class="product-info" style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                        <div>
                            <strong>${item.name}</strong>
                            <p>Size: ${item.size || 'M'}</p>
                            <p>Sustainability Score: ${item.score || '92'}%</p>
                        </div>
                    </td>
                    <td>${item.quantity}x</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `;
        });
        tbody.innerHTML = productsHtml;
    }
    
    const subtotalSpan = document.querySelector('.invoice-summary .row:first-child span:last-child');
    if (subtotalSpan) subtotalSpan.innerText = formatCurrency(order.subtotal);
    
    const shippingSpan = document.querySelector('.invoice-summary .row:nth-child(3) span:last-child');
    if (shippingSpan) shippingSpan.innerText = formatCurrency(order.shippingFee);
    
    const taxSpan = document.querySelector('.invoice-summary .row:nth-child(4) span:last-child');
    if (taxSpan) taxSpan.innerText = formatCurrency(order.tax);
    
    const totalSpan = document.querySelector('.invoice-summary .total-row span:last-child');
    if (totalSpan) totalSpan.innerText = formatCurrency(order.amount);
    
    const hashP = document.querySelector('.blockchain-box p:first-child');
    if (hashP) hashP.innerText = `Hash: 0x${generateId().substr(0,16)}...`;
    
    const timeP = document.querySelector('.blockchain-box p:last-child');
    if (timeP) timeP.innerText = `Timestamp: ${new Date(order.date).toLocaleString()}`;
}

function goToInvoicePDF() { 
    if (!requireLogin()) return;
    window.location.href = 'invoicepdf.html'; 
}

function loadInvoicePDFPage() {
    if (!isLoggedIn()) {
        showToast('Vui lòng đăng nhập để xem hóa đơn!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }
    
    const order = JSON.parse(localStorage.getItem('invoicePDFData')) || JSON.parse(localStorage.getItem('currentOrder'));
    if (!order) { 
        window.location.href = 'homePage.html'; 
        return; 
    }
    
    const dateSpan = document.querySelector('.invoice-info div:first-child p:first-child');
    if (dateSpan) dateSpan.innerText = `Date of Issue: ${new Date(order.date).toLocaleDateString('vi-VN')}`;
    
    const invoiceSpan = document.querySelector('.invoice-info div:first-child p:last-child');
    if (invoiceSpan) invoiceSpan.innerText = `Invoice Number: ${order.invoiceNumber}`;
    
    const orderIdStrong = document.querySelector('.invoice-number strong');
    if (orderIdStrong) orderIdStrong.innerText = order.orderId;
    
    const tbody = document.querySelector('.product-table tbody');
    if (tbody) {
        let productsHtml = '';
        order.products.forEach(item => {
            productsHtml += `
                <tr>
                    <td class="product" style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                        <div>
                            <b>${item.name}</b>
                            <p>Size: ${item.size || 'M'}</p>
                            <p>Sustainability Score: ${item.score || '92'}%</p>
                        </div>
                    </td>
                    <td>${item.quantity}x</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `;
        });
        tbody.innerHTML = productsHtml;
    }
    
    const subtotalSpan = document.querySelector('.invoice-summary .row span:last-child');
    if (subtotalSpan) subtotalSpan.innerText = formatCurrency(order.subtotal);
    
    const totalSpan = document.querySelector('.invoice-summary .total span:last-child');
    if (totalSpan) totalSpan.innerText = formatCurrency(order.amount);
    
    const hashP = document.querySelector('.verify-box div p:first-child');
    if (hashP) hashP.innerText = `Hash: 0x${generateId().substr(0,16)}...`;
    
    const timeP = document.querySelector('.verify-box div p:last-child');
    if (timeP) timeP.innerText = `Timestamp: ${new Date(order.date).toLocaleString()}`;
}

function downloadPDFInvoice() {
    if (!requireLogin()) return;
    
    const order = JSON.parse(localStorage.getItem('invoicePDFData')) || JSON.parse(localStorage.getItem('currentOrder'));
    if (!order) return;
    
    let productsHtml = '';
    order.products.forEach(item => {
        productsHtml += `
            <tr>
                <td>${item.name} (Size: ${item.size || 'M'})</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `;
    });
    
    const invoiceHtml = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice ${order.invoiceNumber}</title>
        <style>
            body{font-family:Arial;padding:40px}
            .header{text-align:center;border-bottom:2px solid #2A4D39;margin-bottom:30px}
            table{width:100%;border-collapse:collapse;margin:20px 0}
            th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}
            .total{text-align:right;margin-top:20px;font-size:18px;font-weight:bold}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>GREEN THREAD</h1>
            <p>Sustainable Fashion Marketplace</p>
            <h2>INVOICE</h2>
            <p>#${order.invoiceNumber}</p>
        </div>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString('vi-VN')}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Address:</strong> ${order.shippingAddress}</p>
        <table border="1">
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${productsHtml}
        </table>
        <div class="total">Total: ${formatCurrency(order.amount)}</div>
        <p style="margin-top:50px;text-align:center;">Thank you for sustainable shopping! 🌿</p>
    </body>
    </html>`;
    
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${order.invoiceNumber}.html`;
    link.click();
    showToast('Đã tải hóa đơn!', 'success');
}

// ==================== 13. USER PROFILE ====================

function loadUserProfile() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) { window.location.href = 'login.html'; return; }
    
    const nameInput = document.getElementById('Name');
    if (nameInput) nameInput.value = currentUser.fullname;
    
    const totalEcoInput = document.getElementById('Totaleco');
    if (totalEcoInput) totalEcoInput.value = currentUser.ecoPoints;
    
    const percentEcoInput = document.getElementById('percenteco');
    if (percentEcoInput) percentEcoInput.value = Math.min(100, Math.floor(currentUser.ecoPoints / 25));
    
    const levelInput = document.getElementById('level');
    if (levelInput) levelInput.value = currentUser.ecoPoints >= 2000 ? 3 : currentUser.ecoPoints >= 1000 ? 2 : 1;
    
    const dayInput = document.getElementById('day');
    if (dayInput) dayInput.value = currentUser.joinDate;
    
    const addressInput = document.getElementById('Address');
    if (addressInput) addressInput.value = `0x${generateId().substr(0,16)}...${generateId().substr(0,4)}`;
    
    const recycleHistory = JSON.parse(localStorage.getItem('recycleHistory')) || [];
    const userRecycles = recycleHistory.filter(r => r.userId === currentUser.id);
    const recycleContainer = document.querySelector('.recyclehistory');
    if (recycleContainer && recycleContainer.querySelector('h3')) {
        if (userRecycles.length === 0) {
            const p = recycleContainer.querySelector('p');
            if (p) p.innerText = 'Chưa có sản phẩm tái chế nào.';
        } else {
            let recycleHtml = '<h3>My recycled history</h3><p>Items sent for recycling</p><hr>';
            userRecycles.forEach(item => {
                recycleHtml += `<p><input type="number" value="1" style="width:50px;" readonly> <img src="images/recycle-icon.png" style="width:30px;"> ${item.productName} <input type="number" value="${item.pointsEarned}" style="width:80px;" readonly> Eco Points</p><hr>`;
            });
            recycleContainer.innerHTML = recycleHtml;
        }
    }
    
    const usedProducts = JSON.parse(localStorage.getItem('usedProductsPurchased')) || [];
    const userUsed = usedProducts.filter(p => p.userId === currentUser.id);
    const purchasedContainer = document.querySelector('.productpurchased');
    if (purchasedContainer) {
        if (userUsed.length === 0) {
            purchasedContainer.innerHTML = '<p>Used products purchased</p><p>Chưa có sản phẩm cũ nào.</p><hr>';
        } else {
            let purchasedHtml = '<p>Used products purchased</p>';
            userUsed.forEach(item => {
                purchasedHtml += `<p><input type="number" value="${item.amount}" style="width:50px;" readonly> <img src="images/used-icon.png" style="width:30px;"> ${item.productName} <input type="number" value="${item.price}" style="width:80px;" readonly> VNĐ</p><hr>`;
            });
            purchasedContainer.innerHTML = purchasedHtml;
        }
    }
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    const orderTable = document.querySelector('.order-history-table');
    if (orderTable) {
        if (userOrders.length === 0) {
            orderTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có đơn hàng nào.</td></tr>';
        } else {
            let orderHtml = '';
            userOrders.forEach(order => {
                orderHtml += `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">${order.orderId}</td><td style="padding:10px;">${new Date(order.date).toLocaleDateString('vi-VN')}</td><td style="padding:10px;">${order.products.map(p => p.name + ' (' + (p.size || 'M') + ')').join(', ')}</td><td style="padding:10px;color:#e67e22;font-weight:bold;">${formatCurrency(order.amount)}</td><td style="padding:10px;"><span style="background:${order.status === 'Delivered' ? '#27ae60' : order.status === 'Shipping' ? '#3498db' : '#f39c12'};color:white;padding:4px 12px;border-radius:20px;font-size:12px;">${order.status}</span></td></tr>`;
            });
            orderTable.innerHTML = orderHtml;
        }
    }
}

// ==================== 14. HOMEPAGE EVENTS ====================

function setupHomepageEvents() {
    const products = getProducts();
    const productCards = document.querySelectorAll('.card');
    
    if (productCards.length === 0) {
        setTimeout(setupHomepageEvents, 500);
        return;
    }
    
    productCards.forEach((card, index) => {
        const product = products[index % products.length];
        if (!product) return;
        
        const productImage = card.querySelector('img');
        if (productImage) {
            productImage.style.cursor = 'pointer';
            productImage.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `productdetailhomepage.html?id=${product.id}`;
            };
        }
        
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (e.target.classList && (e.target.classList.contains('recylebutton') || e.target.classList.contains('QRbutton'))) {
                return;
            }
            window.location.href = `productdetailhomepage.html?id=${product.id}`;
        };
        
        const recycleBtn = card.querySelector('.recylebutton');
        if (recycleBtn) {
            recycleBtn.onclick = (e) => {
                e.stopPropagation();
                if (!requireLogin()) return;
                showToast(`♻️ Tái chế ${product.name} thành công! +200 Eco Points`, 'success');
            };
        }
        
        const qrBtn = card.querySelector('.QRbutton');
        if (qrBtn) {
            qrBtn.onclick = (e) => {
                e.stopPropagation();
                showToast(`🔗 Blockchain Verified: ${product.name}`, 'success');
            };
        }
    });
}

function setupUserHomepageEvents() {
    const products = getProducts();
    const productCards = document.querySelectorAll('.card');
    
    if (productCards.length === 0) {
        setTimeout(setupUserHomepageEvents, 500);
        return;
    }
    
    productCards.forEach((card, index) => {
        const product = products[index % products.length];
        if (!product) return;
        
        const productImage = card.querySelector('img');
        if (productImage) {
            productImage.style.cursor = 'pointer';
            productImage.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `productdetail.html?id=${product.id}`;
            };
        }
        
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (e.target.classList && (e.target.classList.contains('recylebutton') || e.target.classList.contains('QRbutton'))) {
                return;
            }
            window.location.href = `productdetail.html?id=${product.id}`;
        };
        
        const recycleBtn = card.querySelector('.recylebutton');
        if (recycleBtn) {
            recycleBtn.onclick = (e) => {
                e.stopPropagation();
                if (!requireLogin()) return;
                showToast(`♻️ Tái chế ${product.name} thành công! +200 Eco Points`, 'success');
            };
        }
        
        const qrBtn = card.querySelector('.QRbutton');
        if (qrBtn) {
            qrBtn.onclick = (e) => {
                e.stopPropagation();
                showToast(`🔗 Blockchain Verified: ${product.name}`, 'success');
            };
        }
    });
}

// ==================== 15. LOGIN & REGISTER ====================

function setupLoginPage() {
    const loginForm = document.querySelector('.form-box form');
    if (!loginForm) return;
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const inputs = loginForm.querySelectorAll('input');
        loginUser(inputs[0]?.value, inputs[1]?.value);
    };
}

async function adminLogin(adminID, password) {
    if (!adminID || !password) {
        showToast('Vui lòng nhập Admin ID và mật khẩu', 'error');
        return false;
    }

    try {
        const response = await fetch(`${DATA_API_BASE}/admins/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminID, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'Đăng nhập admin thất bại', 'error');
            return false;
        }

        const admin = data.admin;
        const currentUser = {
            id: admin.adminID,
            username: admin.userName || admin.adminID,
            fullname: admin.fullName || admin.userName || admin.adminID,
            email: admin.email || '',
            phoneNumber: admin.phoneNumber || '',
            role: 'admin'
        };

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast(`Chào mừng Admin ${currentUser.fullname}!`, 'success');

        setTimeout(() => {
            window.location.href = 'admin_dashboard.html';
        }, 800);

        return true;
    } catch (error) {
        console.error(error);
        showToast('Không thể kết nối tới server', 'error');
        return false;
    }
}

function setupAdminLoginPage() {
    const loginForm = document.querySelector('.form-admin form');
    if (!loginForm) return;
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const adminID = document.getElementById('adminId')?.value.trim();
        const password = document.getElementById('loginpassword')?.value || '';
        adminLogin(adminID, password);
    };
}

async function loadCurrentAdminInfo() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        return null;
    }

    try {
        const response = await fetch(`${DATA_API_BASE}/admins`);
        if (!response.ok) {
            throw new Error(`Failed to load admins: ${response.status}`);
        }

        const data = await response.json();
        const admin = (data.admins || []).find(a => String(a.adminID).trim() === String(currentUser.id).trim());
        return admin ? {
            id: admin.adminID,
            username: admin.userName || admin.adminID,
            fullname: admin.fullName || admin.userName || admin.adminID,
            email: admin.email || '',
            phoneNumber: admin.phoneNumber || '',
            role: 'admin'
        } : currentUser;
    } catch (error) {
        console.warn('Không tải được thông tin admin từ server:', error);
        return currentUser;
    }
}

async function setupAdminDashboardPage() {
    const currentUser = await loadCurrentAdminInfo();
    const welcomeEl = document.getElementById('adminWelcome');
    const adminIdEl = document.getElementById('adminIdValue');
    const emailEl = document.getElementById('adminEmailValue');
    const logoutButton = document.getElementById('adminLogoutButton');

    if (!currentUser) {
        return;
    }

    if (welcomeEl) {
        welcomeEl.textContent = `Xin chào, ${currentUser.fullname || currentUser.username}!`;
    }
    if (adminIdEl) {
        adminIdEl.textContent = currentUser.id || '';
    }
    if (emailEl) {
        emailEl.textContent = currentUser.email || 'Không có email';
    }
    if (logoutButton) {
        logoutButton.onclick = () => logoutUser();
    }
}

function setupRegisterPage() {
    const registerForm = document.querySelector('.form-box form');
    if (!registerForm) return;
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const inputs = registerForm.querySelectorAll('input');
        const fullname = inputs[0]?.value.trim() || '';
        const username = inputs[1]?.value.trim() || '';
        const email = inputs[2]?.value.trim() || '';
        const phone = inputs[3]?.value.trim() || '';
        const password = inputs[4]?.value.trim() || '';
        const confirmpassword = inputs[5]?.value.trim() || '';
        const role = "customer";
        
        registerCustomer(fullname, username, email, phone, password, confirmpassword, role);
    };
}

function setupRegisterBrand() {
    const registerForm = document.querySelector('.form-brand form');
    if (!registerForm) return;
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const inputs = registerForm.querySelectorAll('input');
        const brandname = inputs[0]?.value.trim() || '';
        const username = inputs[1]?.value.trim() || '';
        const brandemail = inputs[2]?.value.trim() || '';
        const brandphone = inputs[3]?.value.trim() || '';
        const brandaddress = inputs[4]?.value.trim() || '';
        const bankname = inputs[5]?.value.trim() || '';
        const bankaccount = inputs[6]?.value.trim() || '';
        const taxcode = inputs[7]?.value.trim() || '';
        const legalrep = inputs[8]?.value.trim() || '';
        const password = inputs[9]?.value || '';
        const confirmpassword = inputs[10]?.value || '';
        const role = "brand";
        
        registerBrand(brandname, username, brandemail, brandphone, brandaddress, bankname, bankaccount, taxcode, legalrep, password, confirmpassword, role);
    };
}

function setupRegisterRecycler() {
    const registerForm = document.querySelector('.form-recycler form');
    if (!registerForm) return;
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const inputs = registerForm.querySelectorAll('input');
        const recyclername = inputs[0]?.value.trim() || '';
        const username = inputs[1]?.value.trim() || '';
        const recycleremail = inputs[2]?.value.trim() || '';
        const recyclerphone = inputs[3]?.value.trim() || '';
        const recycleraddress = inputs[4]?.value.trim() || '';
        const bankname = inputs[5]?.value.trim() || '';
        const bankaccount = inputs[6]?.value.trim() || '';
        const taxcode = inputs[7]?.value.trim() || '';
        const legalrep = inputs[8]?.value.trim() || '';
        const password = inputs[9]?.value || '';
        const confirmpassword = inputs[10]?.value || '';
        const role = "recycler";
        
        registerRecycler(recyclername, username, recycleremail, recyclerphone, recycleraddress, bankname, bankaccount, taxcode, legalrep, password, confirmpassword, role);
    };
}
// ==================== 16. LANGUAGE & SUPPORT ====================

function openLanguageModal() {
    const modal = document.createElement('div');
    modal.id = 'languageModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 100002;
        display: flex; justify-content: center; align-items: center;
    `;
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; width: 400px; max-width: 90%; text-align: center;">
            <i class="fas fa-globe" style="font-size: 48px; color: #2A4D39; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 20px;">Select Language</h2>
            <button onclick="setLanguage('vi')" style="width: 100%; padding: 12px; margin: 8px 0; background: #2A4D39; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                🇻🇳 Tiếng Việt
            </button>
            <button onclick="setLanguage('en')" style="width: 100%; padding: 12px; margin: 8px 0; background: #f0f0f0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                🇬🇧 English
            </button>
            <button onclick="closeLanguageModal()" style="margin-top: 20px; padding: 8px 20px; background: none; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeLanguageModal() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.remove();
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    if (lang === 'vi') {
        showToast('Đã chuyển sang Tiếng Việt 🇻🇳', 'success');
    } else {
        showToast('Switched to English 🇬🇧', 'success');
    }
    closeLanguageModal();
}

function openSupportModal() {
    const modal = document.createElement('div');
    modal.id = 'supportModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 100002;
        display: flex; justify-content: center; align-items: center;
    `;
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; width: 450px; max-width: 90%;">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-headset" style="font-size: 48px; color: #2A4D39;"></i>
                <h2 style="margin-top: 10px;">Customer Support</h2>
            </div>
            <div style="margin: 20px 0;">
                <p><i class="fas fa-phone" style="width: 30px; color: #2A4D39;"></i> <strong>Hotline:</strong> 1900 1234</p>
                <p><i class="fas fa-envelope" style="width: 30px; color: #2A4D39;"></i> <strong>Email:</strong> support@greenthread.com</p>
                <p><i class="fas fa-clock" style="width: 30px; color: #2A4D39;"></i> <strong>Working Hours:</strong> 8:00 - 21:00 (Mon-Sat)</p>
                <p><i class="fas fa-map-marker-alt" style="width: 30px; color: #2A4D39;"></i> <strong>Address:</strong> 123 Đường Xanh, Quận 1, TP.HCM</p>
            </div>
            <hr style="margin: 20px 0;">
            <div style="text-align: center;">
                <p style="color: #666; font-size: 14px;">Chat với nhân viên hỗ trợ:</p>
                <button onclick="startLiveChat()" style="padding: 10px 20px; background: #2A4D39; color: white; border: none; border-radius: 40px; cursor: pointer; margin-right: 10px;">
                    <i class="fab fa-facebook-messenger"></i> Messenger
                </button>
                <button onclick="startZaloChat()" style="padding: 10px 20px; background: #0068FF; color: white; border: none; border-radius: 40px; cursor: pointer;">
                    <i class="fab fa-weixin"></i> Zalo
                </button>
            </div>
            <button onclick="closeSupportModal()" style="margin-top: 20px; width: 100%; padding: 10px; background: none; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;">Đóng</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) modal.remove();
}

function startLiveChat() {
    showToast('Đang kết nối Messenger...', 'info');
    setTimeout(() => {
        window.open('https://m.me/greenthread', '_blank');
    }, 500);
}

function startZaloChat() {
    showToast('Đang kết nối Zalo...', 'info');
    setTimeout(() => {
        window.open('https://zalo.me/1234567890', '_blank');
    }, 500);
}

/// ==================== 17. KHỞI TẠO SỰ KIỆN CHO THANH BAR ====================

function setupBarEvents() {
    // Menu icon (3 gạch)
    const menuIcon = document.querySelector('.menu i, .fa-bars');
    if (menuIcon) {
        menuIcon.onclick = (e) => {
            e.stopPropagation();
            toggleMenu();
            // Sau khi mở menu, gán lại sự kiện cho các link
            setTimeout(attachMenuLinkEvents, 50);
        };
    }
    
    // Filter icon
    const filterIcon = document.querySelector('.filter-icons i, .fa-filter');
    if (filterIcon) {
        filterIcon.onclick = (e) => {
            e.stopPropagation();
            toggleFilter();
        };
    }
    
    // Bell icon
    const bellIcon = document.querySelector('.filter-bell i, .fa-bell');
    if (bellIcon) {
        bellIcon.onclick = (e) => {
            e.stopPropagation();
            toggleNotification();
        };
    }
    
    // Logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onclick = () => redirectToHomepage();
    }
    
    // Cart icon
    const cartIcon = document.querySelector('.cart-icon, .fa-shopping-cart');
    if (cartIcon) {
        cartIcon.onclick = () => {
            if (!requireLogin()) return;
            goToCart();
        };
    }
    
    // User icon
    const userIcon = document.querySelector('.fa-circle-user');
    if (userIcon) {
        userIcon.onclick = () => {
            if (!requireLogin()) return;
            window.location.href = 'myprofile.html';
        };
    }
    
    // Login/Signup buttons (chỉ hiển thị khi chưa đăng nhập)
    const loginBtn = document.querySelector('.login-btn');
    const adminLoginBtn = document.querySelector('.admin-login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (isLoggedIn()) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (adminLoginBtn) adminLoginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
    } else {
        if (loginBtn) loginBtn.onclick = () => window.location.href = 'login.html';
        if (adminLoginBtn) adminLoginBtn.onclick = () => window.location.href = 'login_admin.html';
        if (signupBtn) signupBtn.onclick = () => window.location.href = 'register.html';
    }
}

// Hàm gán sự kiện cho các link trong menu dropdown
function attachMenuLinkEvents() {
    // Menu Home Link
    const menuHomeLink = document.getElementById('menuHomeLink');
    if (menuHomeLink) {
        // Xóa event cũ để tránh trùng lặp
        const newHomeLink = menuHomeLink.cloneNode(true);
        menuHomeLink.parentNode.replaceChild(newHomeLink, menuHomeLink);
        newHomeLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            redirectToHomepage();
        };
    }
    
    // Menu Profile Link
    const menuProfileLink = document.getElementById('menuProfileLink');
    if (menuProfileLink) {
        const newProfileLink = menuProfileLink.cloneNode(true);
        menuProfileLink.parentNode.replaceChild(newProfileLink, menuProfileLink);
        newProfileLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            if (!requireLogin()) return;
            window.location.href = 'myprofile.html';
        };
    }
    
    // Menu Orders Link
    const menuOrdersLink = document.getElementById('menuOrdersLink');
    if (menuOrdersLink) {
        const newOrdersLink = menuOrdersLink.cloneNode(true);
        menuOrdersLink.parentNode.replaceChild(newOrdersLink, menuOrdersLink);
        newOrdersLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            if (!requireLogin()) return;
            window.location.href = 'myprofile.html';
        };
    }
    
    // Menu Cart Link
    const menuCartLink = document.getElementById('menuCartLink');
    if (menuCartLink) {
        const newCartLink = menuCartLink.cloneNode(true);
        menuCartLink.parentNode.replaceChild(newCartLink, menuCartLink);
        newCartLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            if (!requireLogin()) return;
            window.location.href = 'cart.html';
        };
    }
    
    // Menu Language Link
    const menuLanguageLink = document.getElementById('menuLanguageLink');
    if (menuLanguageLink) {
        const newLanguageLink = menuLanguageLink.cloneNode(true);
        menuLanguageLink.parentNode.replaceChild(newLanguageLink, menuLanguageLink);
        newLanguageLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            openLanguageModal();
        };
    }
    
    // Menu Support Link
    const menuSupportLink = document.getElementById('menuSupportLink');
    if (menuSupportLink) {
        const newSupportLink = menuSupportLink.cloneNode(true);
        menuSupportLink.parentNode.replaceChild(newSupportLink, menuSupportLink);
        newSupportLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            openSupportModal();
        };
    }
    
    // Menu Logout Link
    const menuLogoutLink = document.getElementById('menuLogoutLink');
    if (menuLogoutLink) {
        const newLogoutLink = menuLogoutLink.cloneNode(true);
        menuLogoutLink.parentNode.replaceChild(newLogoutLink, menuLogoutLink);
        newLogoutLink.onclick = (e) => {
            e.preventDefault();
            closeAllDropdowns();
            logoutUser();
        };
    }
}

// ==================== 18. KHỞI TẠO ====================

document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    updateCartBadge();
    checkProtectedPageAccess();
    
    const pageName = window.location.pathname.split('/').pop() || 'homePage.html';
    
    // Khởi tạo sự kiện cho thanh bar
    setupBarEvents();
    
    // Gán sự kiến cho menu links (nếu menu đã tồn tại)
    attachMenuLinkEvents();
    
    // Shop New Arrivals Button
    const shopBtn = document.querySelector('.banner-content button');
    if (shopBtn) {
        shopBtn.onclick = () => {
            if (isLoggedIn()) {
                window.location.href = 'productdetail.html?id=1';
            } else {
                window.location.href = 'productdetailhomepage.html?id=1';
            }
        };
    }
    
    // Filter bar links (filter by sustainability trên trang)
    const filterLinks = document.querySelectorAll('.filter-bar a');
    filterLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            showToast('Đã lọc theo: ' + link.innerText, 'success');
        };
    });
    
    // ========== PAGE SPECIFIC ==========
    if (pageName === 'homePage.html') setTimeout(setupHomepageEvents, 500);
    if (pageName === 'user.html') setTimeout(setupUserHomepageEvents, 500);
    if (pageName === 'cart.html') loadCartPage();
    if (pageName === 'buynow.html') loadBuyNowPage();
    if (pageName === 'invoice.html') loadInvoicePage();
    if (pageName === 'invoicepdf.html') loadInvoicePDFPage();
    if (pageName === 'myprofile.html') loadUserProfile();
    if (pageName === 'productdetail.html') setTimeout(loadProductDetailPage, 300);
    if (pageName === 'productdetailhomepage.html') setTimeout(loadProductDetailPage, 300);
    if (pageName === 'login.html') setupLoginPage();
    if (pageName === 'login_admin.html') setupAdminLoginPage();
    if (pageName === 'admin_dashboard.html') setupAdminDashboardPage();
    if (pageName === 'register.html') setupRegisterPage();
    if (pageName === 'register_brand.html') setupRegisterBrand();
    if (pageName === 'register_recycler.html') setupRegisterRecycler();
    if (pageName === 'productEntry.html') setupProductEntryPage();
});

function triggerFileInput(index) {
    const fileInput = document.getElementById('fileInput' + index);
    if (fileInput) {
        fileInput.click();
    }
}

function handleImageUpload(index) {
    const fileInput = document.getElementById('fileInput' + index);
    const file = fileInput?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn tệp ảnh.', 'warning');
        return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('Kích thước ảnh không được vượt quá 5MB.', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        productEntryState.uploadedImages[index] = e.target.result;
        updateUploadGrid();
    };
    reader.readAsDataURL(file);
}

function updateUploadGrid() {
    const uploadGrid = document.getElementById('uploadGrid');
    if (!uploadGrid) return;

    uploadGrid.innerHTML = '';
    productEntryState.uploadedImages.forEach((image, index) => {
        if (image) {
            const img = document.createElement('img');
            img.src = image;
            img.style.cursor = 'pointer';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onclick = () => triggerFileInput(index);
            uploadGrid.appendChild(img);
        } else {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'upload-btn';
            button.textContent = 'Upload';
            button.onclick = () => triggerFileInput(index);
            uploadGrid.appendChild(button);
        }
    });
}

function getUploadedImages() {
    return productEntryState.uploadedImages.filter(Boolean);
}

function addDetails() {
    const colorPriceList = document.getElementById('colorPriceList');
    if (!colorPriceList) return;

    const colorPriceItem = document.createElement('div');
    colorPriceItem.className = 'color-price-item';
    colorPriceItem.innerHTML = `
        <input type="text" placeholder="Size" class="color-size" required>
        <input type="text" placeholder="Color" class="color-name" required>
        <input type="number" placeholder="Price" class="color-price" min="0" step="0.01" required>
        <input type="number" placeholder="Stock" class="color-stock" min="0" required>
        <button type="button" class="remove-color-btn">Remove</button>
    `;

    const removeBtn = colorPriceItem.querySelector('.remove-color-btn');
    if (removeBtn) {
        removeBtn.onclick = () => removeDetails(removeBtn);
    }
    colorPriceList.appendChild(colorPriceItem);
}

function removeDetails(button) {
    const colorPriceItem = button.parentElement;
    if (colorPriceItem) colorPriceItem.remove();
}

function getColorPriceStock() {
    const colorPriceItems = document.querySelectorAll('.color-price-item');
    const colors = [];

    colorPriceItems.forEach(item => {
        const size = item.querySelector('.color-size')?.value?.trim();
        const name = item.querySelector('.color-name')?.value?.trim();
        const price = item.querySelector('.color-price')?.value;
        const stock = item.querySelector('.color-stock')?.value;

        if (size && name && price !== undefined && stock !== undefined) {
            colors.push({
                size,
                name,
                price: parseFloat(price),
                stock: parseInt(stock, 10)
            });
        }
    });

    return colors;
}

function getProductVariants() {
    return getColorPriceStock().map(colorData => ({
        size: String(colorData.size || '').toUpperCase().trim(),
        color: String(colorData.name || '').trim(),
        price: Number(colorData.price) || 0,
        stock: Number(colorData.stock) || 0
    }));
}

function buildProductPayloadFromForm(currentUser) {

    const selects = document.querySelectorAll('select');

    const category =
        selects[0]?.value?.trim() || '';

    const origin =
        selects[1]?.value?.trim() || '';

    const uploadedImages = getUploadedImages();

    return {
        productName:
            document.querySelector(
                'input[placeholder="Enter product name"]'
            )?.value?.trim() || '',

        category,
        description:
            document.querySelector('textarea')
                ?.value?.trim() || '',

        origin,

        material:
            document.querySelector(
                'input[placeholder="Enter Base Material"]'
            )?.value?.trim() || '',

        recycled_ratio:
            Number(
                document.querySelector(
                    'input[placeholder="Enter Recycled ratio"]'
                )?.value
            ) || 0,

        blockchainQR:
            document.querySelector(
                'input[placeholder="Enter QR Blockchain Link"]'
            )?.value?.trim() || '',

        carbonFootprint:
            Number(
                document.querySelector(
                    'input[placeholder="Enter Carbon Footprint"]'
                )?.value
            ) || 0,

        certification:
            document.querySelector(
                'input[placeholder="Enter ESG Certification Name"]'
            )?.value?.trim() || '',

        variants: getProductVariants(),

        image: uploadedImages[0] || null,

        images: uploadedImages,

        brandID:
            currentUser.id
    };
}

function appendProductToLocalStorage(serverProduct) {

    const products =
        JSON.parse(
            localStorage.getItem('products') || '[]'
        );

    products.push(serverProduct);

    localStorage.setItem(
        'products',
        JSON.stringify(products)
    );

    return serverProduct;
}

function setupProductEntryPage() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'brand') {
        showToast('Chỉ tài khoản brand mới được truy cập trang này.', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    updateUploadGrid();

    const addColorBtn = document.querySelector('.add-color-btn');
    if (addColorBtn) {
        addColorBtn.onclick = addDetails;
    }

    const publishBtn = document.querySelector('.publish');
    if (publishBtn) {
        publishBtn.onclick = (e) => {
            e.preventDefault();
            saveProduct();
        };
    }
}

async function saveProduct() {

    const currentUser = getCurrentUser();

    if (!currentUser) {

        showToast(
            'Vui lòng đăng nhập.',
            'warning'
        );

        return;
    }

    if (currentUser.role !== 'brand') {

        showToast(
            'Chỉ tài khoản Brand mới được thêm sản phẩm.',
            'warning'
        );

        return;
    }

    const productData =
        buildProductPayloadFromForm(
            currentUser
        );

    if (!productData.productName) {

        showToast(
            'Vui lòng nhập tên sản phẩm.',
            'warning'
        );

        return;
    }

    if (
        !productData.variants ||
        productData.variants.length === 0
    ) {

        showToast(
            'Vui lòng thêm ít nhất 1 biến thể.',
            'warning'
        );

        return;
    }

    if (
        productData.recycled_ratio < 0 ||
        productData.recycled_ratio > 100
    ) {

        showToast(
            'Recycled ratio phải từ 0 đến 100.',
            'warning'
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${DATA_API_BASE}/products`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify(
                        productData
                    )
                }
            );

        const result =
            await response.json();

        if (!result.success) {

            showToast(
                result.message ||
                'Lưu sản phẩm thất bại',
                'error'
            );

            return;
        }

        appendProductToLocalStorage(
            result.product
        );

        console.log(
            'Product saved:',
            result.product
        );

        showToast(
            'Product saved successfully!',
            'success'
        );

    }
    catch(error) {

        console.error(error);

        showToast(
            'Cannot connect to server',
            'error'
        );
    }
}

// ========== MAKE FUNCTIONS GLOBAL ==========
window.addToCart = addToCart;
window.goToCart = goToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.toggleSelectAll = toggleSelectAll;
window.updateCartSummary = updateCartSummary;
window.proceedToCheckout = proceedToCheckout;
window.processBuyNowPayment = processBuyNowPayment;
window.logoutUser = logoutUser;
window.goToInvoicePDF = goToInvoicePDF;
window.downloadPDFInvoice = downloadPDFInvoice;
window.formatCurrency = formatCurrency;
window.applyFilterAndClose = applyFilterAndClose;
window.isLoggedIn = isLoggedIn;
window.requireLogin = requireLogin;
window.redirectToHomepage = redirectToHomepage;
window.toggleMenu = toggleMenu;
window.toggleFilter = toggleFilter;
window.toggleNotification = toggleNotification;
window.openLanguageModal = openLanguageModal;
window.closeLanguageModal = closeLanguageModal;
window.setLanguage = setLanguage;
window.openSupportModal = openSupportModal;
window.closeSupportModal = closeSupportModal;
window.startLiveChat = startLiveChat;
window.startZaloChat = startZaloChat;
window.checkPaymentInfoExists = checkPaymentInfoExists;
window.openPaymentInfoModal = openPaymentInfoModal;
window.closePaymentInfoModal = closePaymentInfoModal;
window.submitPaymentInfo = submitPaymentInfo;
window.formatCardNumber = formatCardNumber;
window.formatExpiryDate = formatExpiryDate;
window.triggerFileInput = triggerFileInput;
window.handleImageUpload = handleImageUpload;
window.updateUploadGrid = updateUploadGrid;
window.getUploadedImages = getUploadedImages;
window.addDetails = addDetails;
window.removeDetails = removeDetails;
window.getProductVariants = getProductVariants;
window.saveProduct = saveProduct;
