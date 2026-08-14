# Student Attendance - One QR Per Student, Subject-wise Attendance

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


## Updated attendance workflow

1. Add students. Each student receives one permanent personal QR code.
2. Add subjects.
3. Open **Attendance** and select the subject.
4. Click **Start Attendance**.
5. Scan students' personal QR codes. No new QR is generated per subject.
6. A student cannot be marked twice for the same subject on the same date.
7. Open **Reports** and filter by subject, student, and from/to dates.
8. Export the filtered subject-wise report to Excel or PDF.

Attendance records store the student, selected subject, session/date, time and status.
