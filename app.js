const AUTH_KEY="teacher_attendance_logged_in";
const TEACHER_USERNAME="Harsha";
const TEACHER_PASSWORD="Harsha@31";
const DB_KEY="student_attendance_subject_v2";
let db=loadDatabase(),currentQR=null,scanner=null,activeSession=null;

function defaultDatabase(){return{students:[],subjects:[],sessions:[],attendance:[]}}
function loadDatabase(){
  try{const old=localStorage.getItem(DB_KEY);if(old){const data=JSON.parse(old);data.students??=[];data.subjects??=[];data.sessions??=[];data.attendance??=[];return data}}catch(e){console.error(e)}
  return defaultDatabase()
}
function save(){localStorage.setItem(DB_KEY,JSON.stringify(db))}
function makeId(prefix="ID"){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8).toUpperCase()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function today(){return new Date().toISOString().slice(0,10)}
function nowTime(){return new Date().toLocaleTimeString()}
function msg(text,className=""){const el=document.getElementById("msg");el.textContent=text;el.className=className}
function subjectMsg(text,className=""){const el=document.getElementById("subjectMsg");el.textContent=text;el.className=className}

function teacherLogin(event){
  event.preventDefault();
  const u=document.getElementById("teacherUsername").value.trim(),p=document.getElementById("teacherPassword").value;
  if(u===TEACHER_USERNAME&&p===TEACHER_PASSWORD){
    sessionStorage.setItem(AUTH_KEY,"1");document.getElementById("loginPage").classList.add("hidden");document.getElementById("appShell").classList.remove("hidden");document.getElementById("loginMsg").textContent="";initialiseApplication()
  }else{document.getElementById("loginMsg").textContent="Invalid username or password.";document.getElementById("loginMsg").className="error"}
}
function teacherLogout(){stopScanner();sessionStorage.removeItem(AUTH_KEY);document.getElementById("appShell").classList.add("hidden");document.getElementById("loginPage").classList.remove("hidden");document.getElementById("teacherPassword").value=""}
function isTeacherLoggedIn(){return sessionStorage.getItem(AUTH_KEY)==="1"}

function show(pageId){
  document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
  if(pageId==="students")renderStudents();
  if(pageId==="subjects")renderSubjects();
  if(pageId==="scan"){renderSubjectSelects();renderToday()}
  if(pageId==="reports"){renderSubjectSelects();renderStudentReportSelect();renderReport()}
  if(pageId!=="scan")stopScanner()
}
function initialiseApplication(){renderStudents();renderSubjects();renderSubjectSelects();renderStudentReportSelect();setDefaultDates();renderReport()}

function addStudent(){
  const roll=document.getElementById("roll").value.trim(),name=document.getElementById("name").value.trim(),className=document.getElementById("className").value.trim(),division=document.getElementById("division").value.trim(),email=document.getElementById("email").value.trim();
  if(!roll||!name)return msg("Roll No and Name are required.","error");
  if(db.students.some(s=>String(s.rollNo).toLowerCase()===roll.toLowerCase()))return msg("Roll No already exists.","error");
  db.students.push({id:makeId("STU"),rollNo:roll,name,className,division,email,qrId:"STU-"+crypto.randomUUID()});save();
  ["roll","name","className","division","email"].forEach(x=>document.getElementById(x).value="");msg("Student added successfully.","ok");renderStudents();renderStudentReportSelect()
}
function renderStudents(){
  const search=(document.getElementById("search")?.value||"").toLowerCase();
  const students=db.students.filter(s=>[s.rollNo,s.name,s.className,s.division,s.email].join(" ").toLowerCase().includes(search));
  document.getElementById("count").textContent=`${db.students.length} students`;
  document.getElementById("studentList").innerHTML=students.map(s=>`
    <div class="student"><div><b>${esc(s.rollNo)} - ${esc(s.name)}</b>
    <small>Class ${esc(s.className)} ${esc(s.division)} • ${esc(s.email||"No email")}</small>
    <small>Student QR ID: ${esc(s.qrId)}</small></div>
    <div class="actions"><button onclick="showQR('${s.id}')">QR</button><button onclick="sendEmail('${s.id}')">Email QR</button><button class="danger" onclick="deleteStudent('${s.id}')">Delete</button></div></div>`).join("")||"<p>No students found.</p>"
}
function deleteStudent(studentId){
  const student=db.students.find(s=>s.id===studentId);if(!student)return;
  if(!confirm(`Delete ${student.name}?\n\nAll attendance records for this student will also be deleted.`))return;
  db.students=db.students.filter(s=>s.id!==studentId);db.attendance=db.attendance.filter(a=>a.studentId!==studentId);save();renderStudents();renderStudentReportSelect()
}

