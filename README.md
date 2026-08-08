# Student Attendance Web App

## Included
- Add student: Roll No, Name, Class, Division, Email
- Delete students
- Generate individual QR codes
- Download QR as PNG
- Multiple student import through CSV
- QR camera scanning and attendance marking
- Duplicate attendance prevention per student/day
- Excel and PDF reports
- JSON database backup/restore
- Responsive mobile-friendly UI

## Important: database
This version uses browser localStorage as a free local database. It works immediately without a server, but data is stored only in that browser/device.

For a real school deployment with multiple teachers/devices, connect this UI to Supabase or Firebase. The schema is:
students(id, rollNo, name, className, division, email, qrId)
attendance(id, studentId, date, time, status)

## Important: email
The free browser version stores each student's email and opens the user's default email application using mailto. It cannot securely send QR image attachments automatically from a browser.

For automatic emailing to all students, connect an email service/backend (for example Resend, Brevo, EmailJS, or a server-side SMTP function) and generate/attach each QR PNG there. Do not put SMTP passwords in frontend code.

## Run
Open index.html for basic features. Camera scanning normally requires HTTPS or localhost.

## Free hosting
You can deploy the folder to Cloudflare Pages, GitHub Pages, or Netlify. Because camera access needs a secure origin, use the HTTPS deployment URL rather than a local file for scanning.

## CSV
Use the built-in template. Headers:
rollNo,name,class,division,email
