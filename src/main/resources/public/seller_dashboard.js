// ==================== SELLER-SPECIFIC DATA ====================
const products = [];
const uploadedImages = [];

// ==================== DOM ELEMENTS ====================
const profileBtn = document.getElementById("profileBtn");
const addInventoryBtn = document.getElementById("addInventoryBtn");
const productsList = document.getElementById("productsList");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", async function () {
  // Load user data using shared utility
  const result = await DashboardUtils.loadUserData();

  if (result.success) {
    // Check if user has seller role
    if (!result.roles.includes("seller")) {
      alert("Access denied. Seller role required.");
      window.location.href = "/login.html";
      return;
    }

    // Display seller name
    DashboardUtils.displayUserName(result.user.userName, "sellerName");

    // Store user data for profile modal
    window.currentUserData = result.user;
  }

  // Initialize shared components
  DashboardUtils.initializeProfileModal();
  DashboardUtils.initializeLogout();

  // Initialize seller-specific features
  initializeProfileButton();
  initializeInventoryManagement();
  initializeSearch();

  // Load products from backend
  await loadSellerProducts();
});

// ==================== PROFILE BUTTON ====================
function initializeProfileButton() {
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      if (window.currentUserData) {
        DashboardUtils.showProfileModal(window.currentUserData, "seller");
      }
    });
  }
}

// ==================== INVENTORY MANAGEMENT ====================
function initializeInventoryManagement() {
  // Add inventory button
  if (addInventoryBtn) {
    addInventoryBtn.addEventListener("click", function () {
      showListItemModal();
    });
  }

  // Initialize table actions
  initializeTableActions();
}

function initializeTableActions() {
  const tableBody = document.getElementById("inventoryTableBody");

  if (tableBody) {
    // Edit buttons
    tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const row = e.target.closest("tr");
        handleEditProduct(row);
      }
    });

    // Delete buttons
    tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const row = e.target.closest("tr");
        handleDeleteProduct(row);
      }
    });
  }

  // Select all checkbox
  const selectAll = document.getElementById("selectAll");
  if (selectAll) {
    selectAll.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(
        '#inventoryTableBody input[type="checkbox"]',
      );
      checkboxes.forEach((cb) => (cb.checked = e.target.checked));
    });
  }
}

// ==================== EDIT PRODUCT ====================
function handleEditProduct(row) {
  const productId = row.getAttribute("data-product-id");

  // Find the product in our local array
  const product = products.find((p) => p.id == productId);
  if (!product) {
    DashboardUtils.showNotification("Product not found");
    return;
  }

  // Show modal in edit mode
  showEditItemModal(product, productId);
}