function showQR(studentId){
  currentQR=db.students.find(s=>s.id===studentId);if(!currentQR)return;
  document.getElementById("qrTitle").textContent=`${currentQR.rollNo} - ${currentQR.name}`;
  document.getElementById("qrText").textContent=currentQR.qrId;
  const c=document.getElementById("qr");c.innerHTML="";new QRCode(c,{text:currentQR.qrId,width:240,height:240});
  document.getElementById("qrModal").classList.remove("hidden")
}
function closeQR(){document.getElementById("qrModal").classList.add("hidden")}
function qrCanvas(containerId){return document.querySelector(`#${containerId} canvas`)||document.querySelector(`#${containerId} img`)}
function elementToDataURL(el){if(!el)return null;if(el.tagName==="CANVAS")return el.toDataURL("image/png");return el.src}
function downloadDataURL(dataURL,filename){const a=document.createElement("a");a.href=dataURL;a.download=filename;document.body.appendChild(a);a.click();a.remove()}
function downloadQR(){if(!currentQR)return;const data=elementToDataURL(qrCanvas("qr"));if(data)downloadDataURL(data,`${currentQR.rollNo}_${currentQR.name}_QR.png`)}
function emailQR(){if(currentQR)sendEmail(currentQR.id)}
function sendEmail(studentId){
  const student=db.students.find(s=>s.id===studentId);if(!student)return;
  if(!student.email)return alert("No email address saved for this student.");
  showQR(student.id);
  setTimeout(()=>{
    const data=elementToDataURL(qrCanvas("qr"));if(data)downloadDataURL(data,`${student.rollNo}_${student.name}_QR.png`);
    const subject=encodeURIComponent("Student Attendance QR Code");
    const body=encodeURIComponent(`Hello ${student.name},\n\nYour Student Attendance QR code has been downloaded. Please attach the PNG file to this email before sending.\n\nRoll No: ${student.rollNo}\nQR ID: ${student.qrId}\n\nStudent Attendance System`);
    window.location.href=`mailto:${encodeURIComponent(student.email)}?subject=${subject}&body=${body}`
  },250)
}

function addSubject(){
  const code=document.getElementById("subjectCode").value.trim(),name=document.getElementById("subjectName").value.trim();
  if(!name)return subjectMsg("Subject name is required.","error");
  if(db.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase()))return subjectMsg("Subject already exists.","error");
  db.subjects.push({id:makeId("SUB"),code,name});save();document.getElementById("subjectCode").value="";document.getElementById("subjectName").value="";subjectMsg("Subject added successfully.","ok");renderSubjects();renderSubjectSelects()
}
function renderSubjects(){
  const c=document.getElementById("subjectList");if(!db.subjects.length){c.innerHTML="<p>No subjects added.</p>";return}
  c.innerHTML=db.subjects.map(s=>`<div class="student"><div><b>${esc(s.code||"")}${s.code?" - ":""}${esc(s.name)}</b><small>Subject ID: ${esc(s.id)}</small></div><button class="danger" onclick="deleteSubject('${s.id}')">Delete</button></div>`).join("")
}
function deleteSubject(subjectId){
  const subject=db.subjects.find(s=>s.id===subjectId);if(!subject)return;
  if(db.sessions.some(s=>s.subjectId===subjectId))return alert("This subject already has attendance sessions. Keep it for reporting, or delete its data from a backup/edit workflow.");
  if(!confirm(`Delete subject "${subject.name}"?`))return;
  db.subjects=db.subjects.filter(s=>s.id!==subjectId);save();renderSubjects();renderSubjectSelects()
}
function subjectOptions(includeAll=false){return(includeAll?`<option value="">All Subjects</option>`:`<option value="">Select Subject</option>`)+db.subjects.map(s=>`<option value="${esc(s.id)}">${esc(s.code||"")}${s.code?" - ":""}${esc(s.name)}</option>`).join("")}
function renderSubjectSelects(){
  ["attendanceSubject","reportSubject"].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;const cur=el.value;el.innerHTML=subjectOptions(id==="reportSubject");if(db.subjects.some(s=>s.id===cur))el.value=cur
  })
}

