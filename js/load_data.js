function load_user(dataset_path, user_Table) 
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dataset_path, true); 
    xhr.send();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            // Parse JSON response
            var jsonData = JSON.parse(xhr.responseText);
            renderUser(jsonData, user_Table);
        }
        else
        {
            // handling when data can't be loaded
        }
    }
}
function renderUser(jsonData, user_Table)
{
    if (!user_Table)
    {
        return;
    }

    user_Table.innerHTML = "";

    var counts = {
        customer: 0,
        brand: 0,
        recycler: 0
    };

    for (var i = 0; i < jsonData.length; i++)
    {
        var group = jsonData[i];
        var roleName = "";
        var userList = [];

        if (group && Array.isArray(group.customers))
        {
            roleName = "customer";
            userList = group.customers;
        }
        else if (group && Array.isArray(group.brands))
        {
            roleName = "brand";
            userList = group.brands;
        }
        else if (group && Array.isArray(group.recyclers))
        {
            roleName = "recycler";
            userList = group.recyclers;
        }

        if (!userList || !userList.length)
        {
            continue;
        }

        counts[roleName] += userList.length;

        var tr_role = document.createElement("tr");
        var td_role = document.createElement("td");
        td_role.setAttribute("colspan", "5");
        td_role.innerHTML = `<strong>${roleName.toUpperCase()}</strong>`;
        tr_role.appendChild(td_role);
        user_Table.appendChild(tr_role);

        for (var j = 0; j < userList.length; j++)
        {
            var user = userList[j];

            var tr = document.createElement("tr");
            var td_id = document.createElement("td");
            var td_fullname = document.createElement("td");
            var td_username = document.createElement("td");
            var td_email = document.createElement("td");
            var td_delete = document.createElement("td");

            td_id.innerHTML = user.customerID || user.brandID || user.recyclerID || "";
            td_fullname.innerHTML = user.fullName || user.brandName || user.recyclerName || user.fullname || user.brandName || user.recyclerName || "";
            td_username.innerHTML = user.userName || user.username || "";
            td_email.innerHTML = user.email || "";

            var btnDelete = document.createElement("button");
            btnDelete.innerHTML = "Xóa";
            btnDelete.className = "btn-delete";
            td_delete.appendChild(btnDelete);

            tr.appendChild(td_id);
            tr.appendChild(td_fullname);
            tr.appendChild(td_username);
            tr.appendChild(td_email);
            tr.appendChild(td_delete);
            user_Table.appendChild(tr);
        }
    }

    var customerCountEl = document.getElementById("customerCount");
    var brandCountEl = document.getElementById("brandCount");
    var recyclerCountEl = document.getElementById("recyclerCount");

    if (customerCountEl) customerCountEl.textContent = counts.customer;
    if (brandCountEl) brandCountEl.textContent = counts.brand;
    if (recyclerCountEl) recyclerCountEl.textContent = counts.recycler;
}

function load_product(dataset_path, product_Table) 
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dataset_path, true); 
    xhr.send();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var jsonData = JSON.parse(xhr.responseText);
            renderProduct(jsonData, product_Table);
        }
    }
}

function normalizeProductBrandId(value)
{
    return String(value || "").trim().toUpperCase();
}

