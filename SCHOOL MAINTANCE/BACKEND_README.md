# School Maintenance Backend - Setup & Integration Guide

## 📁 Backend Structure

```
C:/xampp/htdocs/schoolmaintenance/
├── config/
│   └── db.php                    # Database configuration
├── backend/
│   ├── create_request.php        # Create new maintenance request
│   ├── get_requests.php          # Retrieve requests (with filters)
│   └── update_status.php         # Update request status
├── uploads/                      # Photo uploads directory
└── database/
    └── schema.sql                # Database schema
```

## 🗄️ Database Setup

### Step 1: Import Database Schema

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on "Import" tab
3. Choose file: `C:/Users/hp i7/Desktop/SCHOOL MAINTANCE/database/schema.sql`
4. Click "Go" to import

This will:
- Create database `school_maintenance`
- Create table `requests` with proper structure
- Insert sample data for testing

### Step 2: Verify Database

Check that database `school_maintenance` exists with table `requests` containing these columns:
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `issue_name` (VARCHAR 255)
- `description` (TEXT)
- `location` (VARCHAR 255)
- `reporter_name` (VARCHAR 255)
- `photo` (VARCHAR 255, nullable)
- `status` (ENUM: 'Pending', 'In Progress', 'Completed')
- `date_submitted` (TIMESTAMP)

## 🔌 API Endpoints

### 1. Create Request
**Endpoint:** `POST /backend/create_request.php`

**Request (FormData):**
```javascript
const formData = new FormData();
formData.append('issue_name', 'Broken Window');
formData.append('description', 'Window is cracked');
formData.append('location', 'Room 101');
formData.append('reporter_name', 'John Doe');
formData.append('photo', fileInput.files[0]); // Optional
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request submitted successfully.",
  "data": {
    "request_id": 5,
    "issue_name": "Broken Window",
    "status": "Pending"
  }
}
```

### 2. Get Requests
**Endpoint:** `GET /backend/get_requests.php`

**Query Parameters (all optional):**
- `status` - Filter by status: 'Pending', 'In Progress', 'Completed'
- `search` - Search term for issue_name, description, location, reporter_name
- `limit` - Number of records to return
- `offset` - Starting position for pagination

**Examples:**
```javascript
// Get all requests
fetch('http://localhost/schoolmaintenance/backend/get_requests.php')

// Filter by status
fetch('http://localhost/schoolmaintenance/backend/get_requests.php?status=Pending')

// Search
fetch('http://localhost/schoolmaintenance/backend/get_requests.php?search=window')

// Pagination
fetch('http://localhost/schoolmaintenance/backend/get_requests.php?limit=10&offset=0')
```

**Response:**
```json
{
  "success": true,
  "message": "Requests retrieved successfully.",
  "data": {
    "requests": [
      {
        "id": 1,
        "issue_name": "Broken Window",
        "description": "Window in classroom is cracked",
        "location": "Room 101, Building A",
        "reporter_name": "John Doe",
        "photo": "uploads/1702408800_abc123.jpg",
        "photo_url": "http://localhost/schoolmaintenance/uploads/1702408800_abc123.jpg",
        "status": "Pending",
        "date_submitted": "2025-12-12 20:00:00"
      }
    ],
    "total": 4,
    "count": 1
  }
}
```

### 3. Update Status
**Endpoint:** `POST /backend/update_status.php`

**Request (JSON):**
```javascript
fetch('http://localhost/schoolmaintenance/backend/update_status.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request_id: 1,
    status: 'In Progress'
  })
})
```

**Response:**
```json
{
  "success": true,
  "message": "Request status updated successfully.",
  "data": {
    "request_id": 1,
    "old_status": "Pending",
    "new_status": "In Progress"
  }
}
```

## 🔒 Security Features

- **Input Sanitization:** All inputs are sanitized using `mysqli_real_escape_string()`
- **Prepared Statements:** All SQL queries use prepared statements to prevent SQL injection
- **File Validation:**
  - Only JPG/PNG images allowed
  - Maximum file size: 3MB
  - File type verification using `getimagesize()`
  - Unique filename generation with timestamp
- **CORS Headers:** Enabled for local development
- **Error Handling:** Comprehensive error messages in JSON format

## 📸 File Upload Details

**Upload Directory:** `C:/xampp/htdocs/schoolmaintenance/uploads/`

**Validation Rules:**
- Allowed extensions: jpg, jpeg, png
- Maximum size: 3MB (3,145,728 bytes)
- Must be valid image (verified with `getimagesize()`)

**Filename Format:**
```
{timestamp}_{unique_id}.{extension}
Example: 1702408800_65789abc123.jpg
```

## 🔗 Frontend Integration Points

### index.html
Replace form submission with:
```javascript
document.getElementById('maintenanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('http://localhost/schoolmaintenance/backend/create_request.php', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Request submitted successfully!');
      e.target.reset();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error occurred');
  }
});
```

### view-requests.html
Load requests on page load:
```javascript
async function loadRequests(filters = {}) {
  const params = new URLSearchParams(filters);
  
  try {
    const response = await fetch(
      `http://localhost/schoolmaintenance/backend/get_requests.php?${params}`
    );
    
    const data = await response.json();
    
    if (data.success) {
      displayRequests(data.data.requests);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load all requests
loadRequests();

// Filter by status
loadRequests({ status: 'Pending' });

// Search
loadRequests({ search: 'window' });
```

### admin-dashboard.html
Update status on button click:
```javascript
async function updateStatus(requestId, newStatus) {
  try {
    const response = await fetch('http://localhost/schoolmaintenance/backend/update_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        status: newStatus
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Status updated successfully!');
      loadRequests(); // Reload table
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🧪 Testing

### Test Create Request (with cURL)
```bash
curl -X POST http://localhost/schoolmaintenance/backend/create_request.php \
  -F "issue_name=Test Issue" \
  -F "description=Test Description" \
  -F "location=Test Location" \
  -F "reporter_name=Test User"
```

### Test Get Requests
```bash
curl http://localhost/schoolmaintenance/backend/get_requests.php
```

### Test Update Status
```bash
curl -X POST http://localhost/schoolmaintenance/backend/update_status.php \
  -H "Content-Type: application/json" \
  -d '{"request_id":1,"status":"In Progress"}'
```

## ⚠️ Common Issues

### Issue: Database connection failed
**Solution:** Ensure XAMPP MySQL is running and credentials in `config/db.php` are correct

### Issue: File upload fails
**Solution:** 
- Check that `uploads/` directory exists and has write permissions
- Verify file size is under 3MB
- Ensure file is JPG or PNG format

### Issue: CORS errors
**Solution:** CORS headers are already included. If issues persist, check browser console.

### Issue: 404 Not Found
**Solution:** Verify XAMPP is running and files are in `C:/xampp/htdocs/schoolmaintenance/`

## 📝 Database Configuration

**File:** `config/db.php`

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'school_maintenance');
```

Change these values if your MySQL configuration is different.

## 🚀 Quick Start

1. Start XAMPP (Apache + MySQL)
2. Import `database/schema.sql` in phpMyAdmin
3. Verify uploads directory exists: `C:/xampp/htdocs/schoolmaintenance/uploads/`
4. Test endpoints using browser or cURL
5. Integrate with frontend using fetch() examples above

## 📊 Response Format

All endpoints return JSON with this structure:

```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* Optional additional data */ }
}
```

**Success Response:** `success: true`
**Error Response:** `success: false` with error message
