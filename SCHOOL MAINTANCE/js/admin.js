// Backend API URL
const API_BASE_URL = 'http://localhost/schoolmaintenance/backend';

// Load requests when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadAdminRequests();
});

// Load all requests for admin dashboard
async function loadAdminRequests() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_requests.php`);
    const data = await response.json();

    if (data.success) {
      displayAdminRequests(data.data.requests);
      updateStats(data.data.requests);
    } else {
      showError('Failed to load requests: ' + data.message);
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    showError('Network error: Could not connect to backend. Make sure XAMPP is running!');
  }
}

// Display requests in admin table
function displayAdminRequests(requests) {
  const tbody = document.querySelector('#adminTable tbody');

  if (!tbody) {
    console.error('Admin table body not found');
    return;
  }

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">No requests found</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(request => `
    <tr>
      <td>${request.id}</td>
      <td><strong>${escapeHtml(request.issue_name)}</strong></td>
      <td>${escapeHtml(request.location)}</td>
      <td>${escapeHtml(request.reporter_name)}</td>
      <td>${request.date_submitted}</td>
      <td>
        <select class="status-select" onchange="updateStatus(${request.id}, this.value)" data-current="${request.status}">
          <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${request.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${request.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </td>
      <td>
        <button class="btn-view-small" onclick="viewAdminDetails(${request.id})">Details</button>
      </td>
    </tr>
  `).join('');
}

// Update request status
window.updateStatus = async function (requestId, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/update_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: requestId,
        status: newStatus
      })
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      showSuccessToast(`Status updated to "${newStatus}"`);
      // Reload requests to update stats
      loadAdminRequests();
    } else {
      alert('❌ Error: ' + data.message);
      // Reload to reset dropdown
      loadAdminRequests();
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('❌ Network error: Could not update status');
    loadAdminRequests();
  }
}

// View request details in modal
window.viewAdminDetails = async function (requestId) {
  try {
    const response = await fetch(`${API_BASE_URL}/get_requests.php`);
    const data = await response.json();

    if (data.success) {
      const request = data.data.requests.find(r => r.id === requestId);
      if (request) {
        showAdminModal(request);
      }
    }
  } catch (error) {
    console.error('Error loading request details:', error);
    alert('Failed to load request details');
  }
}

// Show modal with request details
function showAdminModal(request) {
  const modal = document.getElementById('adminModal');
  if (!modal) {
    createAdminModal();
    showAdminModal(request);
    return;
  }

  const modalContent = modal.querySelector('.modal-body');
  modalContent.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <strong>Request ID:</strong> ${request.id}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Issue:</strong> ${escapeHtml(request.issue_name)}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Location:</strong> ${escapeHtml(request.location)}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Reporter:</strong> ${escapeHtml(request.reporter_name)}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Status:</strong> 
      <span class="status-badge status-${request.status.toLowerCase().replace(' ', '-')}">
        ${request.status}
      </span>
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Date Submitted:</strong> ${request.date_submitted}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Description:</strong><br>
      ${escapeHtml(request.description)}
    </div>
    ${request.photo_url ? `
      <div style="margin-top: 1rem;">
        <strong>Photo:</strong><br>
        <img src="${request.photo_url}" alt="Issue photo" style="max-width: 100%; border-radius: 8px; margin-top: 0.5rem; cursor: pointer;" onclick="window.open('${request.photo_url}', '_blank')">
      </div>
    ` : ''}
  `;

  modal.style.display = 'block';
}

// Create admin modal
function createAdminModal() {
  const modal = document.createElement('div');
  modal.id = 'adminModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeAdminModal()">&times;</span>
      <h2>Request Details</h2>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  if (!document.getElementById('modalStyles')) {
    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
      }
      .modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      }
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      .close:hover {
        color: #000;
      }
      .modal-body {
        margin-top: 1rem;
      }
      .status-select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ddd;
        font-size: 14px;
      }
      .btn-view-small {
        padding: 0.4rem 0.8rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-view-small:hover {
        background: #5568d3;
      }
    `;
    document.head.appendChild(style);
  }
}

// Close admin modal
window.closeAdminModal = function () {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Update statistics
function updateStats(requests) {
  const pending = requests.filter(r => r.status === 'Pending').length;
  const inProgress = requests.filter(r => r.status === 'In Progress').length;
  const completed = requests.filter(r => r.status === 'Completed').length;

  const pendingEl = document.getElementById('pendingCount');
  const progressEl = document.getElementById('progressCount');
  const completedEl = document.getElementById('completedCount');

  if (pendingEl) pendingEl.textContent = pending;
  if (progressEl) progressEl.textContent = inProgress;
  if (completedEl) completedEl.textContent = completed;
}

// Show success toast
function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = '✅ ' + message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show error message
function showError(message) {
  const tbody = document.querySelector('#adminTable tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">
          ❌ ${escapeHtml(message)}
        </td>
      </tr>
    `;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('adminModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
