const dateInput = document.getElementById("date");
const dateShowBtn = document.getElementById("dateShowBtn");
const tbodyDaily = document.getElementById("tbodyDailyId");
const tfootDaily = document.getElementById("tfootDailyId");
const monthInput = document.getElementById("month");
const monthShowBtn = document.getElementById("monthShowBtn");
const tbodyMonthly = document.getElementById("tbodyMonthlyId");
const tfootMonthly = document.getElementById("tfootMonthlyId");
const dayDownloadBtn = document.getElementById("dayDownloadBtn");
const monthDownloadBtn = document.getElementById("monthDownloadBtn");
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
  // AWS Server Configuration
  const AWS_SERVER = "http://15.206.168.32:3000";
  
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
  if (hostname === "15.206.168.32" || hostname.includes("15.206.168.32")) {
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

document.getElementById("homeBtn").addEventListener("click", () => {
  navigateTo("/homePage");
});

async function getDailyReport(e) {
  e.preventDefault();
  try {
    const date = new Date(dateInput.value);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    let totalAmount = 0;

    const res = await axios.post(
      "/reports/dailyReports",
      { date: formattedDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    tbodyDaily.innerHTML = "";
    tfootDaily.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>₹${expense.amount}</td>`;
      tbodyDaily.appendChild(tr);
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td></td>
          <td></td>
          <td id="dailyTotal">Total</td>
          <td id="dailyTotalAmount">₹${totalAmount}</td>`;
    tfootDaily.appendChild(tr);
  } catch (error) {
    console.error("Error fetching daily report", error);
    alert("Unable to load daily report.");
  }
}

async function getMonthlyReport(e) {
  e.preventDefault();
  try {
    const month = new Date(monthInput.value);
    const formattedMonth = `${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    let totalAmount = 0;

    const res = await axios.post(
      "/reports/monthlyReports",
      { month: formattedMonth },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    tbodyMonthly.innerHTML = "";
    tfootMonthly.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>₹${expense.amount}</td>`;
      tbodyMonthly.appendChild(tr);
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td></td>
          <td></td>
          <td id="monthlyTotal">Total</td>
          <td id="monthlyTotalAmount">₹${totalAmount}</td>`;
    tfootMonthly.appendChild(tr);
  } catch (error) {
    console.error("Error fetching monthly report", error);
    alert("Unable to load monthly report.");
  }
}

async function getDayFile(e) {
  e.preventDefault();
  try {
    const date = new Date(dateInput.value);
    if (date == "Invalid Date") {
      if (typeof showNotification === 'function') {
        showNotification("Please select a date", 'error', 'Validation Error');
      } else {
        alert("Please select a date");
      }
      return;
    }
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const res = await axios.get(
      `/reports/dailyReports/download?date=${formattedDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 200 && res.data.success) {
      // Check if data is returned directly (S3 not configured)
      if (res.data.data) {
        // Create a blob and download directly
        const blob = new Blob([res.data.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `daily_expense_${formattedDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
          showNotification(res.data.message || "File downloaded successfully", 'success', 'Download Complete');
        }
      } else if (res.data.fileUrl) {
        // S3 URL provided, open in new tab or download
        const a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.target = "_blank";
        a.download = `daily_expense_${formattedDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (typeof showNotification === 'function') {
          showNotification("File downloaded successfully", 'success', 'Download Complete');
        }
      }
      
      // Refresh the downloaded files list
      fetchDownloadedFiles();
    } else {
      throw new Error(res.data.message || "Failed to download file");
    }
  } catch (error) {
    console.error("Error downloading daily file", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to download daily report.";
    if (typeof showNotification === 'function') {
      showNotification(errorMessage, 'error', 'Download Failed');
    } else {
      alert(errorMessage);
    }
  }
}

async function getMonthFile(e) {
  e.preventDefault();
  try {
    const month = new Date(monthInput.value);
    if (month == "Invalid Date") {
      if (typeof showNotification === 'function') {
        showNotification("Please select a month", 'error', 'Validation Error');
      } else {
        alert("Please select a month");
      }
      return;
    }
    // Format month as YYYY-MM (e.g., "2025-11")
    const formattedMonth = `${month.getFullYear()}-${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const res = await axios.get(
      `/reports/monthlyReports/download?month=${formattedMonth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 200 && res.data.success) {
      // Check if data is returned directly (S3 not configured)
      if (res.data.data) {
        // Create a blob and download directly
        const blob = new Blob([res.data.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monthly_expense_${formattedMonth}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
          showNotification(res.data.message || "File downloaded successfully", 'success', 'Download Complete');
        }
      } else if (res.data.fileUrl) {
        // S3 URL provided, open in new tab or download
        const a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.target = "_blank";
        a.download = `monthly_expense_${formattedMonth}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (typeof showNotification === 'function') {
          showNotification("File downloaded successfully", 'success', 'Download Complete');
        }
      }
      
      // Refresh the downloaded files list
      fetchDownloadedFiles();
    } else {
      throw new Error(res.data.message || "Failed to download file");
    }
  } catch (error) {
    console.error("Error downloading monthly file", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to download monthly report.";
    if (typeof showNotification === 'function') {
      showNotification(errorMessage, 'error', 'Download Failed');
    } else {
      alert(errorMessage);
    }
  }
}

async function fetchDownloadedFiles() {
  try {
    const res = await axios.get("/reports/downloadedfiles", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      populateDownloadsTable(res.data.files);
    } else {
      console.warn("Could not fetch files");
    }
  } catch (err) {
    console.error("Error fetching downloaded files", err);
    // alert("Unable to load downloaded files.");
  }
}

function populateDownloadsTable(files) {
  const tbody = document.getElementById("downloadsTbody");
  tbody.innerHTML = "";
  files.forEach((file, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>Report ${index + 1}</td>
          <td><a href="${
            file.filedownloadurl
          }" target="_blank" class="btn btn-sm btn-success">Download</a></td>`;
    tbody.appendChild(row);
  });
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
        '<span class="premium-badge">You are a Premium User</span>';
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
dateShowBtn.addEventListener("click", getDailyReport);
monthShowBtn.addEventListener("click", getMonthlyReport);
dayDownloadBtn.addEventListener("click", getDayFile);
monthDownloadBtn.addEventListener("click", getMonthFile);

document.addEventListener("DOMContentLoaded", () => {
  fetchDownloadedFiles();
  checkPremiumStatus();
});