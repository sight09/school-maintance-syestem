// Backend API URL
const API_BASE_URL = 'http://localhost/schoolmaintenance/backend';

// Load requests when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRequests();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      loadRequests({ search: searchTerm });
    });
  }

  // Filter by status
  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const status = btn.getAttribute('data-filter');
      if (status === 'all') {
        loadRequests();
      } else {
        loadRequests({ status: status });
      }
    });
  });
}

// Load requests from backend
async function loadRequests(filters = {}) {
  try {
    // Build query string
    const params = new URLSearchParams(filters);
    const url = `${API_BASE_URL}/get_requests.php?${params}`;

    // Show loading state
    const tbody = document.querySelector('#requestsTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading requests...</td></tr>';
    }

    // Fetch data
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      displayRequests(data.data.requests);
    } else {
      showError('Failed to load requests: ' + data.message);
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    showError('Network error: Could not connect to backend. Make sure XAMPP is running!');
  }
}

// Display requests in table
function displayRequests(requests) {
  const tbody = document.querySelector('#requestsTable tbody');

  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No requests found</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(request => `
    <tr>
      <td>${request.id}</td>
      <td><strong>${escapeHtml(request.issue_name)}</strong></td>
      <td>${escapeHtml(request.location)}</td>
      <td>${escapeHtml(request.reporter_name)}</td>
      <td>
        <span class="status-badge status-${request.status.toLowerCase().replace(' ', '-')}">
          ${request.status}
        </span>
      </td>
      <td>
        <button class="btn-view" onclick="viewDetails(${request.id})">View Details</button>
      </td>
    </tr>
  `).join('');
}

// View request details in modal
window.viewDetails = async function (requestId) {
  try {
    const response = await fetch(`${API_BASE_URL}/get_requests.php`);
    const data = await response.json();

    if (data.success) {
      const request = data.data.requests.find(r => r.id === requestId);
      if (request) {
        showModal(request);
      }
    }
  } catch (error) {
    console.error('Error loading request details:', error);
    alert('Failed to load request details');
  }
}

// Show modal with request details
function showModal(request) {
  const modal = document.getElementById('requestModal');
  if (!modal) {
    // Create modal if it doesn't exist
    createModal();
    showModal(request);
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

// Create modal element
function createModal() {
  const modal = document.createElement('div');
  modal.id = 'requestModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <h2>Request Details</h2>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Add modal styles if not already present
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
    `;
    document.head.appendChild(style);
  }
}

// Close modal
window.closeModal = function () {
  const modal = document.getElementById('requestModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('requestModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

// Show error message
function showError(message) {
  const tbody = document.querySelector('#requestsTable tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #d32f2f;">
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