// ==================== DELETE PRODUCT ====================
async function handleDeleteProduct(row) {
  const productId = row.getAttribute("data-product-id");
  const productName = row.querySelector(".item-link").textContent;

  if (
    !DashboardUtils.confirmAction(
      `Are you sure you want to delete ${productName}?`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      DashboardUtils.showNotification("Product deleted successfully");
      // Reload products from server
      await loadSellerProducts();
    } else {
      const error = await response.json();
      DashboardUtils.showNotification(
        "Error: " + (error.error || "Failed to delete product"),
      );
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    DashboardUtils.showNotification("Error deleting product");
  }
}

// ==================== LIST ITEM MODAL (ADD NEW) ====================
function showListItemModal() {
  // Clear uploaded images
  uploadedImages.length = 0;

  // Remove existing modal if any
  const existingModal = document.getElementById("listItemModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create list item modal
  const modal = document.createElement("div");
  modal.id = "listItemModal";
  modal.className = "modal active";
  modal.innerHTML = `
        <div class="modal-content list-item-modal">
            <div class="modal-header">
                <h3>List New Product</h3>
                <button class="close-modal" onclick="closeListItemModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <div class="form-group">
                        <label for="productName">Product Name *</label>
                        <input type="text" id="productName" placeholder="e.g., Samsung Galaxy S25" required>
                    </div>

                    <div class="form-group">
                        <label for="productDescription">Description *</label>
                        <textarea id="productDescription" placeholder="Enter product description and specifications" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="productPrice">Price (Ksh.) *</label>
                        <input type="number" id="productPrice" placeholder="0" min="0" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="productQuantity">Quantity *</label>
                        <input type="number" id="productQuantity" placeholder="0" min="1" value="1" required>
                    </div>

                    <div class="form-group">
                        <label>Product Images</label>
                        <div class="image-upload" id="imageUpload">
                            <input type="file" id="imageInput" accept="image/*" multiple style="display: none;">
                            <div class="upload-text">
                                📸 Click to upload images<br>
                                <small>You can select multiple images</small>
                            </div>
                        </div>
                        <div class="image-preview" id="imagePreview"></div>
                    </div>

                    <button type="submit" class="btn-primary">List Product</button>
                </form>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Initialize product form
  initializeProductForm();

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeListItemModal();
    }
  });
}

// ==================== EDIT ITEM MODAL ====================
function showEditItemModal(product, productId) {
  // Clear and pre-populate images
  uploadedImages.length = 0;
  if (product.images && product.images.length > 0) {
    uploadedImages.push(...product.images);
  }

  // Remove existing modal if any
  const existingModal = document.getElementById("listItemModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create edit modal
  const modal = document.createElement("div");
  modal.id = "listItemModal";
  modal.className = "modal active";
  modal.innerHTML = `
        <div class="modal-content list-item-modal">
            <div class="modal-header">
                <h3>Edit Product</h3>
                <button class="close-modal" onclick="closeListItemModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <input type="hidden" id="editProductId" value="${productId}">
                    
                    <div class="form-group">
                        <label for="productName">Product Name *</label>
                        <input type="text" id="productName" value="${product.name}" placeholder="e.g., Samsung Galaxy S25" required>
                    </div>

                    <div class="form-group">
                        <label for="productDescription">Description *</label>
                        <textarea id="productDescription" placeholder="Enter product description and specifications" required>${product.description}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="productPrice">Price (Ksh.) *</label>
                        <input type="number" id="productPrice" value="${product.price}" placeholder="0" min="0" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="productQuantity">Quantity *</label>
                        <input type="number" id="productQuantity" value="${product.quantity}" placeholder="0" min="1" required>
                    </div>

                    <div class="form-group">
                        <label for="productStatus">Status *</label>
                        <select id="productStatus" required>
                            <option value="active" ${product.status === "active" ? "selected" : ""}>Active</option>
                            <option value="inactive" ${product.status === "inactive" ? "selected" : ""}>Inactive</option>
                            <option value="out_of_stock" ${product.status === "out_of_stock" ? "selected" : ""}>Out of Stock</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Product Images</label>
                        <div class="image-upload" id="imageUpload">
                            <input type="file" id="imageInput" accept="image/*" multiple style="display: none;">
                            <div class="upload-text">
                                📸 Click to upload images<br>
                                <small>You can select multiple images</small>
                            </div>
                        </div>
                        <div class="image-preview" id="imagePreview"></div>
                    </div>

                    <button type="submit" class="btn-primary">Update Product</button>
                </form>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Initialize form and render existing images
  initializeProductForm();
  renderImagePreviews();

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeListItemModal();
    }
  });
}

// ==================== CLOSE MODAL ====================
function closeListItemModal() {
  const modal = document.getElementById("listItemModal");
  if (modal) {
    modal.remove();
  }
  uploadedImages.length = 0;
}

// Make function globally accessible
window.closeListItemModal = closeListItemModal;