function createAttendanceSession(){
  const subjectId=document.getElementById("attendanceSubject").value,title=document.getElementById("sessionTitle").value.trim();if(!subjectId)return alert("Please select a subject first.");
  const subject=db.subjects.find(s=>s.id===subjectId);if(!subject)return;
  const session={id:makeId("SES"),subjectId,title,date:today(),startTime:nowTime(),endTime:null,token:"ATT-"+crypto.randomUUID()};
  db.sessions.push(session);save();activeSession=session;
  document.getElementById("activeSessionBox").classList.remove("hidden");
  document.getElementById("activeSessionSubject").textContent=`${subject.code?subject.code+" - ":""}${subject.name}`;
  document.getElementById("activeSessionDetails").textContent=`${session.date} • Started ${session.startTime}`;
  const c=document.getElementById("sessionQR");c.innerHTML="";new QRCode(c,{text:session.token,width:280,height:280});
  document.getElementById("scanMsg").textContent="Attendance session started. Students can now be scanned."
}
function closeAttendanceSession(){
  if(!activeSession)return;activeSession.endTime=nowTime();save();activeSession=null;document.getElementById("activeSessionBox").classList.add("hidden");document.getElementById("sessionQR").innerHTML="";document.getElementById("scanMsg").textContent="Attendance session closed."
}
function downloadSessionQR(){
  if(!activeSession)return alert("Start an attendance session first.");
  const data=elementToDataURL(qrCanvas("sessionQR"));if(!data)return alert("QR code is not ready.");
  const subject=db.subjects.find(s=>s.id===activeSession.subjectId);downloadDataURL(data,`${subject?.name||"Subject"}_Attendance_${activeSession.date}.png`)
}
function shareSessionQR(){
  if(!activeSession)return alert("Start an attendance session first.");
  downloadSessionQR();const subject=db.subjects.find(s=>s.id===activeSession.subjectId),subjectName=subject?.name||"Attendance",email=prompt("Enter recipient email address:");if(!email)return;
  const subjectText=encodeURIComponent(`Attendance QR - ${subjectName} - ${activeSession.date}`);
  const body=encodeURIComponent(`Hello,\n\nAttendance QR for ${subjectName}\nDate: ${activeSession.date}\nStart Time: ${activeSession.startTime}\n\nThe QR PNG has been downloaded. Please attach the downloaded PNG to this email before sending.\n\nStudent Attendance System`);
  window.location.href=`mailto:${encodeURIComponent(email)}?subject=${subjectText}&body=${body}`
}

async function startScanner(){
  if(scanner)return;if(!activeSession)return alert("Please generate an attendance session first.");
  scanner=new Html5Qrcode("reader");
  try{await scanner.start({facingMode:"environment"},{fps:10,qrbox:{width:250,height:250}},text=>markAttendance(text),()=>{})}
  catch(e){console.error(e);document.getElementById("scanMsg").textContent="Camera could not start. Use HTTPS/GitHub Pages and allow camera permission.";scanner=null}
}
async function stopScanner(){if(!scanner)return;try{await scanner.stop()}catch(e){}scanner=null}

