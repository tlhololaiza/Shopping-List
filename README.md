# 🛒 Shopping List Application

A modern, fully responsive shopping list management application built with React, TypeScript, and Redux Toolkit. Create multiple shopping lists, manage items with detailed information, and enjoy a seamless experience across all devices.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with encrypted password storage
- **Multiple Shopping Lists**: Create and manage multiple shopping lists simultaneously
- **Item Management**: Add, edit, and delete items with comprehensive details
  - Item name, quantity, category, and notes
  - Image URL support with preview
  - Search and filter capabilities
  - Sort by name, category, or quantity

### User Experience
- **Fully Responsive Design**: Optimized for desktop, tablet, and mobile devices
  - Hamburger menu navigation on mobile (< 768px)
  - Adaptive layouts and components
  - Touch-friendly interface
- **Real-time Notifications**: Toast notifications for all user actions
- **Protected Routes**: Secure access to authenticated pages
- **User Profile Management**: View and update user information

### Technical Features
- **State Management**: Redux Toolkit for predictable state management
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: Client-side validation with custom utilities
- **RESTful API**: JSON Server backend with organized endpoints
- **Modern UI/UX**: Glassmorphism design with smooth transitions

## 🚀 Tech Stack

- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Styling**: Custom CSS with Poppins font family
- **Icons**: Lucide React
- **Notifications**: React Toastify 11.0.5
- **Backend**: JSON Server (development)
- **Security**: AES encryption for passwords

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shopping-List
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the JSON Server (backend)**
   ```bash
   npm run server
   ```
   The API will run on `http://localhost:3000`

4. **Start the development server (frontend)**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5173`

## 🎯 Usage

### Getting Started
1. **Register**: Create a new account on the registration page
2. **Login**: Sign in with your credentials
3. **Create Lists**: Add new shopping lists from the dashboard
4. **Manage Items**: Add items with details like quantity, category, and images
5. **Search & Sort**: Find items quickly using search and sorting features

### Navigation
- **Home**: Landing page with feature overview
- **Lists**: View and manage all shopping lists
- **Profile**: Update user information
- **Logout**: Securely sign out

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full navigation bar)
- **Tablet/Mobile**: ≤ 768px (hamburger menu)
- **Small Mobile**: ≤ 480px (optimized compact layout)

## 🏗️ Project Structure

```
src/
├── api/              # API service layer (JSON Server)
├── assets/           # Static assets
├── components/       # Reusable components
│   ├── Button/
│   ├── Input/
│   ├── Navbar/
│   ├── ProtectedRoute/
│   └── ShoppingList/
│       ├── AddItemForm/
│       ├── DeleteConfirmationModal/
│       ├── ItemCard/
│       └── SearchBar/
├── pages/            # Page components
│   ├── Home/
│   ├── Login/
│   ├── Profile/
│   ├── Register/
│   └── ShoppingLists/
├── redux/            # Redux state management
│   ├── authSlice.ts
│   ├── formSlice.ts
│   ├── shoppingListSlice.ts
│   ├── userSlice.ts
│   ├── hooks.ts
│   └── store.ts
└── utils/            # Utility functions
    ├── encryption.ts
    ├── types.ts
    └── validation.ts
```

## 🔐 Security Features

- Password encryption using AES
- Protected routes with authentication checks
- Secure session management with Redux persist
- Input validation and sanitization

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Start JSON Server
npm run server

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Design Features

- **Glassmorphism UI**: Modern frosted glass effect cards
- **Smooth Animations**: Transitions and hover effects
- **Color Scheme**: Green accent (#2ecc71) with neutral base
- **Typography**: Poppins font family for clean readability
- **Mobile-First**: Responsive design from the ground up

## 📄 API Endpoints

The JSON Server provides the following endpoints:

- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `GET /shoppingLists` - Get all shopping lists
- `POST /shoppingLists` - Create shopping list
- `DELETE /shoppingLists/:id` - Delete shopping list
- `GET /items` - Get all items
- `POST /items` - Create item
- `PATCH /items/:id` - Update item
- `DELETE /items/:id` - Delete item

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built by Tlholo using React + TypeScript + Vite
