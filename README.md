# 🚗 checkMyCar

## Overview
**checkMyCar** is a hybrid **web and mobile application** that allows police officers to scan a vehicle’s QR code to instantly access vehicle and owner details.  
Vehicle owners can also manage their vehicle’s maintenance history, track service records, and store important documents securely in one place.

---

## ✨ Features
- 🔍 **QR Code Scanning:** Police can scan vehicle QR codes to view details instantly.  
- 🚘 **Vehicle Registration:** Each vehicle has a unique QR code linked to its profile.  
- 👮 **Police Dashboard:** Secure access for police officers to verify vehicle authenticity.  
- 🧾 **Owner Dashboard:** Vehicle owners can add, edit, and view maintenance records.  
- 🛠️ **Maintenance History:** Track service dates, repairs, and part replacements.  
- 📄 **Document Storage:** Upload insurance, license, and service invoices.  
- 🔐 **Role-Based Access:** Separate views for owners, police, and admins.  
- ⚡ **Real-Time Database:** Instant sync between web and mobile platforms.  
- 🔔 **Notifications:** Alerts for insurance or service renewal dates.

---

## 🧩 Tech Stack
### Frontend
- **Web:** Next.js / Nest.js 
- **Mobile:** Java/Firebase  

### Backend
- **Server:** Node.js / Express.js or Firebase Functions  
- **Database:** Firebase Firestore / PostgreSQL  
- **Authentication:** Firebase Auth (Email/Password, Role-based access)  
- **Storage:** Firebase Storage 

---

## 🧱 Architecture
- QR code generated during vehicle registration.
- Police scan the QR code via mobile app → fetch vehicle data from database.
- Owners manage vehicle info and maintenance via web dashboard.
- Data synced in real-time across platforms using Firebase.

---

## 🧑‍💻 User Roles
| Role | Access |
|------|---------|
| **Owner** | Register vehicle, manage maintenance records, upload files |
| **Police** | Scan QR codes, view vehicle and owner details |
| **Admin** | Manage users, monitor system, approve data changes |

---
## 🧑‍💻 Screen Shot
 <img src="https://github.com/user-attachments/assets/dac4578e-88b7-4b8b-ab32-c69b1fe9f9da" width="250" height="500" />
 <img src="https://github.com/user-attachments/assets/736003a9-2276-4ce9-8fec-2d3618f475ad" width="250" height="500" />
 <img src="https://github.com/user-attachments/assets/afbf8cab-a0ae-48cd-9b32-43fffcabed7c" width="250" height="500" />
 <img src="https://github.com/user-attachments/assets/089ae7b5-9f02-49fc-b6e8-e48836bc847b" width="250" height="500" />
 <img src="https://github.com/user-attachments/assets/b268f65e-7864-4652-833c-955ef71954ca" width="250" height="500" />
 <img src="https://github.com/user-attachments/assets/6dae8af9-7f27-4e0f-a3b1-6f699b13d677" width="250" height="500" />

## ⚙️ Installation
### Clone Repository
```bash
git clone https://github.com/yourusername/checkMyCar.git
cd checkMyCar