function markAttendance(qr){
  if(!activeSession)return;
  const student=db.students.find(s=>s.qrId===qr);
  if(!student){document.getElementById("scanMsg").textContent="Unknown student QR.";return}
  if(db.attendance.some(a=>a.studentId===student.id&&a.sessionId===activeSession.id)){document.getElementById("scanMsg").textContent=`Already marked: ${student.name}`;return}
  const now=new Date();
  db.attendance.push({id:makeId("ATT"),studentId:student.id,sessionId:activeSession.id,subjectId:activeSession.subjectId,date:activeSession.date,time:now.toLocaleTimeString(),status:"Present"});
  save();document.getElementById("scanMsg").textContent=`Present: ${student.name} • ${now.toLocaleTimeString()}`;renderToday();renderReport()
}
function renderToday(){
  const rows=db.attendance.filter(a=>a.date===today()).sort((a,b)=>String(b.time).localeCompare(String(a.time)));
  document.getElementById("todayList").innerHTML=rows.map(a=>{const st=db.students.find(s=>s.id===a.studentId),su=db.subjects.find(s=>s.id===a.subjectId);return `<p>✅ <b>${esc(st?.rollNo)} - ${esc(st?.name)}</b> — ${esc(su?.name||"Unknown Subject")} — ${esc(a.time)}</p>`}).join("")||"<p>No attendance yet today.</p>"
}
function renderStudentReportSelect(){
  const el=document.getElementById("reportStudent");if(!el)return;const cur=el.value;el.innerHTML=`<option value="">All Students</option>`+db.students.map(s=>`<option value="${esc(s.id)}">${esc(s.rollNo)} - ${esc(s.name)}</option>`).join("");if(db.students.some(s=>s.id===cur))el.value=cur
}
function filteredAttendance(){
  const from=document.getElementById("fromDate").value,to=document.getElementById("toDate").value,subjectId=document.getElementById("reportSubject").value,studentId=document.getElementById("reportStudent").value;
  return db.attendance.filter(a=>(!from||a.date>=from)&&(!to||a.date<=to)&&(!subjectId||a.subjectId===subjectId)&&(!studentId||a.studentId===studentId))
}
function renderReport(){
  const rows=filteredAttendance();renderSummary(rows);const table=document.getElementById("reportTable");
  if(!rows.length){table.innerHTML="<p>No attendance records found.</p>";return}
  table.innerHTML=`<div class="tableWrap"><table><thead><tr><th>Roll</th><th>Name</th><th>Subject</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>${rows.map(a=>{const st=db.students.find(s=>s.id===a.studentId),su=db.subjects.find(s=>s.id===a.subjectId);return `<tr><td>${esc(st?.rollNo)}</td><td>${esc(st?.name)}</td><td>${esc(su?.name||"")}</td><td>${esc(a.date)}</td><td>${esc(a.time)}</td><td>${esc(a.status)}</td></tr>`}).join("")}</tbody></table></div>`
}
function renderSummary(rows){
  const summary=document.getElementById("summary"),subjectId=document.getElementById("reportSubject").value,studentId=document.getElementById("reportStudent").value,from=document.getElementById("fromDate").value,to=document.getElementById("toDate").value;
  const sessions=db.sessions.filter(s=>(!subjectId||s.subjectId===subjectId)&&(!from||s.date>=from)&&(!to||s.date<=to));
  const students=studentId?db.students.filter(s=>s.id===studentId):db.students;
  if(!students.length){summary.innerHTML="<p>No students found.</p>";return}
  const data=students.map(student=>{const present=rows.filter(a=>a.studentId===student.id).length,total=sessions.length,pct=total?((present/total)*100).toFixed(2):"0.00";return{student,present,total,pct}});
  summary.innerHTML=`<div class="summaryCards"><div class="summaryCard"><b>Total Classes</b><strong>${sessions.length}</strong></div><div class="summaryCard"><b>Total Students</b><strong>${students.length}</strong></div><div class="summaryCard"><b>Attendance Records</b><strong>${rows.length}</strong></div></div><div class="tableWrap"><table><thead><tr><th>Roll</th><th>Student</th><th>Present</th><th>Total Classes</th><th>Attendance %</th></tr></thead><tbody>${data.map(x=>`<tr><td>${esc(x.student.rollNo)}</td><td>${esc(x.student.name)}</td><td>${x.present}</td><td>${x.total}</td><td><strong>${x.pct}%</strong></td></tr>`).join("")}</tbody></table></div>`
}

