# Student Attendance - Subject-wise QR Version

GitHub Pages compatible static attendance application.

## Features

- Teacher login
- Student management
- Student QR generation
- Subject management
- Subject/session QR generation
- Subject-wise attendance
- Multiple subjects on the same date
- Camera QR scanner
- Attendance percentage reports
- Excel export
- PDF export
- JSON backup/restore
- PNG QR download
- Email app integration

## Login

Default demo credentials:

Username: `Harsha`
Password: `Harsha@31`

Change these values in `app.js` before deployment if needed.

## GitHub Pages

1. Push all files to a GitHub repository.
2. GitHub → Settings → Pages.
3. Source: Deploy from branch.
4. Branch: `main`, folder `/ (root)`.
5. Open the HTTPS GitHub Pages URL.

Camera access requires HTTPS.

## Important limitation

This version uses browser `localStorage`. It is intended for a teacher/device based workflow.

Different phones and computers do NOT share the same localStorage database.

For a workflow where students scan the teacher QR on their own phones and the attendance immediately appears on the teacher's device, a shared cloud database/backend is required.

## Email limitation

GitHub Pages cannot securely send an email attachment by itself.

The Email QR buttons download the PNG and open the user's mail application with a prepared message. The downloaded PNG must be attached manually.

Do not put SMTP passwords or secret API keys in frontend JavaScript.

## Libraries

The application loads these libraries from CDNs:

- QRCode.js
- html5-qrcode
- SheetJS/XLSX
- jsPDF
