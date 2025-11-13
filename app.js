        // --- Data keys ---
        const STORAGE_KEYS = {
            menu: "rb_menu_items_v1",
            cart: "rb_cart_v1",
            sales: "rb_sales_v1",
            upi: "rb_upi_id_v1",
            payeeName: "rb_payee_name_v1",
            aid: "rb_aid_v1",
            mc: "rb_mc_v1",
            tr: "rb_tr_v1"
        };

        // --- Default menu ---
        const DEFAULT_MENU = [
            { id: cryptoRandomId(), name: "Tea", price: 12, category: "Beverages", image: "https://media.istockphoto.com/id/1145169012/photo/many-idli-or-idly-and-coconut-chutney-south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=eaGheWxdd81VAxCdpaBaM9BV4-3601dJ-8gr9yP1B4A=" },
            { id: cryptoRandomId(), name: "Coffee", price: 20, category: "Beverages", image: "https://placehold.co/600x400/FFF/333?text=Coffee" },
            { id: cryptoRandomId(), name: "Idly", price: 30, category: "Breakfast", image: "https://placehold.co/600x400/FFF/333?text=Idly" },
            { id: cryptoRandomId(), name: "Dosa", price: 50, category: "Breakfast", image: "https://placehold.co/600x400/FFF/333?text=Dosa" },
            { id: cryptoRandomId(), name: "Poori", price: 45, category: "Breakfast", image: "https://placehold.co/600x400/FFF/333?text=Poori" },
            { id: cryptoRandomId(), name: "Pongal", price: 40, category: "Breakfast", image: "https://placehold.co/600x400/FFF/333?text=Pongal" },
            { id: cryptoRandomId(), name: "Vada", price: 25, category: "Snacks", image: "https://placehold.co/600x400/FFF/333?text=Vada" }
        ];

        // --- In-memory state ---
        let menuItems = loadFromStorage(STORAGE_KEYS.menu, DEFAULT_MENU);
        let cartItems = loadFromStorage(STORAGE_KEYS.cart, []);
        let sales = loadFromStorage(STORAGE_KEYS.sales, []); // array of orders
        let upiIdStored = loadFromStorage(STORAGE_KEYS.upi, "");
        let payeeNameStored = loadFromStorage(STORAGE_KEYS.payeeName, "");
        let aidStored = loadFromStorage(STORAGE_KEYS.aid, "");
        let mcStored = loadFromStorage(STORAGE_KEYS.mc, "");
        let trStored = loadFromStorage(STORAGE_KEYS.tr, "");
        let currentInvoiceOrder = null;

        // --- OPTIMIZATION: Cache for frequently accessed DOM elements ---
        const DOM = {};

        // --- App init ---
        function initializeApp() {
            cacheDOMElements();
            initNavigation();
            initMenuView();
            initCartActions();
            initManageView();
            initReportsView();
            initInvoicesView();
            initSettingsView();
            renderMenu();
            renderCart();
            // Set default view
            switchView("shop");
        }

        // --- OPTIMIZATION: Find all elements once and store them ---
        function cacheDOMElements() {
            // Views
            DOM.views = document.querySelectorAll(".view");
            DOM.navButtons = document.querySelectorAll(".nav-btn");
            // Menu
            DOM.menuGrid = document.getElementById("menu-grid");
            DOM.menuSearch = document.getElementById("menu-search");
            // Cart
            DOM.cartItemsList = document.getElementById("cart-items");
            DOM.subtotal = document.getElementById("subtotal");
            DOM.grandTotal = document.getElementById("grand-total");
            DOM.clearCartBtn = document.getElementById("clear-cart");
            DOM.clearCartBtn2 = document.getElementById("clear-cart-2"); // Added second clear button
            DOM.payNowBtn = document.getElementById("pay-now");
            // QR Modal
            DOM.qrModal = document.getElementById("qr-modal");
            DOM.qrCodeDiv = document.getElementById("qr-code");
            DOM.qrAmountDiv = document.getElementById("qr-amount");
            DOM.closeQrBtn = document.getElementById("close-qr");
            DOM.markPaidBtn = document.getElementById("mark-paid");
            // Manage Menu
            DOM.manageForm = document.getElementById("menu-form");
            DOM.manageResetBtn = document.getElementById("reset-form");
            DOM.manageSearch = document.getElementById("manage-search");
            DOM.manageList = document.getElementById("manage-list");
            DOM.itemId = document.getElementById("item-id");
            DOM.itemName = document.getElementById("item-name");
            DOM.itemPrice = document.getElementById("item-price");
            DOM.itemImage = document.getElementById("item-image");
            DOM.itemCategory = document.getElementById("item-category");
            // Reports
            DOM.reportMonth = document.getElementById("report-month");
            DOM.loadReportBtn = document.getElementById("load-report");
            DOM.reportSummary = document.getElementById("report-summary");
            DOM.reportTable = document.getElementById("report-table");
            // Invoices
            DOM.invoiceList = document.getElementById("invoice-list");
            DOM.invoiceModal = document.getElementById("invoice-modal");
            DOM.invoiceContent = document.getElementById("invoice-content");
            DOM.closeInvoiceBtn = document.getElementById("close-invoice");
            DOM.printInvoiceBtn = document.getElementById("print-invoice");
            // Print Area (hidden)
            DOM.printArea = document.getElementById("print-area");
            DOM.billItems = document.getElementById("bill-items");
            DOM.billTotals = document.getElementById("bill-totals");
            DOM.billDate = document.getElementById("bill-date");
            // Settings
            DOM.settingsForm = document.getElementById("upi-settings-form");
            DOM.upiId = document.getElementById("upi-id");
            DOM.payeeName = document.getElementById("payee-name");
            DOM.upiAid = document.getElementById("upi-aid");
            DOM.upiMc = document.getElementById("upi-mc");
            DOM.upiTr = document.getElementById("upi-tr");
            DOM.currentUpiConfig = document.getElementById("current-upi-config");
        }

        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener("DOMContentLoaded", initializeApp);
        } else {
            initializeApp();
        }

        // --- Custom Alert ---
        function showCustomAlert(message, type = 'info') {
            // In a real app, you'd create a proper modal here.
            // For now, we use the browser's alert.
            console.log(`ALERT (${type}): ${message}`);
            alert(message);
        }
        
        // --- Custom Confirm ---
        function showCustomConfirm(message, callback) {
            // In a real app, you'd create a proper modal here.
            // For now, we use the browser's confirm.
            const result = confirm(message);
            callback(result);
        }


        // --- Navigation ---
        function initNavigation() {
            DOM.navButtons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    const view = btn.getAttribute("data-view");
                    switchView(view);
                });
            });
        }
        function switchView(view) {
            // Update active button
            DOM.navButtons.forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-view") === view);
            });
            
            // Show/Hide views
            DOM.views.forEach((v) => v.classList.remove("active"));
            const activeView = document.querySelector(`#view-${view}`);
            if (activeView) {
                activeView.classList.add("active");
            }
            
            // Refresh data on view load
            if (view === "settings") {
                updateSettingsDisplay();
            } else if (view === "manage") {
                renderManageList();
            } else if (view === "invoices") {
                renderInvoicesList();
            } else if (view === "reports") {
                renderReport();
            }
        }

        // --- Menu rendering and interactions ---
        function initMenuView() {
            DOM.menuSearch.addEventListener("input", renderMenu);

            // --- OPTIMIZATION: Event Delegation ---
            // Listen for clicks on the grid, not on individual buttons
            DOM.menuGrid.addEventListener("click", (e) => {
                const btn = e.target.closest(".add-btn");
                if (!btn) return; // Click wasn't on an "Add" button

                const id = btn.dataset.id;
                const item = menuItems.find((x) => x.id === id);
                if (item) {
                    addToCart(item.id, 1);
                }
            });
        }
        function renderMenu() {
            const q = DOM.menuSearch.value.trim().toLowerCase();
            const filtered = menuItems.filter((m) => m.name.toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q));
            
            if (filtered.length === 0) {
                DOM.menuGrid.innerHTML = `<div style="color: var(--muted); padding: 12px; grid-column: 1 / -1;">No items found.</div>`;
                return;
            }
            
            DOM.menuGrid.innerHTML = filtered.map((m) => `
                <div class="card">
                    <img src="${escapeHtml(m.image || '')}" alt="${escapeHtml(m.name)}" onerror="this.src='https://placehold.co/600x400/eee/999?text=${encodeURIComponent(m.name)}'"/>
                    <div class="card-body">
                        <div>
                            <div class="card-title">${escapeHtml(m.name)}</div>
                            <div class="muted" style="color: var(--muted); font-size: 12px;">${escapeHtml(m.category || "Uncategorized")}</div>
                        </div>
                        <div class="price">₹${formatMoney(m.price)}</div>
                        <button class="add-btn" data-id="${m.id}">Add</button>
                    </div>
                </div>
            `).join("");
        }

        // --- Cart ---
        function initCartActions() {
            const clearCartHandler = () => {
                 if (cartItems.length === 0) return;
                 showCustomConfirm("Are you sure you want to clear the cart?", (didConfirm) => {
                    if (didConfirm) {
                        cartItems = [];
                        saveToStorage(STORAGE_KEYS.cart, cartItems);
                        renderCart();
                    }
                 });
            };
            
            DOM.clearCartBtn.addEventListener("click", clearCartHandler);
            DOM.clearCartBtn2.addEventListener("click", clearCartHandler);
            
            DOM.payNowBtn.addEventListener("click", onPayNow);

            // --- OPTIMIZATION: Event Delegation for cart buttons ---
            DOM.cartItemsList.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-act]");
                if (!btn) return;

                const id = btn.dataset.id;
                const act = btn.dataset.act;
                const item = cartItems.find((c) => c.menuId === id);
                
                if (act === "dec") {
                    if (item) updateQty(id, item.qty - 1);
                } else if (act === "inc") {
                    if (item) updateQty(id, item.qty + 1);
                } else if (act === "rm") {
                    removeFromCart(id);
                }
            });

            // --- OPTIMIZATION: Event Delegation for cart inputs ---
            DOM.cartItemsList.addEventListener("change", (e) => {
                const input = e.target;
                if (input.tagName === 'INPUT' && input.type === "number" && input.dataset.id) {
                    updateQty(input.dataset.id, Number(input.value));
                }
            });
        }
        function addToCart(menuId, qty) {
            const menuItem = menuItems.find((m) => m.id === menuId);
            if (!menuItem) return;
            const existing = cartItems.find((c) => c.menuId === menuId);
            if (existing) {
                existing.qty += qty;
            } else {
                cartItems.push({ menuId, name: menuItem.name, price: menuItem.price, qty });
            }
            saveToStorage(STORAGE_KEYS.cart, cartItems);
            renderCart();
        }
        function updateQty(menuId, qty) {
            const item = cartItems.find((c) => c.menuId === menuId);
            if (!item) return;
            if (qty < 1) {
                // If quantity drops below 1, remove the item
                removeFromCart(menuId);
            } else {
                item.qty = qty;
                saveToStorage(STORAGE_KEYS.cart, cartItems);
                renderCart();
            }
        }
        function removeFromCart(menuId) {
            cartItems = cartItems.filter((c) => c.menuId !== menuId);
            saveToStorage(STORAGE_KEYS.cart, cartItems);
            renderCart();
        }
        function calcTotals() {
            const subtotal = cartItems.reduce((sum, it) => sum + it.price * it.qty, 0);
            const tax = 0; // Tax removed
            const grand = +(subtotal + tax).toFixed(2);
            return { subtotal, tax, grand };
        }
        function renderCart() {
            if (cartItems.length === 0) {
                DOM.cartItemsList.innerHTML = `<div style="color: var(--muted); padding: 8px; text-align: center;">Cart is empty.</div>`;
            } else {
                DOM.cartItemsList.innerHTML = cartItems.map((c) => `
                    <div class="cart-item">
                        <div><strong>${escapeHtml(c.name)}</strong><div style="color: var(--muted); font-size: 12px;">₹${formatMoney(c.price)}</div></div>
                        <div class="qty">
                            <button data-act="dec" data-id="${c.menuId}">−</button>
                            <input type="number" min="1" value="${c.qty}" data-id="${c.menuId}" />
                            <button data-act="inc" data-id="${c.menuId}">+</button>
                        </div>
                        <div>₹${formatMoney(c.price * c.qty)}</div>
                        <button class="remove-btn" data-act="rm" data-id="${c.menuId}">Remove</button>
                    </div>
                `).join("");
            }
            const { subtotal, tax, grand } = calcTotals();
            DOM.subtotal.textContent = `₹${formatMoney(subtotal)}`;
            DOM.grandTotal.textContent = `₹${formatMoney(grand)}`;
        }

        // --- UPI QR Code Generation ---
        function validateUpiId(upiId) {
            if (!upiId || typeof upiId !== 'string') return false;
            const trimmed = upiId.trim();
            if (trimmed.length < 5 || trimmed.length > 256) return false;
            // Basic regex: something@something
            const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-]{2,64}$/;
            return upiPattern.test(trimmed) && trimmed.includes('@');
        }

        function validateAmount(amount) {
            if (typeof amount !== 'number' && typeof amount !== 'string') return false;
            const num = parseFloat(amount);
            return !isNaN(num) && num > 0 && num <= 10000000;
        }

        function generateUpiLink(upiId, payeeName, amount, aid, mc, tr) {
            const params = new URLSearchParams();
            params.set('pa', upiId.trim());
            params.set('pn', payeeName.trim());
            params.set('am', Number(amount).toFixed(2));
            params.set('cu', 'INR');
            if (aid) params.set('aid', aid.trim());
            if (mc) params.set('mc', mc.trim());
            if (tr) params.set('tr', tr.trim() || `order-${Date.now()}`); // Add a default TR if empty
            
            return `upi://pay?${params.toString()}`;
        }

        /**
        * [OPTIMIZED FUNCTION]
        * Generates a QR code using qrcode.js if available.
        */
        function generateQrCode(upiLink, targetElement) {
            // Clear the target element first
            targetElement.innerHTML = ''; 

            return new Promise((resolve, reject) => {
                
                // --- Primary Method: Use qrcode.js (local library) ---
                if (typeof QRCode !== 'undefined') {
                    try {
                        console.log('Attempting QR generation with qrcode.js');
                        
                        new QRCode(targetElement, {
                            text: upiLink,
                            width: 300,
                            height: 300,
                            colorDark: '#000000',
                            colorLight: '#ffffff',
                            correctLevel: QRCode.CorrectLevel.H
                        });

                        // Check for canvas, img, or table output
                        const qrRender = targetElement.querySelector('canvas, img, table');
                        
                        if (qrRender) {
                            console.log('✅ QR generated successfully via qrcode.js');
                            if (qrRender.style) {
                                 qrRender.style.maxWidth = '100%';
                                 qrRender.style.height = 'auto';
                                 qrRender.style.display = 'block';
                                 qrRender.style.margin = '0 auto';
                            }
                            resolve(true);
                            return; // Done
                        } else {
                            throw new Error('qrcode.js ran but produced no output.');
                        }

                    } catch (err) {
                        console.warn('qrcode.js failed.', err);
                        reject(err); // Reject if qrcode.js fails
                    }
                } else {
                    console.error('QRCode.js library not found.');
                    reject(new Error('QRCode.js library not found.'));
                }
            });
        }


        // --- Pay Now (QR) ---
        async function onPayNow() {
            if (cartItems.length === 0) {
                showCustomAlert("Cart is empty.");
                return;
            }

            if (!upiIdStored || !payeeNameStored) {
                showCustomAlert("Please configure UPI settings first. Go to Settings and enter your UPI ID and Payee Name.");
                switchView("settings");
                return;
            }

            const { grand } = calcTotals();
            
            // Reset QR area
            DOM.qrCodeDiv.innerHTML = "<div style='text-align:center; color:#999;'>Generating QR code...</div>";
            DOM.qrAmountDiv.textContent = "";

            if (DOM.qrCodeDiv.dataset.generating === "true") return;
            DOM.qrCodeDiv.dataset.generating = "true";
            
            DOM.payNowBtn.disabled = true;

            try {
                const upiLink = generateUpiLink(
                    upiIdStored,
                    payeeNameStored,
                    grand,
                    aidStored,
                    mcStored,
                    trStored
                );
                DOM.qrAmountDiv.textContent = `Amount: ₹${Number(grand).toFixed(2)}`;
                console.log('Generated UPI link:', upiLink);

                await generateQrCode(upiLink, DOM.qrCodeDiv);
                console.log("✅ QR Generated for:", upiLink);

            } catch (error) {
                console.error("QR generation error:", error);
                DOM.qrCodeDiv.innerHTML = `<div style='padding:20px;color:#ff4444;text-align:center;'>Error: ${escapeHtml(error.message)}. Please ensure you are connected to the internet and the qrcode.js library is loaded.</div>`;
            } finally {
                delete DOM.qrCodeDiv.dataset.generating;
                DOM.payNowBtn.disabled = false; // Re-enable cached button
            }

            // Modal Control
            DOM.qrModal.classList.add("show");

            DOM.closeQrBtn.onclick = () => {
                DOM.qrModal.classList.remove("show");
                DOM.qrCodeDiv.innerHTML = ""; // Clear QR
            };

            DOM.markPaidBtn.onclick = () => {
                recordSale();
                cartItems = [];
                saveToStorage(STORAGE_KEYS.cart, cartItems);
                renderCart();
                DOM.qrModal.classList.remove("show");
                showCustomAlert("Payment recorded successfully!");
            };
        }


        // --- Prepare print area from a given order ---
        function populatePrintAreaFromOrder(order) {
            if (!DOM.billDate || !DOM.billItems || !DOM.billTotals) return;
            DOM.billDate.textContent = new Date(order.date).toLocaleString();
            DOM.billItems.innerHTML = order.items.map((c) => `
                <div class="item-row"><span>${escapeHtml(c.name)} × ${c.qty}</span><span>₹${formatMoney(c.price * c.qty)}</span></div>
            `).join("");
            DOM.billTotals.innerHTML = `
                <div class="item-row"><span>Subtotal</span><span>₹${formatMoney(order.subtotal)}</span></div>
                <div class="item-row" style="font-weight:700;"><span>Total</span><span>₹${formatMoney(order.total)}</span></div>
            `;
        }

        // --- Record sale to storage ---
        function recordSale() {
            const { subtotal, tax, grand } = calcTotals();
            const order = {
                id: cryptoRandomId(),
                date: new Date().toISOString(),
                items: cartItems.map((c) => ({ name: c.name, price: c.price, qty: c.qty })),
                subtotal,
                tax,
                total: grand
            };
            sales.push(order);
            saveToStorage(STORAGE_KEYS.sales, sales);
            
            // refresh invoices view if open
            if (DOM.invoiceList && document.getElementById('view-invoices').classList.contains('active')) {
                renderInvoicesList();
            }
        }

        // --- Manage Menu CRUD ---
        function initManageView() {
            DOM.manageForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const id = DOM.itemId.value;
                const name = DOM.itemName.value.trim();
                const price = Number(DOM.itemPrice.value);
                const image = DOM.itemImage.value.trim(); // Can be empty
                const category = DOM.itemCategory.value.trim();
                
                if (!name || price <= 0) {
                    showCustomAlert("Please provide valid Name and Price.");
                    return;
                }
                
                if (id) {
                    const idx = menuItems.findIndex((m) => m.id === id);
                    if (idx >= 0) {
                        menuItems[idx] = { ...menuItems[idx], name, price, image, category };
                    }
                } else {
                    menuItems.push({ id: cryptoRandomId(), name, price, image, category });
                }
                saveToStorage(STORAGE_KEYS.menu, menuItems);
                DOM.manageForm.reset();
                DOM.itemId.value = "";
                renderMenu();
                renderManageList();
            });

            DOM.manageResetBtn.addEventListener("click", () => {
                DOM.manageForm.reset();
                DOM.itemId.value = "";
            });

            DOM.manageSearch.addEventListener("input", renderManageList);

            // --- OPTIMIZATION: Event Delegation for Manage List ---
            DOM.manageList.addEventListener("click", (e) => {
                const editBtn = e.target.closest(".edit-btn");
                const delBtn = e.target.closest(".del-btn");

                if (editBtn) {
                    const id = editBtn.dataset.id;
                    const item = menuItems.find((x) => x.id === id);
                    if (!item) return;
                    DOM.itemId.value = item.id;
                    DOM.itemName.value = item.name;
                    DOM.itemPrice.value = item.price;
                    DOM.itemImage.value = item.image || "";
                    DOM.itemCategory.value = item.category || "";
                    DOM.manageForm.scrollIntoView({ behavior: 'smooth' }); // Scroll to form
                }

                if (delBtn) {
                    const id = delBtn.dataset.id;
                    const item = menuItems.find((x) => x.id === id);
                    if (!item) return;
                    
                    showCustomConfirm(`Are you sure you want to delete "${item.name}"?`, (didConfirm) => {
                        if (didConfirm) {
                            menuItems = menuItems.filter((m) => m.id !== id);
                            saveToStorage(STORAGE_KEYS.menu, menuItems);
                            renderMenu();
                            renderManageList();
                            // If item was being edited, reset form
                            if (DOM.itemId.value === id) {
                                DOM.manageForm.reset();
                                DOM.itemId.value = "";
                            }
                        }
                    });
                }
            });

            renderManageList();
        }
        function renderManageList() {
            const q = DOM.manageSearch.value.trim().toLowerCase();
            const filtered = menuItems.filter((m) => m.name.toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q));
            
            if (filtered.length === 0) {
                DOM.manageList.innerHTML = `<div style="color: var(--muted); padding: 8px;">No items.</div>`;
                return;
            }
            
            DOM.manageList.innerHTML = filtered.map((m) => `
                <div class="manage-item">
                    <img src="${escapeHtml(m.image || '')}" alt="${escapeHtml(m.name)}" onerror="this.src='https://placehold.co/96x96/eee/999?text=${encodeURIComponent(m.name)}'"/>
                    <div>
                        <div><strong>${escapeHtml(m.name)}</strong></div>
                        <div style="color: var(--muted); font-size: 12px;">₹${formatMoney(m.price)} · ${escapeHtml(m.category || "Uncategorized")}</div>
                    </div>
                    <div class="manage-actions">
                        <button class="edit-btn" data-id="${m.id}">Edit</button>
                        <button class="del-btn" data-id="${m.id}">Delete</button>
                    </div>
                </div>
            `).join("");
        }

        // --- Reports ---
        function initReportsView() {
            const now = new Date();
            DOM.reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            DOM.loadReportBtn.addEventListener("click", renderReport);

            const controls = document.querySelector(".report-controls");
            if (controls && !document.getElementById("download-report")) {
                const btn = document.createElement("button");
                btn.id = "download-report";
                btn.textContent = "Download CSV";
                btn.className = "secondary"; // Use class for styling
                btn.addEventListener("click", downloadMonthlyCsv);
                controls.appendChild(btn);
            }
            renderReport();
        }
        function renderReport() {
            const monthStr = DOM.reportMonth.value;
            if (!monthStr) return;
            
            const [y, m] = monthStr.split("-").map(Number);
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 1);
            
            const monthSales = sales.filter((s) => {
                const d = new Date(s.date);
                return d >= start && d < end;
            });
            
            const totalRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
            const totalOrders = monthSales.length;
            
            const itemMap = new Map();
            monthSales.forEach((o) => {
                o.items.forEach((it) => {
                    const key = it.name;
                    const prev = itemMap.get(key) || { qty: 0, revenue: 0 };
                    prev.qty += it.qty;
                    prev.revenue += it.qty * it.price;
                    itemMap.set(key, prev);
                });
            });
            
            const rows = Array.from(itemMap.entries())
                .sort((a, b) => b[1].revenue - a[1].revenue) // Sort by revenue desc
                .map(([name, data]) => `<tr><td>${escapeHtml(name)}</td><td>${data.qty}</td><td>₹${formatMoney(data.revenue)}</td></tr>`)
                .join("");

            DOM.reportSummary.innerHTML = `
                <div><strong>Month:</strong> ${start.toLocaleString('default', { month: 'long' })} ${y}</div>
                <div><strong>Total Orders:</strong> ${totalOrders}</div>
                <div><strong>Total Revenue:</strong> ₹${formatMoney(totalRevenue)}</div>
            `;
            DOM.reportTable.innerHTML = `
                <table>
                    <thead><tr><th>Item</th><th>Qty Sold</th><th>Total Revenue</th></tr></thead>
                    <tbody>${rows || `<tr><td colspan="3" style="color: var(--muted); text-align: center;">No sales for this month.</td></tr>`}</tbody>
                </table>
            `;
        }
        function monthRangeFromInput() {
            const monthStr = DOM.reportMonth.value;
            if (!monthStr) return null;
            const [y, m] = monthStr.split("-").map(Number);
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 1);
            return { start, end, y, m };
        }
        function downloadMonthlyCsv() {
            const range = monthRangeFromInput();
            if (!range) return;
            const { start, end, y, m } = range;
            
            const monthSales = sales.filter((s) => {
                const d = new Date(s.date);
                return d >= start && d < end;
            });
            
            if (monthSales.length === 0) {
                showCustomAlert("No sales for this month.");
                return;
            }
            
            const rows = [["order_id","date","item","qty","price","line_total","order_total"]];
            monthSales.forEach((o) => {
                const orderTotal = o.total;
                o.items.forEach((it) => {
                    const line = (it.qty * it.price);
                    rows.push([o.id, new Date(o.date).toLocaleString(), it.name, it.qty, it.price, line, orderTotal]);
                });
            });
            
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sales_${y}-${String(m).padStart(2,"0")}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // --- Invoices view and modal ---
        function initInvoicesView() {
            renderInvoicesList();
            if (DOM.closeInvoiceBtn) DOM.closeInvoiceBtn.onclick = () => DOM.invoiceModal.classList.remove("show");
            if (DOM.printInvoiceBtn) DOM.printInvoiceBtn.onclick = () => generateInvoicePdf();

            // --- OPTIMIZATION: Event Delegation for Invoice List ---
            DOM.invoiceList.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-invoice]");
                if (!btn) return;
                
                const id = btn.dataset.invoice;
                const order = sales.find(s => s.id === id);
                if (order) {
                    showInvoice(order);
                }
            });
        }
        function renderInvoicesList() {
            if (!DOM.invoiceList) return;
            if (sales.length === 0) {
                DOM.invoiceList.innerHTML = `<div style="color: var(--muted); padding: 1.5rem; text-align: center;">No invoices yet.</div>`;
                return;
            }
            
            const rows = sales.slice().sort((a,b) => new Date(b.date)-new Date(a.date)).map((o) => `
                <tr>
                    <td>${escapeHtml(o.id)}</td>
                    <td>${new Date(o.date).toLocaleString()}</td>
                    <td>₹${formatMoney(o.total)}</td>
                    <td class="actions"><button data-invoice="${o.id}" class="primary">View Invoice</button></td>
                </tr>
            `).join("");
            
            DOM.invoiceList.innerHTML = `
                <table>
                    <thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }
        function showInvoice(order) {
            if (DOM.invoiceContent) {
                DOM.invoiceContent.innerHTML = `
                    <div class="bill">
                        <h2>Restaurant Invoice</h2>
                        <div>${new Date(order.date).toLocaleString()}</div>
                        <div style="margin-top:8px;">
                            ${order.items.map((c) => `<div class="item-row"><span>${escapeHtml(c.name)} × ${c.qty}</span><span>₹${formatMoney(c.price * c.qty)}</span></div>`).join("")}
                        </div>
                        <div style="margin-top:8px;">
                            <div class="item-row"><span>Subtotal</span><span>₹${formatMoney(order.subtotal)}</span></div>
                            <div class="item-row" style="font-weight:700;"><span>Total</span><span>₹${formatMoney(order.total)}</span></div>
                        </div>
                    </div>
                `;
            }
            // prepare hidden print area
            populatePrintAreaFromOrder(order);
            currentInvoiceOrder = order;
            DOM.invoiceModal.classList.add("show");
        }

        function generateInvoicePdf() {
            const billEl = DOM.invoiceContent.querySelector(".bill");
            if (!billEl) {
                console.error("Invoice content not found.");
                return;
            }
            
            const order = currentInvoiceOrder;
            const fileBase = order ? `invoice_${order.id.substring(0, 8)}` : `invoice_${Date.now()}`;
            
            const opt = {
                margin:       10,
                filename:     `${fileBase}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            if (typeof html2pdf === 'undefined') {
                showCustomAlert('PDF library (html2pdf) is not loaded. Please check your internet connection.');
                return;
            }
            
            html2pdf().from(billEl).set(opt).save();
        }

        // --- Settings View ---
        function initSettingsView() {
            if (!DOM.settingsForm) return;
            
            // Load current settings
            DOM.upiId.value = upiIdStored || "";
            DOM.payeeName.value = payeeNameStored || "";
            DOM.upiAid.value = aidStored || "";
            DOM.upiMc.value = mcStored || "";
            DOM.upiTr.value = trStored || "";
            updateSettingsDisplay();
            
            DOM.settingsForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const upiId = DOM.upiId.value.trim();
                const payeeName = DOM.payeeName.value.trim();
                const aid = DOM.upiAid.value.trim();
                const mc = DOM.upiMc.value.trim();
                const tr = DOM.upiTr.value.trim();
                
                if (!validateUpiId(upiId)) {
                    showCustomAlert("Invalid UPI ID format. Expected format: username@bankname");
                    return;
                }
                if (!payeeName) {
                    showCustomAlert("Payee name is required.");
                    return;
                }
                
                upiIdStored = upiId;
                payeeNameStored = payeeName;
                aidStored = aid;
                mcStored = mc;
                trStored = tr;
                saveToStorage(STORAGE_KEYS.upi, upiIdStored);
                saveToStorage(STORAGE_KEYS.payeeName, payeeNameStored);
                saveToStorage(STORAGE_KEYS.aid, aidStored);
                saveToStorage(STORAGE_KEYS.mc, mcStored);
                saveToStorage(STORAGE_KEYS.tr, trStored);
                
                updateSettingsDisplay();
                showCustomAlert("Settings saved successfully!");
            });
        }

        function updateSettingsDisplay() {
            if (!DOM.currentUpiConfig) return;
            if (upiIdStored && payeeNameStored) {
                DOM.currentUpiConfig.innerHTML = `
                    <div style="margin-bottom: 8px;"><strong>UPI ID:</strong> ${escapeHtml(upiIdStored)}</div>
                    <div><strong>Payee Name:</strong> ${escapeHtml(payeeNameStored)}</div>
                    ${aidStored ? `<div style="margin-top: 8px;"><strong>App ID:</strong> ${escapeHtml(aidStored)}</div>` : ''}
                    ${mcStored ? `<div style="margin-top: 8px;"><strong>MC Code:</strong> ${escapeHtml(mcStored)}</div>` : ''}
                    ${trStored ? `<div style="margin-top: 8px;"><strong>Txn Ref:</strong> ${escapeHtml(trStored)}</div>` : ''}
                `;
            } else {
                DOM.currentUpiConfig.textContent = "No UPI settings configured yet.";
            }
        }

        // --- Utils ---
        function loadFromStorage(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return fallback;
                return JSON.parse(raw);
            } catch {
                return fallback;
            }
        }
        function saveToStorage(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error("Failed to save to localStorage", e);
            }
        }
        function formatMoney(n) {
            return Number(n).toFixed(2);
        }
        function escapeHtml(s) {
            if (s === null || s === undefined) {
                return '';
            }
            return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
        }
        function cryptoRandomId() {
            if (window.crypto && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return "id-" + Math.random().toString(36).slice(2) + Date.now();
        }