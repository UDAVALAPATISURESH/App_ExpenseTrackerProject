const form = document.getElementById("form1");
const categoryInput = document.getElementById("categoryBtn");
const descriptionInput = document.getElementById("descriptionValue");
const amountInput = document.getElementById("amountValue");
const dateInput = document.getElementById("dateValue");
const table = document.getElementById("tbodyId");
const submitBtn = document.getElementById("submitBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");
const reportsLink = document.getElementById("reportsLinkBtn");
const limitSelect = document.getElementById("limit");
const paginationUL = document.getElementById("paginationUL");
const premiumStatus = document.getElementById("premiumStatus");

let editingId = null;
let token = localStorage.getItem("token");
// Validate token format (basic JWT check - should have 3 parts separated by dots)
if (token && (!token.includes('.') || token.split('.').length !== 3)) {
  console.warn('Invalid token format, clearing...');
  localStorage.removeItem("token");
  token = null;
}
let currentPage = 1;
let currentLimit = parseInt(limitSelect.value);
let isPremium = false;

dateInput.valueAsDate = new Date();

// Helper function to get base URL
// Always use Express server (port 3000) for API calls
// Live Server (port 5500) is only for serving static files
function getBaseURL() {
  // AWS Server Configuration
  const AWS_SERVER = "http://13.235.45.122";
  
  // If using file protocol, use AWS server
  if (window.location.protocol === "file:") {
    return AWS_SERVER;
  }
  
  // If port is 5500 (Live Server) or hostname is 127.0.0.1/localhost, use AWS server
  const currentPort = window.location.port;
  const hostname = window.location.hostname;
  
  if (currentPort === "5500" || hostname === "127.0.0.1" || hostname === "localhost") {
    return AWS_SERVER;
  }
  
  // If already on AWS server, use the same origin
  if (hostname === "13.201.42.99" || hostname.includes("13.235.45.122")) {
    return window.location.origin;
  }
  
  // For production, use AWS server
  return AWS_SERVER;
}

const API_BASE_URL = getBaseURL();
axios.defaults.baseURL = API_BASE_URL;

// Helper function to navigate to a URL
// Helper function to navigate to a URL
// Always navigate to Express server for routes (not static files)
function navigateTo(path) {
  const currentOrigin = window.location.origin;
  
  // If API_BASE_URL is different from current origin, we need to redirect to Express server
  // This handles: file:// protocol, Live Server (port 5500), and 127.0.0.1
  if (API_BASE_URL !== currentOrigin) {
    // Redirect to Express server
    window.location.href = `${API_BASE_URL}${path}`;
  } else {
    // Already on Express server, use relative path
    window.location.href = path;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    navigateTo("/");
  }
});

document.getElementById('homeBtn').addEventListener('click', () => {
  navigateTo('/homePage');
});

function createExpenseRow(exp) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.category}</td>
        <td>${exp.description}</td>
        <td>₹${exp.amount}</td>
        <td>
          <button class="btn btn-sm btn-danger delete">Delete</button>
          <button class="btn btn-sm btn-secondary edit">Edit</button>
          <input type="hidden" value="${exp.id}">
        </td>`;
  return tr;
}

async function getAllExpenses(page = 1, limit = 5) {
  currentPage = page;
  currentLimit = limit;

  try {
    const res = await axios.get(
      `/expense/getAllExpenses?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    table.innerHTML = "";
    if (!res.data.expenses || res.data.expenses.length === 0) {
      if (currentPage > 1) getAllExpenses(currentPage - 1, currentLimit);
      return;
    }

    res.data.expenses.forEach((exp) => {
      const tr = createExpenseRow(exp);
      table.appendChild(tr);
    });

    paginationUL.innerHTML = "";
    for (let i = 1; i <= res.data.totalPages; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === page ? " active" : "");
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = i;
      a.addEventListener("click", () => getAllExpenses(i, currentLimit));
      li.appendChild(a);
      paginationUL.appendChild(li);
    }
  } catch (err) {
    console.error("Failed to fetch expenses", err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();
  const date = dateInput.value;

  if (!category || !description || !amount || !date) {
    if (typeof showNotification === 'function') {
      showNotification("Please fill all fields", 'warning', 'Validation Error');
    } else {
      alert("Please fill all fields");
    }
    return;
  }

  try {
    const url = editingId
      ? `/expense/editExpense/${editingId}`
      : "/expense/addExpense";
    const payload = editingId
      ? { category, description, amount }
      : { category, description, amount, date };

    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    editingId = null;
    submitBtn.textContent = "Add Expense";
    form.reset();
    dateInput.valueAsDate = new Date();
    getAllExpenses(currentPage, currentLimit);
  } catch (err) {
    console.error("Error saving expense", err);
    if (typeof showNotification === 'function') {
      showNotification("Error saving expense", 'error', 'Error');
    } else {
      alert("Error saving expense");
    }
  }
});

