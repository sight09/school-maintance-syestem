// Backend API URL - Update this if your folder name is different
const API_BASE_URL = 'http://localhost/schoolmaintenance/backend';

// Photo preview functionality
document.getElementById('photo').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    // Validate file size (3MB max)
    if (file.size > 3145728) {
      alert('File size exceeds 3MB limit!');
      e.target.value = '';
      document.getElementById('preview').style.display = 'none';
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type! Only JPG and PNG allowed.');
      e.target.value = '';
      document.getElementById('preview').style.display = 'none';
      return;
    }

    // Show preview
    const img = document.getElementById('preview');
    img.src = URL.createObjectURL(file);
    img.style.display = 'block';
  }
});

// Form submission with backend integration
document.getElementById('maintenanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(e.target);

  // Get submit button
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/create_request.php`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Success - show message
      alert(`✅ Success! Maintenance request submitted.\n\nRequest ID: ${data.data.request_id}\nIssue: ${data.data.issue_name}\nStatus: ${data.data.status}`);

      // Reset form
      e.target.reset();
      document.getElementById('preview').style.display = 'none';

      // Optional: Redirect to view requests page
      // window.location.href = 'view-requests.html';
    } else {
      // Error from backend
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('❌ Network error: Could not connect to backend.\n\nMake sure:\n1. XAMPP is running\n2. Database is imported\n3. Files are in C:/xampp/htdocs/schoolmaintenance/');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
