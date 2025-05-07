# 🛁 Abosefen & TamaveIrini | Sanitaryware Store Web App

A modern, responsive web application for managing and showcasing products in a local sanitaryware store based in Egypt.  
Built with **React + Tailwind CSS + Vite** to provide a clean UI and efficient performance on all screen sizes.

---

## 🎯 Features


- 🧭 **Sticky Responsive Header** with logo, navigation links, and animated mobile menu (burger → X)
- 🖼️ Product catalog with image, name, and price
- 🛒 **Add to Cart** button on each product
- ➕➖ **Increase/Decrease Quantity** per item in cart
- 🧠 Global **Cart State Management** using `useContext` + `useReducer`
- ⚙️ Clean and responsive UI with TailwindCSS
- 🔒 Prepared for:
  - Product details modal/page
  - Admin dashboard
  - SQL database integration (structure already available)
- 🧭 Home page with welcome message + featured categories
- 🗂️ Category-based product navigation (Categories → Products)
- 🌍 Contact page with:
  - 📬 Contact form via EmailJS (auto-reply enabled)
  - 📍 Store info: address, phone, email, working hours
  - 🗺️ Google Maps embed + clickable to open in Google Maps
  - 🖼️ Storefront image with responsive layout
- 💌 Styled HTML auto-reply with banner and personalized message
---

## 🧰 Tech Stack

| Technology    | Purpose                         |
|---------------|----------------------------------|
| React         | Frontend UI framework            |
| Tailwind CSS  | Utility-first CSS styling        |
| Vite          | Lightning-fast development setup |
| Context + Reducer | Global state for shopping cart |

---

## 🚀 Getting Started

To run the project locally:

```bash
git clone https://github.com/AntoniousShehata/AbosefenTamave.git
cd AbosefenTamave
npm install
npm run dev
```
---
Then open your browser at:
http://localhost:5173

---
## 📁 Project Structure

src/

├── components/        # Reusable UI components (Header)

├── pages/             # Main pages (Contact, Home, Products, ProductsPage)

├── pictures/          # Product images and logo

├── App.jsx            # Root application component

├── index.css          # Tailwind CSS styles

├── main.jsx           # React app entry point with CartProvider

---
## 📡 Deployment

The app is live and publicly accessible via **Vercel** at:

https://abosefen.vercel.app/

> Hosted using Vercel for fast global performance and free deployment.

---
## 👨‍💻 Developer


## Name: Antonious Shehata

🔗 [LinkedIn Profile](https://linkedin.com/in/antoniousshehata)  
🌐 [Portfolio Website](https://antoniousshehata.github.io)

---
