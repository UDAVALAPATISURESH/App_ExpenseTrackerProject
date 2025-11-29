// Custom Notification System
function showNotification(message, type = 'info', title = null) {
  // Remove existing container if any
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  // Icons for different types
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const icon = icons[type] || icons.info;
  const displayTitle = title || (type.charAt(0).toUpperCase() + type.slice(1));

  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <div class="notification-title">${displayTitle}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 5000);

  return notification;
}

// Replace default alert with custom notifications
const originalAlert = window.alert;
window.alert = function(message) {
  showNotification(message, 'info', 'Alert');
};