// ==================== PRODUCT FORM FUNCTIONALITY ====================
function initializeProductForm() {
  const imageInput = document.getElementById("imageInput");
  const imageUpload = document.getElementById("imageUpload");
  const productForm = document.getElementById("productForm");

  if (!productForm) {
    console.error("Product form not found");
    return;
  }

  // Image upload click handler
  if (imageUpload && imageInput) {
    // Remove old listeners by cloning
    const newImageUpload = imageUpload.cloneNode(true);
    imageUpload.parentNode.replaceChild(newImageUpload, imageUpload);

    newImageUpload.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Upload area clicked - opening file picker");
      imageInput.click();
    });

    imageInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      console.log("Files selected:", files.length);

      if (files.length === 0) return;

      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            uploadedImages.push(event.target.result);
            console.log("Image loaded, total images:", uploadedImages.length);
            renderImagePreviews();
          };
          reader.readAsDataURL(file);
        } else {
          console.warn("Skipped non-image file:", file.name);
        }
      });

      // Reset input
      imageInput.value = "";
    });
  } else {
    console.error("Image upload elements not found");
  }

  // Form submission handler
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editProductId = document.getElementById("editProductId");
    const isEditMode = editProductId && editProductId.value;

    const productData = {
      productName: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: parseFloat(document.getElementById("productPrice").value),
      quantity: parseInt(document.getElementById("productQuantity").value),
      category: "smartphones",
      status: document.getElementById("productStatus")
        ? document.getElementById("productStatus").value
        : "active",
      images: [...uploadedImages],
    };

    console.log(
      "Submitting product:",
      isEditMode ? "UPDATE" : "CREATE",
      productData,
    );

    try {
      let response;

      if (isEditMode) {
        // UPDATE existing product
        response = await fetch(`/api/products/${editProductId.value}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(productData),
        });
      } else {
        // ADD new product
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log("Product saved successfully:", result);
        DashboardUtils.showNotification(
          isEditMode
            ? "Product updated successfully!"
            : "Product listed successfully!",
        );
        closeListItemModal();

        // Reset
        uploadedImages.length = 0;

        // Reload products from server
        await loadSellerProducts();
      } else {
        const error = await response.json();
        console.error("Error response:", error);
        DashboardUtils.showNotification(
          "Error: " + (error.error || "Failed to save product"),
        );
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      DashboardUtils.showNotification("Error submitting product");
    }
  });
}

// ==================== RENDER IMAGE PREVIEWS ====================
function renderImagePreviews() {
  const imagePreview = document.getElementById("imagePreview");
  if (!imagePreview) {
    console.error("Image preview container not found");
    return;
  }

  imagePreview.innerHTML = "";

  uploadedImages.forEach((src, index) => {
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.innerHTML = `
            <img src="${src}" alt="Preview">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        `;
    imagePreview.appendChild(previewItem);
  });

  console.log("Rendered", uploadedImages.length, "image previews");
}

// ==================== REMOVE IMAGE ====================
function removeImage(index) {
  uploadedImages.splice(index, 1);
  renderImagePreviews();
}

// Make function globally accessible
window.removeImage = removeImage;

// ==================== LOAD SELLER PRODUCTS FROM BACKEND ====================
async function loadSellerProducts() {
  try {
    const response = await fetch("/api/products/seller", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.text();
      const serverProducts = JSON.parse(data);

      console.log("Loaded products from server:", serverProducts.length);

      // Clear local products array and populate with server data
      products.length = 0;
      serverProducts.forEach((product) => {
        products.push({
          id: product.productId,
          name: product.productName,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          category: product.category,
          status: product.status,
          images: product.images || [], // Use images from database
        });
      });

      renderProducts();
      updateInventoryTable(serverProducts);
    } else {
      console.error("Failed to load products, status:", response.status);
      DashboardUtils.showNotification("Failed to load products");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    DashboardUtils.showNotification("Error loading products");
  }
}

// ==================== UPDATE INVENTORY TABLE ====================
function updateInventoryTable(serverProducts) {
  const tableBody = document.getElementById("inventoryTableBody");
  if (!tableBody) return;

  if (serverProducts.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    No products yet. Click "List New Item" to add your first product!
                </td>
            </tr>
        `;
    return;
  }

  tableBody.innerHTML = serverProducts
    .map(
      (product, index) => `
        <tr data-product-id="${product.productId}">
            <td><input type="checkbox"></td>
            <td>PH${String(index + 1).padStart(3, "0")}</td>
            <td>
                <div class="product-thumbnail">
                    ${
                      product.images && product.images.length > 0
                        ? `<img src="${product.images[0]}" alt="${product.productName}">`
                        : `<img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100" alt="${product.productName}">`
                    }
                </div>
            </td>
            <td><a href="#" class="item-link">${product.productName}</a></td>
            <td>${product.description}</td>
            <td>${DashboardUtils.formatPrice(product.price)}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge status-${getStatusClass(product.quantity)}">${getStatusText(product.quantity)}</span></td>
            <td>
                <button class="action-btn edit-btn" title="Edit" data-product-id="${product.productId}">✎</button>
                <button class="action-btn delete-btn" title="Delete" data-product-id="${product.productId}">🗑</button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// ==================== STATUS HELPER FUNCTIONS ====================
function getStatusClass(quantity) {
  if (quantity === 0) return "out";
  if (quantity <= 5) return "low";
  return "available";
}

function getStatusText(quantity) {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 5) return "Low Stock";
  return "Available";
}

// ==================== RENDER PRODUCTS LIST ====================
function renderProducts() {
  if (!productsList || !productCount) return;

  if (products.length === 0) {
    productsList.innerHTML =
      '<div class="empty-state">No products listed yet</div>';
    productCount.textContent = "0 products";
    return;
  }

  productCount.textContent = `${products.length} product${products.length !== 1 ? "s" : ""}`;

  productsList.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                ${
                  product.images.length > 0
                    ? `<img src="${product.images[0]}" alt="${product.name}">`
                    : "📦"
                }
            </div>
            <div class="product-details">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-quantity">Quantity: ${product.quantity}</div>
                <div class="product-price">${DashboardUtils.formatPrice(product.price)}</div>
            </div>
        </div>
    `,
    )
    .join("");
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const tableRows = document.querySelectorAll("#inventoryTableBody tr");

  tableRows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}
