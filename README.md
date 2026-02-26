# 🎨 The Varches — Sketch Selling Website

A full-stack website for selling original hand-drawn sketches with an overwhelming artistic UI.

---

## 📁 Project Structure

```
thevarches/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── db.js              # MySQL connection pool
│   ├── schema.sql         # Database schema + seed data
│   ├── .env               # Environment variables
│   ├── middleware/
│   │   └── auth.js        # JWT auth middleware
│   ├── routes/
│   │   ├── sketches.js    # Sketch CRUD API
│   │   ├── categories.js  # Categories API
│   │   ├── orders.js      # Orders API
│   │   ├── inquiries.js   # Inquiry/contact API
│   │   ├── admin.js       # Admin auth + stats
│   │   └── upload.js      # Image upload (multer)
│   └── public/
│       └── uploads/       # Uploaded sketch images (auto-created)
│
└── frontend/
    ├── index.html         # 🎨 Main storefront
    └── admin.html         # 🔐 Admin dashboard
```

---

## ⚡ Quick Setup

### 1. MySQL Database

```bash
mysql -u root -p < backend/schema.sql
```

### 2. Configure Environment

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=thevarches
JWT_SECRET=change_this_to_something_secure
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Install & Start Backend

```bash
cd backend
npm install
npm start
```

Server runs at: **http://localhost:5000**

### 4. Open Frontend

Open `frontend/index.html` directly in your browser, or serve with:
```bash
cd frontend
npx serve . -p 3000
```

- **Storefront**: http://localhost:3000/index.html
- **Admin Panel**: http://localhost:3000/admin.html

---

## 🔐 Admin Login

- Email: `admin@thevarches.com`
- Password: `admin123`

> Change these after first login in your MySQL database.

---

## 🖼️ Adding Sketches (Admin Panel)

1. Go to **admin.html**
2. Login with admin credentials
3. Click **Add Sketch** in the sidebar
4. Fill in the title, price, category, medium
5. **Drag & drop or click to upload the sketch image**
6. Click **Save Sketch**

The image is stored in `backend/public/uploads/` and served at `http://localhost:5000/uploads/filename.jpg`.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sketches` | List all sketches |
| GET | `/api/sketches?category=portraits` | Filter by category |
| GET | `/api/sketches?featured=true` | Featured sketches |
| GET | `/api/sketches/:id` | Single sketch |
| POST | `/api/sketches` | Create sketch (admin) |
| PUT | `/api/sketches/:id` | Update sketch (admin) |
| DELETE | `/api/sketches/:id` | Delete sketch (admin) |
| GET | `/api/categories` | List categories |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | List orders (admin) |
| POST | `/api/inquiries` | Send inquiry |
| GET | `/api/inquiries` | List inquiries (admin) |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard stats (admin) |
| POST | `/api/upload/sketch` | Upload image (admin) |

---

## ✨ Features

### Storefront
- 🎨 Overwhelming artistic UI with dark ink aesthetic
- Custom cursor with lag effect
- Full-screen hero with featured sketch grid
- Category filter bar
- Sketch gallery with hover overlays
- Lightbox for sketch details
- Shopping cart drawer
- Checkout modal → creates real DB order
- Contact/Inquiry form
- Animated marquee, grain texture, scroll animations

### Admin Panel
- Secure JWT login
- Dashboard stats (sketches, orders, revenue, inquiries)
- Add/Edit/Delete sketches with **image upload**
- Drag & drop image upload with preview
- Order management with status updates
- Customer inquiry viewer

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL (mysql2)
- **Auth**: JWT + bcryptjs
- **File Upload**: Multer
- **Frontend**: Vanilla HTML/CSS/JS (zero dependencies)
- **Fonts**: Playfair Display, Cormorant Garamond, Space Mono

---

*The Varches — Art for those who value the singular.*