function renderProduct(jsonData, product_Table)
{
    if (!product_Table)
    {
        return;
    }

    var currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    var brandIds = [];

    if (currentUser)
    {
        brandIds = [
            currentUser.brandID,
            currentUser.brandId,
            currentUser.id,
            currentUser.customerID,
            currentUser.recyclerID
        ].filter(function(value) {
            return value;
        }).map(normalizeProductBrandId);
    }

    if (brandIds.length === 0)
    {
        product_Table.innerHTML = "";
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.setAttribute("colspan", "6");
        emptyCell.innerHTML = "Vui lòng đăng nhập bằng tài khoản brand";
        emptyRow.appendChild(emptyCell);
        product_Table.appendChild(emptyRow);
        return;
    }

    product_Table.innerHTML = "";
    var hasProduct = false;

    for (var i = 0; i < jsonData.length; i++)
    {
        var category = jsonData[i];
        var productList = [];

        if (category && Array.isArray(category.products))
        {
            productList = category.products;
        }

        for (var j = 0; j < productList.length; j++)
        {
            var product = productList[j];

            if (!product)
            {
                continue;
            }

            var productBrandId = normalizeProductBrandId(product.brandID || product.brandId || "");

            if (brandIds.indexOf(productBrandId) === -1)
            {
                continue;
            }

            hasProduct = true;

            var variants = Array.isArray(product.variants) ? product.variants : [];
            var totalStock = 0;

            for (var k = 0; k < variants.length; k++)
            {
                totalStock += Number(variants[k].stock) || 0;
            }

            var firstRow = document.createElement("tr");
            var td_id = document.createElement("td");
            var td_name = document.createElement("td");
            var td_size = document.createElement("td");
            var td_color = document.createElement("td");
            var td_price = document.createElement("td");
            var td_stock = document.createElement("td");
            var td_action = document.createElement("td");

            td_id.innerHTML = product.productID || "—";
            td_name.innerHTML = product.productName || product.name || "—";
            td_size.innerHTML = variants.length > 0 ? String(variants[0].size || "—").toUpperCase() : "—";
            td_color.innerHTML = variants.length > 0 ? (variants[0].color || "—") : "—";
            td_price.innerHTML = variants.length > 0 ? (Number(variants[0].price) || 0).toLocaleString("vi-VN") + " USD" : "—";
            td_stock.innerHTML = totalStock;

            var btnView = document.createElement("button");
            btnView.innerHTML = "View";
            btnView.className = "btn btn-view";
            btnView.onclick = function() {
                window.location.href = "productdetail.html";
            };
            td_action.appendChild(btnView);

            firstRow.appendChild(td_id);
            firstRow.appendChild(td_name);
            firstRow.appendChild(td_size);
            firstRow.appendChild(td_color);
            firstRow.appendChild(td_price);
            firstRow.appendChild(td_stock);
            firstRow.appendChild(td_action);
            product_Table.appendChild(firstRow);

            if (variants.length > 1)
            {
                for (var m = 1; m < variants.length; m++)
                {
                    var variantRow = document.createElement("tr");
                    var variantSize = document.createElement("td");
                    var variantColor = document.createElement("td");
                    var variantPrice = document.createElement("td");
                    var variantStock = document.createElement("td");
                    var variantEmpty = document.createElement("td");

                    variantSize.innerHTML = String(variants[m].size || "—").toUpperCase();
                    variantColor.innerHTML = variants[m].color || "—";
                    variantPrice.innerHTML = (Number(variants[m].price) || 0).toLocaleString("vi-VN") + " USD";
                    variantStock.innerHTML = Number(variants[m].stock) || 0;

                    variantRow.appendChild(document.createElement("td"));
                    variantRow.appendChild(document.createElement("td"));
                    variantRow.appendChild(variantSize);
                    variantRow.appendChild(variantColor);
                    variantRow.appendChild(variantPrice);
                    variantRow.appendChild(variantStock);
                    variantRow.appendChild(variantEmpty);
                    product_Table.appendChild(variantRow);
                }
            }
        }
    }

    if (!hasProduct)
    {
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.setAttribute("colspan", "6");
        emptyCell.innerHTML = "Không có sản phẩm nào";
        emptyRow.appendChild(emptyCell);
        product_Table.appendChild(emptyRow);
    }
}

function normalizeRecyclerId(value)
{
    return String(value || "").trim().toUpperCase();
}

function load_recycling_orders(dataset_path, orders_Table)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dataset_path, true);
    xhr.send();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var jsonData = JSON.parse(xhr.responseText);
            renderRecyclingOrders(jsonData, orders_Table);
        }
    }
}

function renderRecyclingOrders(jsonData, orders_Table)
{
    if (!orders_Table)
    {
        return;
    }

    var currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    var targetRecyclerIds = [];

    if (currentUser)
    {
        targetRecyclerIds = [
            currentUser.recyclerID,
            currentUser.recyclerId,
            currentUser.id
        ].filter(function(value) {
            return value;
        }).map(normalizeRecyclerId);
    }

    orders_Table.innerHTML = "";
    var hasOrder = false;

    for (var i = 0; i < jsonData.length; i++)
    {
        var entry = jsonData[i];

        if (!entry)
        {
            continue;
        }

        var entryRecyclerId = normalizeRecyclerId(entry.recyclerID || entry.recyclerId || "");

        if (targetRecyclerIds.length > 0 && targetRecyclerIds.indexOf(entryRecyclerId) === -1)
        {
            continue;
        }

        var orders = Array.isArray(entry.recycling_orders) ? entry.recycling_orders : [];

        for (var j = 0; j < orders.length; j++)
        {
            var order = orders[j] || {};
            var products = Array.isArray(order.products) ? order.products : [];

            for (var k = 0; k < products.length; k++)
            {
                var product = products[k] || {};
                hasOrder = true;

                var tr = document.createElement("tr");
                var tdOrderId = document.createElement("td");
                var tdProductId = document.createElement("td");
                var tdProductName = document.createElement("td");
                var tdQuantity = document.createElement("td");
                var tdOrderDate = document.createElement("td");
                var tdStatus = document.createElement("td");

                tdOrderId.innerHTML = order.orderID || "—";
                tdProductId.innerHTML = product.productID || "—";
                tdProductName.innerHTML = product.productName || "—";
                tdQuantity.innerHTML = Number(product.quantity) || 0;
                tdOrderDate.innerHTML = order.orderDate || "—";
                tdStatus.innerHTML = order.status || "—";

                tr.appendChild(tdOrderId);
                tr.appendChild(tdProductId);
                tr.appendChild(tdProductName);
                tr.appendChild(tdQuantity);
                tr.appendChild(tdOrderDate);
                tr.appendChild(tdStatus);
                orders_Table.appendChild(tr);
            }
        }
    }

    if (!hasOrder)
    {
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.setAttribute("colspan", "6");
        emptyCell.innerHTML = "Không có đơn tái chế nào";
        emptyRow.appendChild(emptyCell);
        orders_Table.appendChild(emptyRow);
    }
}
