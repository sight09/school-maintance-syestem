/**
 * Plain HTML/CSS/JavaScript — No TypeScript, No Frameworks
 * 
 * Main Application Logic
 * Handles data persistence (localStorage), form validation, and UI updates.
 */

// --- Data Store & Mock Data ---
const STORAGE_KEY = 'maintenance_requests_v1';

const MOCK_DATA = [
    {
        id: 'req_001',
        issue: 'Broken Projector',
        description: 'The projector in Room 301 is displaying pink colors and flickering constantly.',
        location: 'Room 301',
        reporter: 'Alice Teacher',
        status: 'Pending',
        date: '2023-10-25T09:30:00.000Z',
        image: 'https://placehold.co/400x300?text=Projector' // Placeholder
    },
    {
        id: 'req_002',
        issue: 'Leaking Sink',
        description: 'Water is dripping from the faucet in the 2nd floor boys restroom.',
        location: '2nd Floor Restroom',
        reporter: 'Bob Janitor',
        status: 'In Progress',
        date: '2023-10-24T14:15:00.000Z',
        image: 'https://placehold.co/400x300?text=Sink'
    },
    {
        id: 'req_003',
        issue: 'AC Not Cooling',
        description: 'Library AC unit is blowing warm air.',
        location: 'Library',
        reporter: 'Sarah Librarian',
        status: 'Completed',
        date: '2023-10-20T11:00:00.000Z',
        image: null // No image example
    }
];

const DataStore = {
    getAll: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
            return MOCK_DATA;
        }
        return JSON.parse(stored);
    },
    add: (request) => {
        const data = DataStore.getAll();
        data.unshift(request); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return request;
    },
    updateStatus: (id, newStatus) => {
        const data = DataStore.getAll();
        const index = data.findIndex(r => r.id === id);
        if (index !== -1) {
            data[index].status = newStatus;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        }
        return false;
    }
};

// --- Utilities ---
const Utils = {
    generateId: () => 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    formatDate: (isoString) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    },
    showToast: (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    truncate: (str, len = 50) => {
        if (str.length <= len) return str;
        return str.substring(0, len) + '...';
    },
    fileToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
};

// --- Page Logic ---

// 1. Submission Page Logic
const initSubmissionPage = () => {
    const form = document.getElementById('requestForm');
    if (!form) return;

    const fileInput = document.getElementById('photo');
    const preview = document.getElementById('preview');
    let currentImageBase64 = null;

    // Image Preview
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file (JPG, PNG).');
                fileInput.value = '';
                preview.classList.remove('visible');
                return;
            }
            try {
                currentImageBase64 = await Utils.fileToBase64(file);
                preview.src = currentImageBase64;
                preview.classList.add('visible');
            } catch (err) {
                console.error('Error reading file:', err);
            }
        } else {
            preview.classList.remove('visible');
            currentImageBase64 = null;
        }
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic Validation (Native HTML5 validation handles most, but we double check)
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) isValid = false;
        });

        if (!isValid) return; // Browser will likely stop this before here due to 'required' attr

        const newRequest = {
            id: Utils.generateId(),
            issue: document.getElementById('issueName').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            reporter: document.getElementById('reporterName').value,
            status: 'Pending',
            date: new Date().toISOString(),
            image: currentImageBase64
        };

        // Create
        DataStore.add(newRequest);
        
        /* TODO: POST to server
         * fetch('/api/requests', { method: 'POST', body: JSON.stringify(newRequest) })
         */
        console.log('Submission:', newRequest);

        // Feedback
        Utils.showToast('Maintenance request submitted successfully!');
        form.reset();
        preview.classList.remove('visible');
        currentImageBase64 = null;
    });
};

// 2. View & Admin Page Logic
const createModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <img class="modal-img" src="" alt="Full Preview">
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const close = () => modal.classList.remove('open');
    
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    return {
        open: (imgSrc) => {
            modal.querySelector('.modal-img').src = imgSrc;
            modal.classList.add('open');
        }
    };
};

const initTablePage = (isAdmin) => {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('statusFilter'); // Only on admin
    if (!tableBody) return;

    const modal = createModal();
    let requests = DataStore.getAll();

    const render = (data) => {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No requests found.</td></tr>';
            return;
        }

        data.forEach(req => {
            const tr = document.createElement('tr');
            
            // Image Cell
            const imgHtml = req.image 
                ? `<img src="${req.image}" class="table-thumbnail" alt="Thumb">` 
                : `<span style="color:#ccc; font-size:0.8rem;">No Img</span>`;

            // Status Cell
            const statusClass = `status-${req.status.toLowerCase().replace(' ', '-')}`;
            
            // Action Cell (Admin Only)
            let actionHtml = '';
            if (isAdmin) {
                // TODO: Update this to a dropdown or buttons
                actionHtml = `
                    <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                        <button class="btn btn-sm btn-outline" data-id="${req.id}" data-status="Pending" title="Set Pending">⏳</button>
                        <button class="btn btn-sm btn-outline" data-id="${req.id}" data-status="In Progress" title="Set In Progress">⚙️</button>
                        <button class="btn btn-sm btn-outline" data-id="${req.id}" data-status="Completed" title="Set Completed">✅</button>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td><strong>${req.issue}</strong></td>
                <td>${req.location}</td>
                <td title="${req.description}">
                    ${Utils.truncate(req.description, 40)} 
                    ${req.description.length > 40 ? '<small style="color:blue;cursor:pointer">read more</small>' : ''}
                </td>
                <td>${req.reporter}</td>
                <td><span class="status-badge ${statusClass}">${req.status}</span></td>
                <td>${Utils.formatDate(req.date)}</td>
                <td>${imgHtml}</td>
                ${isAdmin ? `<td>${actionHtml}</td>` : ''}
            `;

            // Thumbnail Click
            if (req.image) {
                const imgEl = tr.querySelector('.table-thumbnail');
                imgEl.addEventListener('click', () => modal.open(req.image));
            }

            // Status Actions (Admin)
            if (isAdmin) {
                tr.querySelectorAll('button[data-status]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const newStatus = e.currentTarget.dataset.status;
                        const id = e.currentTarget.dataset.id;
                        /* TODO: POST status update to server */
                        DataStore.updateStatus(id, newStatus);
                        Utils.showToast(`Status updated to ${newStatus}`);
                        // Re-render
                        const freshData = DataStore.getAll();
                        requests = freshData; // Update local ref
                        filterAndRender(); // Re-apply current filters
                    });
                });
            }

            tableBody.appendChild(tr);
        });
    };

    const filterAndRender = () => {
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterSelect ? filterSelect.value : 'All';

        const filtered = requests.filter(r => {
            const matchesSearch = r.issue.toLowerCase().includes(term) || 
                                  r.location.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        render(filtered);
    };

    // Events
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterAndRender);
    }

    // Initial Render
    render(requests);
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on
    const path = window.location.pathname;
    
    if (document.getElementById('requestForm')) {
        initSubmissionPage();
    } else if (document.getElementById('adminTable')) {
        initTablePage(true); // Is Admin
    } else if (document.getElementById('requestsTable')) {
        initTablePage(false); // User View
    }
});
