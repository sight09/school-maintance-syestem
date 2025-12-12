# School Maintenance & Repair Request System

A pure HTML, CSS, and JavaScript frontend for a school maintenance request system.

## Setup
No installation or build tools are required.
1. Download/Unzip the folder.
2. Open `index.html` in your web browser (Chrome, Firefox, Edge, etc.).

## Files
- `index.html`: **Submit Request** page.
- `view-requests.html`: **My Requests** view.
- `admin-dashboard.html`: **Admin Dashboard** management view.
- `css/styles.css`: Main stylesheet.
- `js/app.js`: Main logic file handling data and interaction.

## Backend Integration
The application currently uses `localStorage` to simulate a database.
To integrate with a real backend, look for the `TODO` comments in `js/app.js`.

Example spot for submission:
```javascript
// js/app.js (approx line 108)
/* TODO: POST to server
 * fetch('/api/requests', { method: 'POST', body: JSON.stringify(newRequest) })
 */
```

Example spot for status update:
```javascript
// js/app.js (approx line 186)
/* TODO: POST status update to server */
```
