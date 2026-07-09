const API_BASE = "/api";

const els = {
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  fileName: document.getElementById("file-name"),
  categorySelect: document.getElementById("category-select"),
  uploadBtn: document.getElementById("upload-btn"),
  uploadStatus: document.getElementById("upload-status"),
  receiptsBody: document.getElementById("receipts-body"),
  searchInput: document.getElementById("search-input"),
  filterCategory: document.getElementById("filter-category"),
  newCategory: document.getElementById("new-category"),
  addCategoryBtn: document.getElementById("add-category-btn"),
  categoryList: document.getElementById("category-list"),
  toast: document.getElementById("toast"),
};

let selectedFile = null;
let categories = [];
let receipts = [];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH");
}

function showToast(message, type = "success") {
  els.toast.textContent = message;
  els.toast.className = `toast ${type}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 2500);
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = "กำลังทำงาน...";
  } else {
    btn.textContent = btn.dataset.origText || btn.textContent;
  }
}

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.error || data || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function loadCategories() {
  try {
    categories = await api(`${API_BASE}/categories`);
    const opts = categories.map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("");
    els.categorySelect.innerHTML = `<option value="">เลือกหมวดหมู่</option>` + opts;
    els.categorySelect.disabled = false;

    const filterOpts = categories.map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("");
    els.filterCategory.innerHTML = `<option value="">ทั้งหมด</option>` + filterOpts;
  } catch (e) {
    showToast("โหลดหมวดหมู่ไม่สำเร็จ: " + e.message, "error");
  }
}

async function loadReceipts() {
  try {
    receipts = await api(`${API_BASE}/receipts`);
    renderReceipts();
  } catch (e) {
    showToast("โหลดรายการไม่สำเร็จ: " + e.message, "error");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderReceipts() {
  const q = (els.searchInput.value || "").trim().toLowerCase();
  const cat = els.filterCategory.value;
  let items = receipts;
  if (cat) items = items.filter((r) => r.category === cat);
  if (q) items = items.filter((r) => (r.filename || "").toLowerCase().includes(q));

  els.receiptsBody.innerHTML = "";
  if (!items.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5">ยังไม่มีใบเสร็จ</td>`;
    els.receiptsBody.appendChild(tr);
    return;
  }

  for (const r of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(formatDate(r.uploaded_at))}</td>
      <td>${escapeHtml(r.category)}</td>
      <td>${r.content_type && r.content_type.startsWith("image/") ? `<img class="thumb" src="${API_BASE}/file/${r.id}" alt="thumb" />` : escapeHtml(r.filename)}</td>
      <td>${formatSize(r.size)}</td>
      <td>
        <a class="link-btn small-btn" href="${API_BASE}/file/${r.id}" target="_blank" rel="noopener">ดูเต็ม</a>
        <button class="danger-btn small-btn delete-receipt-btn" data-id="${r.id}">ลบ</button>
      </td>
    `;
    els.receiptsBody.appendChild(tr);
  }

  els.receiptsBody.querySelectorAll(".delete-receipt-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("ยืนยันการลบใบเสร็จนี้?")) return;
      setLoading(btn, true);
      try {
        await api(`${API_BASE}/receipts/${encodeURIComponent(id)}`, { method: "DELETE" });
        showToast("ลบสำเร็จ", "success");
        await loadReceipts();
      } catch (e) {
        showToast("ลบไม่สำเร็จ: " + e.message, "error");
      } finally {
        setLoading(btn, false);
      }
    });
  });
}

async function renderCategories() {
  els.categoryList.innerHTML = "";
  for (const c of categories) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="cat-name">${escapeHtml(c.name)}</span>
      <div>
        <button class="small-btn edit-cat-btn" data-id="${c.id}">แก้ไข</button>
        <button class="small-btn danger-btn delete-cat-btn" data-id="${c.id}">ลบ</button>
      </div>
    `;
    els.categoryList.appendChild(li);
  }

  els.categoryList.querySelectorAll(".edit-cat-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const cat = categories.find((c) => c.id === id);
      if (!cat) return;
      const newName = prompt("แก้ไขชื่อหมวดหมู่:", cat.name);
      if (newName === null) return;
      const trimmed = newName.trim();
      if (!trimmed) {
        showToast("ต้องใส่ชื่อหมวดหมู่", "error");
        return;
      }
      setLoading(btn, true);
      try {
        const updated = await api(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        await loadCategories();
        await loadReceipts();
        showToast("แก้ไขหมวดหมู่สำเร็จ", "success");
      } catch (e) {
        showToast("แก้ไขไม่สำเร็จ: " + e.message, "error");
      } finally {
        setLoading(btn, false);
      }
    });
  });

  els.categoryList.querySelectorAll(".delete-cat-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("ยืนยันการลบหมวดหมู่นี้?")) return;
      setLoading(btn, true);
      try {
        await api(`${API_BASE}/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
        showToast("ลบหมวดหมู่สำเร็จ", "success");
        await loadCategories();
      } catch (e) {
        showToast("ลบไม่สำเร็จ: " + e.message, "error");
      } finally {
        setLoading(btn, false);
      }
    });
  });
}

els.dropZone.addEventListener("click", () => els.fileInput.click());
els.dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  els.dropZone.classList.add("drag-over");
});
els.dropZone.addEventListener("dragleave", () => els.dropZone.classList.remove("drag-over"));
els.dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  els.dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) selectFile(file);
});
els.fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) selectFile(e.target.files[0]);
});

function selectFile(file) {
  selectedFile = file;
  els.fileName.textContent = file.name;
  els.uploadBtn.disabled = false;
}

els.uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  const category = els.categorySelect.value;
  if (!category) {
    showToast("กรุณาเลือกหมวดหมู่", "error");
    return;
  }
  setLoading(els.uploadBtn, true);
  els.uploadStatus.textContent = "";
  try {
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("category", category);
    const data = await api(`${API_BASE}/upload`, {
      method: "POST",
      body: form,
    });
    showToast("อัปโหลดสำเร็จ", "success");
    selectedFile = null;
    els.fileName.textContent = "";
    els.fileInput.value = "";
    els.uploadBtn.disabled = true;
    await loadReceipts();
  } catch (e) {
    showToast("อัปโหลดไม่สำเร็จ: " + e.message, "error");
  } finally {
    setLoading(els.uploadBtn, false);
  }
});

els.addCategoryBtn.addEventListener("click", async () => {
  const name = els.newCategory.value.trim();
  if (!name) {
    showToast("กรุณาใส่ชื่อหมวดหมู่", "error");
    return;
  }
  setLoading(els.addCategoryBtn, true);
  try {
    await api(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    els.newCategory.value = "";
    await loadCategories();
    showToast("เพิ่มหมวดหมู่สำเร็จ", "success");
  } catch (e) {
    showToast("เพิ่มไม่สำเร็จ: " + e.message, "error");
  } finally {
    setLoading(els.addCategoryBtn, false);
  }
});

els.searchInput.addEventListener("input", renderReceipts);
els.filterCategory.addEventListener("change", renderReceipts);

(async function init() {
  await loadCategories();
  await loadReceipts();
  renderCategories();
})();
