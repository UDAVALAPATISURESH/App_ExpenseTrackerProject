const signUp = document.getElementById("signUp");
const signIn = document.getElementById("signIn");
const container = document.getElementById("container");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

// Helper function to get base URL
// Always use Express server (port 3000) for API calls
// Live Server (port 5500) is only for serving static files
function getBaseURL() {
  // AWS Server Configuration
  const AWS_SERVER = "https://13.201.42.99";
  
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
  if (hostname === "13.201.42.99" || hostname.includes("13.201.42.99")) {
    return window.location.origin;
  }
  
  // For production, use AWS server
  return AWS_SERVER;
}

const BASEURL = getBaseURL();
axios.defaults.baseURL = BASEURL;

// Helper function to navigate to a URL
// Always navigate to Express server for routes (not static files)
function navigateTo(path) {
  const currentOrigin = window.location.origin;
  
  // If BASEURL is different from current origin, we need to redirect to Express server
  // This handles: file:// protocol, Live Server (port 5500), and 127.0.0.1
  if (BASEURL !== currentOrigin) {
    // Redirect to Express server
    window.location.href = `${BASEURL}${path}`;
  } else {
    // Already on Express server, use relative path
    window.location.href = path;
  }
}

// Switch to Sign Up form overlay
signUp.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

// Switch to Sign In form overlay
signIn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// Signup handler
async function signup() {
  // Validate that all fields are filled
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (!name || !email || !password) {
    if (typeof showNotification === 'function') {
      showNotification("Please fill in all fields.", 'error', 'Validation Error');
    } else {
      alert("Please fill in all fields.");
    }
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (typeof showNotification === 'function') {
      showNotification("Please enter a valid email address.", 'error', 'Validation Error');
    } else {
      alert("Please enter a valid email address.");
    }
    return;
  }

  // Password length validation
  if (password.length < 6) {
    if (typeof showNotification === 'function') {
      showNotification("Password must be at least 6 characters long.", 'error', 'Validation Error');
    } else {
      alert("Password must be at least 6 characters long.");
    }
    return;
  }

  const signupDetails = {
    name: name,
    email: email,
    password: password,
  };

  try {
    const result = await axios.post(`${BASEURL}/user/signUp`, signupDetails);
    if (typeof showNotification === 'function') {
      showNotification(result.data.message, 'success', 'Success!');
    } else {
      alert(result.data.message);
    }
    // Clear form and switch to login
    signupName.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    container.classList.remove("right-panel-active");
  } catch (error) {
    if (error.response) {
      if (typeof showNotification === 'function') {
        showNotification(error.response.data.message, 'error', 'Error');
      } else {
        alert(error.response.data.message);
      }
    } else {
      if (typeof showNotification === 'function') {
        showNotification("An error occurred. Please try again later.", 'error', 'Error');
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  }
}

// Login handler
async function login() {
  // Validate that all fields are filled
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    if (typeof showNotification === 'function') {
      showNotification("Please fill in all fields.", 'error', 'Validation Error');
    } else {
      alert("Please fill in all fields.");
    }
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (typeof showNotification === 'function') {
      showNotification("Please enter a valid email address.", 'error', 'Validation Error');
    } else {
      alert("Please enter a valid email address.");
    }
    return;
  }

  const loginDetails = {
    loginEmail: email,
    loginPassword: password,
  };

  try {
    const result = await axios.post(`${BASEURL}/user/login`, loginDetails);
    if (typeof showNotification === 'function') {
      showNotification(result.data.message, 'success', 'Welcome Back!');
    } else {
      alert(result.data.message);
    }
    // Validate token before storing
    if (result.data.token && result.data.token.includes('.') && result.data.token.split('.').length === 3) {
      localStorage.setItem("token", result.data.token);
      setTimeout(() => {
        navigateTo("/homePage");
      }, 1000);
    } else {
      if (typeof showNotification === 'function') {
        showNotification("Error: Invalid token received. Please try again.", 'error', 'Error');
      } else {
        alert("Error: Invalid token received. Please try again.");
      }
    }
  } catch (error) {
    if (error.response) {
      if (typeof showNotification === 'function') {
        showNotification(error.response.data.message, 'error', 'Login Failed');
      } else {
        alert(error.response.data.message);
      }
    } else {
      if (typeof showNotification === 'function') {
        showNotification("An error occurred. Please try again later.", 'error', 'Error');
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  }
}

signupBtn.addEventListener("click", signup);
loginBtn.addEventListener("click", login);