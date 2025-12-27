const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");

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
  if (hostname === "13.235.45.122" || hostname.includes("13.235.45.122")) {
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

async function sendMail() {
  try {
    const email = document.getElementById("email").value;
    if (!email) {
      if (typeof showNotification === 'function') {
        showNotification("Please enter an email address", 'warning', 'Validation Error');
      } else {
        alert("Please enter an email address");
      }
      return;
    }
    const res = await axios.post("/password/sendMail", { email });
    if (typeof showNotification === 'function') {
      showNotification(res.data.message, 'success', 'Email Sent!');
      setTimeout(() => navigateTo("/"), 2000);
    } else {
      alert(res.data.message);
      navigateTo("/");
    }
  } catch (error) {
    console.error("Error sending reset link", error);
    if (typeof showNotification === 'function') {
      showNotification(error.response?.data?.message || "Failed to send reset link", 'error', 'Error');
    } else {
      alert(error.response?.data?.message || "Failed to send reset link");
    }
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);
