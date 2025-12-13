# Photo Upload Backend - Complete Guide

## 📁 Project Structure

```
photo_backend/
├── config.php              # Database configuration
├── upload.php              # Photo upload endpoint
├── get_photos.php          # Retrieve photos endpoint
├── uploads/                # Photo storage folder
└── database/
    └── schema.sql          # Database schema
```

## 🗄️ Database Setup

### Step 1: Import Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click **"SQL"** tab
3. Copy and paste the SQL from `database/schema.sql`
4. Click **"Go"**

**Database:** `media_storage_db`  
**Table:** `user_photos`

**Columns:**
- `id` - INT, AUTO_INCREMENT, PRIMARY KEY
- `username` - VARCHAR(255)
- `photo` - VARCHAR(255) - stores filename/path
- `created_at` - TIMESTAMP

## 🚀 Deployment

### Copy to XAMPP/Laragon

**XAMPP:** Copy `photo_backend` folder to `C:/xampp/htdocs/`  
**Laragon:** Copy `photo_backend` folder to `C:/laragon/www/`

### Start Server

- **XAMPP:** Start Apache + MySQL
- **Laragon:** Start All

## 📡 API Endpoints

### 1. Upload Photo

**Endpoint:** `POST /upload.php`

**Request (FormData):**
```javascript
const formData = new FormData();
formData.append('username', 'john_doe');
formData.append('photo', fileInput.files[0]);

fetch('http://localhost/photo_backend/upload.php', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Photo uploaded:', data.data);
    } else {
        console.error('Error:', data.message);
    }
});
```

**Success Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully.",
  "data": {
    "id": 4,
    "username": "john_doe",
    "photo": "uploads/1702408900_abc123.jpg",
    "photo_url": "http://localhost/photo_backend/uploads/1702408900_abc123.jpg",
    "created_at": "2025-12-12 21:05:00"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "File size exceeds 3MB limit."
}
```

### 2. Get Photos

**Endpoint:** `GET /get_photos.php`

**Get all photos:**
```javascript
fetch('http://localhost/photo_backend/get_photos.php')
.then(response => response.json())
.then(data => {
    console.log('Photos:', data.data.photos);
});
```

**Filter by username:**
```javascript
fetch('http://localhost/photo_backend/get_photos.php?username=john_doe')
.then(response => response.json())
.then(data => {
    console.log('User photos:', data.data.photos);
});
```

**Response:**
```json
{
  "success": true,
  "message": "Photos retrieved successfully.",
  "data": {
    "photos": [
      {
        "id": 1,
        "username": "john_doe",
        "photo": "uploads/1702408800_sample1.jpg",
        "photo_url": "http://localhost/photo_backend/uploads/1702408800_sample1.jpg",
        "created_at": "2025-12-12 20:00:00"
      }
    ],
    "count": 1
  }
}
```

## ✅ Validation Rules

**File Types:** JPG, JPEG, PNG, WEBP  
**Max Size:** 3MB (3,145,728 bytes)  
**Validation:** Uses `getimagesize()` to verify image

## 🔒 Security Features

- Prepared statements (SQL injection protection)
- Input sanitization
- File type validation
- File size limits
- Image verification with `getimagesize()`
- Unique filename generation (timestamp + unique ID)

## 📸 File Storage Method

✅ **Recommended Method Used:**
- Photos stored in `uploads/` folder
- Only filename/path saved in database
- Unique filenames prevent conflicts
- Format: `{timestamp}_{unique_id}.{extension}`

## 🧪 Testing

### Test Upload (cURL)
```bash
curl -X POST http://localhost/photo_backend/upload.php \
  -F "username=test_user" \
  -F "photo=@/path/to/image.jpg"
```

### Test Get Photos
```bash
curl http://localhost/photo_backend/get_photos.php
```

## 📝 Configuration

**File:** `config.php`

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'media_storage_db');
```

Change these if your MySQL settings are different.

## ⚠️ Common Issues

**Issue:** Database connection failed  
**Solution:** Ensure MySQL is running and credentials are correct

**Issue:** File upload fails  
**Solution:** Check `uploads/` folder exists and has write permissions

**Issue:** 404 Not Found  
**Solution:** Verify files are in `C:/xampp/htdocs/photo_backend/`

## 🎯 Quick Start

1. Copy `photo_backend` to `C:/xampp/htdocs/`
2. Start XAMPP (Apache + MySQL)
3. Import `database/schema.sql` in phpMyAdmin
4. Test: `http://localhost/photo_backend/get_photos.php`
5. Use the upload form to test photo uploads

## 📊 Response Format

All endpoints return JSON:
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* Optional data */ }
}
```
