const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const DATASET_DIR = path.join(__dirname, '..', 'datasets');
const PRODUCTS_FILE = path.join(DATASET_DIR, 'products.json');
const USERS_FILE = path.join(DATASET_DIR, 'users.json');
const ORDERS_FILE = path.join(DATASET_DIR, 'orders.json');
const ADMINS_FILE = path.join(DATASET_DIR, 'admin.json');

app.use(cors());
app.use(express.json({ limit: '20mb' }));

function readJsonFile(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Failed to read ${filePath}:`, error.message);
        return fallback;
    }
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getProducts() {
    return readJsonFile(PRODUCTS_FILE, []);
}

function getUsers() {
    return readJsonFile(USERS_FILE, []);
}

function getOrders() {
    return readJsonFile(ORDERS_FILE, []);
}

function getAdmins() {
    return readJsonFile(ADMINS_FILE, { admins: [] });
}

function saveUsers(users) {
    const groups = extractRoleGroups(users);

    writeJsonFile(USERS_FILE, [
        {
            customers: groups.customers
        },
        {
            brands: groups.brands
        },
        {
            recyclers: groups.recyclers
        }
    ]);
}

function generateCustomerID(records, prefix) {
    let max = 0;

    records.forEach(record => {
        let id = '';

        if (prefix === 'CM') id = record.customerID;
        if (prefix === 'BR') id = record.brandID;
        if (prefix === 'RC') id = record.recyclerID;

        const num = parseInt(String(id || '').replace(prefix, ''), 10);

        if (!isNaN(num) && num > max) {
            max = num;
        }
    });

    return prefix + String(max + 1).padStart(6, '0');
}

function stripRoleFromRecord(record) {
    if (!record || typeof record !== 'object') {
        return record;
    }

    const { role, ...cleaned } = record;
    return cleaned;
}

function extractRoleGroups(users) {
    if (!Array.isArray(users)) {
        return { customers: [], brands: [], recyclers: [] };
    }

    const customers = [];
    const brands = [];
    const recyclers = [];

    for (const group of users) {
        if (Array.isArray(group.customers)) {
            customers.push(...group.customers.map(stripRoleFromRecord));
        }
        if (Array.isArray(group.brands)) {
            brands.push(...group.brands.map(stripRoleFromRecord));
        }
        if (Array.isArray(group.recyclers)) {
            recyclers.push(...group.recyclers.map(stripRoleFromRecord));
        }
    }

    return { customers, brands, recyclers };
}

function getOrCreateGroup(usersData, key) {
    let group = usersData.find(item => Array.isArray(item[key]));
    if (!group) {
        group = { [key]: [] };
        usersData.push(group);
    }
    return group;
}

function toBootstrapFormat() {
    const roleGroups = extractRoleGroups(getUsers());

    return {
        products: getProducts(),
        users: [
            { customers: roleGroups.customers },
            { brands: roleGroups.brands },
            { recyclers: roleGroups.recyclers }
        ],
        orders: getOrders()
    };
}

function flattenUsers(users) {
    const groups = extractRoleGroups(users);
    return [
        ...groups.customers.map(user => ({ ...stripRoleFromRecord(user), role: 'customer' })),
        ...groups.brands.map(user => ({ ...stripRoleFromRecord(user), role: 'brand' })),
        ...groups.recyclers.map(user => ({ ...stripRoleFromRecord(user), role: 'recycler' }))
    ];
}

function generateProductID(products) {
    const usedNumbers = new Set();

    products.forEach(category => {
        if (Array.isArray(category.products)) {
            category.products.forEach(product => {
                const productID = String(product.productID || '').trim();
                const match = productID.match(/^PR(\d+)$/i);

                if (match) {
                    usedNumbers.add(parseInt(match[1], 10));
                }
            });
        }
    });

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
        nextNumber += 1;
    }

    return `PR${String(nextNumber).padStart(6, '0')}`;
}

function getCategoryByName(categories, categoryName) {
    const normalizedName = String(categoryName || '').trim();

    if (!normalizedName) {
        if (categories.length > 0) {
            return categories[0];
        }
        const fallbackCategory = { CateID: 'C1', CateName: 'Uncategorized', products: [] };
        categories.push(fallbackCategory);
        return fallbackCategory;
    }

    let category = categories.find(cat =>
        String(cat.CateName || '').trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (category) {
        return category;
    }

    const nextIndex = categories.reduce((max, cat) => {
        const id = String(cat.CateID || '').replace(/^C/i, '');
        const num = parseInt(id, 10);
        return Number.isFinite(num) ? Math.max(max, num) : max;
    }, 0) + 1;

    category = {
        CateID: `C${String(nextIndex).padStart(1, '0')}`,
        CateName: normalizedName,
        products: []
    };

    categories.push(category);
    return category;
}

function normalizePrice(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

app.get('/api/bootstrap', (req, res) => {
    res.json(toBootstrapFormat());
});

app.get('/api/products', (req, res) => {
    res.json(getProducts());
});

app.post('/api/products', (req, res) => {

    try {

        if (!req.body.brandID) {

            return res.status(400).json({
                success: false,
                message: 'brandID is required'
            });
        }

        const categories =
            Array.isArray(getProducts())
                ? getProducts()
                : [];

        const category =
            getCategoryByName(
                categories,
                req.body.category ||
                req.body.CateName ||
                req.body.categoryName
            );

        if (!category) {

            return res.status(400).json({
                success: false,
                message: 'Category not found'
            });
        }

        const generatedProductID =
            generateProductID(categories);

        const variants =
            Array.isArray(req.body.variants)
                ? req.body.variants
                : [];

        const normalizedVariants =
            variants.map(variant => ({

                size: String(
                    variant.size || ''
                ).toUpperCase().trim(),

                color: String(
                    variant.color || ''
                ).trim(),

                price: String(
                    normalizePrice(
                        variant.price
                    )
                ),

                stock:
                    normalizePrice(
                        variant.stock
                    )
            }));

        const newProduct = {

            productID:
                generatedProductID,

            productName:
                String(
                    req.body.productName || ''
                ).trim(),

            image:
                Array.isArray(
                    req.body.images
                )
                    ? req.body.images[0] || null
                    : req.body.image || null,

            material:
                String(
                    req.body.material || ''
                ).trim(),

            origin:
                String(
                    req.body.origin || ''
                ).trim(),

            brandID:
                String(
                    req.body.brandID
                ).trim(),

            certification:
                String(
                    req.body.certification || ''
                ).trim(),

            carbonFootprint:
                normalizePrice(
                    req.body.carbonFootprint
                ),

            recycled_ratio:
                normalizePrice(
                    req.body.recycled_ratio
                ),

            blockchainQR:
                String(
                    req.body.blockchainQR || ''
                ).trim(),

            description:
                req.body.description || null,

            variants:
                normalizedVariants
        };

        if (!Array.isArray(category.products)) {
            category.products = [];
        }

        category.products.push(
            newProduct
        );

        writeJsonFile(
            PRODUCTS_FILE,
            categories
        );

        res.json({
            success: true,
            product: newProduct
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/admins', (req, res) => {
    try {
        const adminData = getAdmins();
        res.json({ success: true, admins: adminData.admins || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/admins/login', (req, res) => {
    try {
        const adminID = String(req.body.adminID || '').trim();
        const password = String(req.body.password || '').trim();

        if (!adminID || !password) {
            return res.status(400).json({ success: false, message: 'Admin ID và mật khẩu là bắt buộc' });
        }

        const adminData = getAdmins();
        const admin = (adminData.admins || []).find(
            a => String(a.adminID || '').trim() === adminID &&
                (String(a.passwords || '').trim() === password || String(a.password || '').trim() === password)
        );

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin ID hoặc mật khẩu không đúng' });
        }

        res.json({
            success: true,
            admin: {
                adminID: admin.adminID,
                fullName: admin.fullName || admin.userName || '',
                userName: admin.userName || '',
                email: admin.email || '',
                phoneNumber: admin.phoneNumber || '',
                role: 'admin'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/customers/register', (req, res) => {
    try {
        const usersData = getUsers();

        const role = String(
            req.body.role || 'customer'
        ).toLowerCase();

        const username = String(
            req.body.username || ''
        ).trim();

        const password = String(
            req.body.password || ''
        ).trim();

        if (!username || !password) {
            return res.json({
                success: false,
                message: 'Thiếu thông tin đăng ký'
            });
        }

        //--------------------------------u
        // CHECK USERNAME
        //--------------------------------

        const allUsers = [];

        usersData.forEach(group => {
            if (Array.isArray(group.customers)) allUsers.push(...group.customers);
            if (Array.isArray(group.brands)) allUsers.push(...group.brands);
            if (Array.isArray(group.recyclers)) allUsers.push(...group.recyclers);
        });

        const existed = allUsers.some(
            user =>
                String(user.userName)
                    .toLowerCase() ===
                username.toLowerCase()
        );

        if (existed) {
            return res.json({
                success: false,
                message: 'Username đã tồn tại'
            });
        }

        //--------------------------------
        // CUSTOMER
        //--------------------------------

        if (role === 'customer') {
            const customerGroup = getOrCreateGroup(usersData, 'customers');

            const nextID =
                generateCustomerID(
                    customerGroup.customers,
                    'CM'
                );

            const customer = {
                customerID: nextID,
                fullName:
                    req.body.fullname || '',
                userName: username,
                email:
                    req.body.email || '',
                phoneNumber:
                    req.body.phone || '',
                passwords: password,
                join_date: new Date().toISOString().split('T')[0],
                address:
                    req.body.address || '',
                bank_name:
                    req.body.bankname || '',
                bank_account:
                    req.body.bankaccount || '',
                eco_point: 0,
                tier: 'Bronze Member'
            };

            if (!customerGroup.customers) customerGroup.customers = [];
            customerGroup.customers.push(customer);
        }

        //--------------------------------
        // BRAND
        //--------------------------------

        if (role === 'brand') {
            const brandGroup = getOrCreateGroup(usersData, 'brands');

            const nextID =
                generateCustomerID(
                    brandGroup.brands,
                    'BR'
                );

            const brand = {
                brandID: nextID,
                brandName:
                    req.body.brandname || '',
                userName: username,
                email:
                    req.body.brandemail || '',
                phoneNumber:
                    req.body.brandphone || '',
                passwords: password,
                join_date:
                    new Date()
                        .toISOString()
                        .split('T')[0],
                address:
                    req.body.brandaddress || '',
                bank_name:
                    req.body.bankname || '',
                bank_account:
                    req.body.bankaccount || '',
                tax_code:
                    req.body.taxcode || '',
                legal_rep:
                    req.body.legalrep || ''
            };

            if (!brandGroup.brands) brandGroup.brands = [];
            brandGroup.brands.push(brand);
        }

        //--------------------------------
        // RECYCLER
        //--------------------------------

        if (role === 'recycler') {
            const recyclerGroup = getOrCreateGroup(usersData, 'recyclers');

            const nextID =
                generateCustomerID(
                    recyclerGroup.recyclers,
                    'RC'
                );

            const recycler = {
                recyclerID: nextID,
                recyclerName:
                    req.body.recyclername || '',
                userName: username,
                email:
                    req.body.recycleremail || '',
                phoneNumber:
                    req.body.recyclerphone || '',
                passwords: password,
                join_date:
                    new Date()
                        .toISOString()
                        .split('T')[0],
                address:
                    req.body.recycleraddress || '',
                bank_name:
                    req.body.bankname || '',
                bank_account:
                    req.body.bankaccount || '',
                tax_code:
                    req.body.taxcode || '',
                legal_rep:
                    req.body.legalrep || ''
            };

            if (!recyclerGroup.recyclers) recyclerGroup.recyclers = [];
            recyclerGroup.recyclers.push(recycler);
        }

        //--------------------------------
        // SAVE FILE
        //--------------------------------

        writeJsonFile(
            USERS_FILE,
            usersData.map(group => {
                const result = {};
                if (Array.isArray(group.customers)) result.customers = group.customers;
                if (Array.isArray(group.brands)) result.brands = group.brands;
                if (Array.isArray(group.recyclers)) result.recyclers = group.recyclers;
                return result;
            })
        );

        res.json({
            success: true,
            message: 'Đăng ký thành công'
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/customers', (req, res) => {
    try {
        const users = flattenUsers(getUsers());
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/debug/users-file', (req, res) => {
    try {
        const users = getUsers();
        res.json({ filePath: USERS_FILE, fileExists: fs.existsSync(USERS_FILE), fileSize: JSON.stringify(users).length, content: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
