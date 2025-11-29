const tbody = document.getElementById("tbodyId");
const premiumStatus = document.getElementById("premiumStatus");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");
const reportsLink = document.getElementById("reportsLinkBtn");
let token = localStorage.getItem("token");
// Validate token format (basic JWT check - should have 3 parts separated by dots)
if (token && (!token.includes('.') || token.split('.').length !== 3)) {
  console.warn('Invalid token format, clearing...');
  localStorage.removeItem("token");
  token = null;
}
let isPremium = false;

// Helper function to get base URL
// Always use Express server (port 3000) for API calls
// Live Server (port 5500) is only for serving static files
function getBaseURL() {
  // If using file protocol, use Express server
  if (window.location.protocol === "file:") {
    return "http://localhost:3000";
  }
  
  // If port is 5500 (Live Server) or hostname is 127.0.0.1, use Express server
  const currentPort = window.location.port;
  const hostname = window.location.hostname;
  
  if (currentPort === "5500" || hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://localhost:3000";
  }
  
  // For production, use the same origin
  return window.location.origin;
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

document.getElementById("homeBtn").addEventListener("click", () => {
  navigateTo("/homePage");
});

async function getLeaderboard() {
  try {
    const res = await axios.get("/premium/getLeaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    tbody.innerHTML = "";
    res.data.forEach((user, index) => {
      const position = index + 1;
      const tr = document.createElement("tr");

      // Position with badge
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      const positionBadge = document.createElement("span");
      positionBadge.className = `position-badge position-${
        position <= 3 ? position : "other"
      }`;
      positionBadge.textContent = position;
      th.appendChild(positionBadge);

      // Name
      const td1 = document.createElement("td");
      td1.textContent = user.name || "Unknown";

      // Total Expenses
      const td2 = document.createElement("td");
      td2.textContent = `₹${user.amount || 0}`;

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch leaderboard", err);
    // alert("Unable to load leaderboard.");
  }
}

async function checkPremiumStatus() {
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: `Bearer ${token}` },
    });

    isPremium = res.data.isPremiumUser;

    if (isPremium) {
      buyPremiumBtn.textContent = "Premium Active";
      buyPremiumBtn.classList.replace("btn-success", "btn-secondary");
      premiumStatus.innerHTML =
        '<span class="premium-badge">🌟 You are a Premium User</span>';
    } else {
      premiumStatus.textContent = "You are not a premium user";
      premiumStatus.classList.add("text-danger");
    }
  } catch (err) {
    console.error("Error checking premium status", err);
  }
}

async function buyPremium() {
  try {
    const res = await axios.get("/purchase/premiumMembership", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.isPremium) {
      alert(res.data.message);
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

      alert("Payment successful! You are now a premium member.");
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("Payment failed or was cancelled.");
  }
}

leaderboardLink.addEventListener("click", () => {
  if (!isPremium) {
    alert("You are not a premium user. Upgrade to access Leaderboard!");
  } else {
    navigateTo(`/premium/getLeaderboardPage?token=${token}`);
  }
});

reportsLink.addEventListener("click", () => {
  if (!isPremium) {
    alert(" You are not a premium user. Upgrade to access Reports!");
  } else {
    navigateTo(`/reports/getReportsPage?token=${token}`);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  navigateTo("/");
});

buyPremiumBtn.addEventListener("click", buyPremium);

document.addEventListener("DOMContentLoaded", () => {
  getLeaderboard();
  checkPremiumStatus();
});