function parseCSVLine(line){const r=[];let cur="",quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"')quoted=!quoted;else if(ch===","&&!quoted){r.push(cur.trim());cur=""}else cur+=ch}r.push(cur.trim());return r}
function importCSV(event){
  const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const lines=reader.result.split(/\r?\n/).filter(Boolean);if(!lines.length)return;const header=lines.shift().split(",").map(x=>x.trim().toLowerCase());let added=0;lines.forEach(line=>{const values=parseCSVLine(line),obj={};header.forEach((h,i)=>obj[h]=values[i]||"");const roll=obj.rollno||obj.roll||"",name=obj.name||"";if(roll&&name&&!db.students.some(s=>String(s.rollNo)===String(roll))){db.students.push({id:makeId("STU"),rollNo:roll,name,className:obj.class||"",division:obj.division||"",email:obj.email||"",qrId:"STU-"+crypto.randomUUID()});added++}});save();renderStudents();renderStudentReportSelect();alert(`${added} students imported successfully.`)};reader.readAsText(file)
}
function downloadCSVTemplate(){const csv="rollNo,name,class,division,email\n1,Rahul Patil,10,A,rahul@example.com\n2,Priya Shah,10,A,priya@example.com";const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="students_template.csv";a.click()}

function exportExcel(){
  const rows=filteredAttendance(),data=rows.map(a=>{const st=db.students.find(s=>s.id===a.studentId)||{},su=db.subjects.find(s=>s.id===a.subjectId)||{},se=db.sessions.find(s=>s.id===a.sessionId)||{};return{RollNo:st.rollNo||"",Name:st.name||"",Class:st.className||"",Division:st.division||"",Email:st.email||"",Subject:su.name||"",SubjectCode:su.code||"",Session:se.title||"",Date:a.date||"",Time:a.time||"",Status:a.status||""}});
  const ws=XLSX.utils.json_to_sheet(data),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Attendance");XLSX.writeFile(wb,"subject_wise_attendance.xlsx")
}
function exportPDF(){
  const rows=filteredAttendance(),{jsPDF}=window.jspdf,doc=new jsPDF();doc.setFontSize(16);doc.text("Subject-wise Attendance Report",14,18);let y=30;doc.setFontSize(9);
  rows.forEach(a=>{const st=db.students.find(s=>s.id===a.studentId)||{},su=db.subjects.find(s=>s.id===a.subjectId)||{},line=`${st.rollNo||""} | ${st.name||""} | ${su.name||""} | ${a.date} ${a.time} | ${a.status}`;if(y>280){doc.addPage();y=18}doc.text(line.slice(0,115),14,y);y+=7});doc.save("subject_wise_attendance.pdf")
}
function downloadBackup(){const a=document.createElement("a");a.href="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(db,null,2));a.download=`attendance_backup_${today()}.json`;a.click()}
function restoreBackup(event){
  const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const r=JSON.parse(reader.result);if(!r.students||!r.subjects||!r.sessions||!r.attendance)throw Error("Invalid");if(!confirm("Restore this backup?\n\nCurrent browser data will be replaced."))return;db=r;save();renderStudents();renderSubjects();renderSubjectSelects();renderStudentReportSelect();renderReport();alert("Backup restored successfully.")}catch(e){alert("Invalid backup file.")}};reader.readAsText(file)
}
function setDefaultDates(){document.getElementById("fromDate").value=new Date(Date.now()-30*86400000).toISOString().slice(0,10);document.getElementById("toDate").value=today()}

document.addEventListener("DOMContentLoaded",()=>{
  ["fromDate","toDate","reportSubject","reportStudent"].forEach(id=>document.getElementById(id).addEventListener("change",renderReport));
  if(isTeacherLoggedIn()){document.getElementById("loginPage").classList.add("hidden");document.getElementById("appShell").classList.remove("hidden");initialiseApplication()}
});