table.addEventListener("click", async (e) => {
  const row = e.target.closest("tr");
  const id = row.querySelector("input").value;

  if (e.target.classList.contains("delete")) {
    if (confirm("Delete this expense?")) {
      try {
        await axios.delete(`/expense/deleteExpense/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        getAllExpenses(currentPage, currentLimit);
      } catch (err) {
        if (typeof showNotification === 'function') {
          showNotification("Failed to delete expense", 'error', 'Error');
        } else {
          alert("Failed to delete expense");
        }
      }
    }
  }

  if (e.target.classList.contains("edit")) {
    categoryInput.value = row.children[1].textContent;
    descriptionInput.value = row.children[2].textContent;
    amountInput.value = row.children[3].textContent.replace("₹", "");
    editingId = id;
    submitBtn.textContent = "Update Expense";
  }
});

buyPremiumBtn.addEventListener("click", buyPremium);

async function buyPremium() {
  try {
    const res = await axios.get("/purchase/premiumMembership", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.isPremium) {
      if (typeof showNotification === 'function') {
        showNotification(res.data.message, 'success', 'Success');
      } else {
        alert(res.data.message);
      }
      return;
    }

    const { paymentSessionId, orderId } = res.data;

    const result = await Cashfree({ mode: "sandbox" }).checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.paymentDetails) {
      await axios.post(
        `/purchase/updateTransactionStatus/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (typeof showNotification === 'function') {
        showNotification("Payment successful! You are now a premium member.", 'success', 'Congratulations!');
      } else {
        alert("Payment successful! You are now a premium member.");
      }
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    if (typeof showNotification === 'function') {
      showNotification("Payment failed or was cancelled.", 'error', 'Payment Failed');
    } else {
      alert("Payment failed or was cancelled.");
    }
  }
}

leaderboardLink.addEventListener("click", () => {
  if (!isPremium) {
    if (typeof showNotification === 'function') {
      showNotification("You are not a premium user. Upgrade to access Leaderboard!", 'warning', 'Premium Required');
    } else {
      alert("You are not a premium user. Upgrade to access Leaderboard!");
    }
  } else {
    navigateTo(`/premium/getLeaderboardPage?token=${token}`);
  }
});

reportsLink.addEventListener("click", () => {
  if (!isPremium) {
    if (typeof showNotification === 'function') {
      showNotification("You are not a premium user. Upgrade to access Reports!", 'warning', 'Premium Required');
    } else {
      alert("You are not a premium user. Upgrade to access Reports!");
    }
  } else {
    navigateTo(`/reports/getReportsPage?token=${token}`);
  }
});

limitSelect.addEventListener("change", () => {
  getAllExpenses(1, parseInt(limitSelect.value));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  navigateTo("/");
});

document.addEventListener("DOMContentLoaded", () => {
  getAllExpenses(currentPage, currentLimit);
  checkPremiumStatus();
});

async function checkPremiumStatus() {
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: `Bearer ${token}` },
    });

    isPremium = res.data.isPremiumUser;

    if (isPremium) {
      buyPremiumBtn.textContent = "Premium Active";
      // buyPremiumBtn.disabled = true;
      buyPremiumBtn.classList.replace("btn-success", "btn-secondary");
      premiumStatus.innerHTML =
        '<span class="premium-badge">You are a Premium User</span>';
    }
  } catch (err) {
    console.error("Error checking premium status", err);
  }
}
