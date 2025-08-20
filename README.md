# Finance Calculator

A modern, responsive web application built with Next.js 15 and React 19 that provides a comprehensive suite of financial calculators to help users make informed financial decisions.

## ✨ Features

### 🧮 Financial Calculators
- **Savings Growth Calculator** - Plan and track your savings growth over time
- **Paycheck Calculator** - Calculate take-home pay after taxes and deductions
- **Credit Card Payoff Calculator** - Plan your credit card debt payoff strategy
- **Save for Goal Calculator** - Set and achieve your financial goals
- **Save a Million Calculator** - Plan your path to millionaire status
- **Car Calculator** - Calculate car loan payments and total costs

### 🌐 Internationalization
- **Multi-language Support** - English, Spanish, and Portuguese
- **Automatic Locale Detection** - Smart language switching
- **Localized Content** - All calculators and UI elements translated

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme Support** - Automatic theme switching based on system preferences
- **Custom Scrollbars** - Slim, iconic scrollbars for better visual appeal
- **Smooth Animations** - Elegant transitions and hover effects
- **Accessibility** - Built with accessibility best practices

### 🛠️ Technical Features
- **Next.js 15** - Latest React framework with App Router
- **React 19** - Latest React with enhanced performance
- **TypeScript** - Full type safety and better development experience
- **Tailwind CSS 4** - Latest utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **next-intl** - Internationalization framework

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finance-calculator.git
   cd finance-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🎨 Custom Scrollbar Styling

The application features custom-designed scrollbars that are slim and iconic:

### Available Scrollbar Classes

- **`.custom-scrollbar`** - General purpose scrollbar (6px width)
- **`.dialog-scrollbar`** - Dialog-specific scrollbar (4px width) with primary color
- **`.iconic-scrollbar`** - Iconic scrollbar (8px width) with subtle borders

### Features
- **Slim Design** - Minimal width (4-8px) for modern aesthetics
- **Smooth Transitions** - Hover and active state animations
- **Theme Integration** - Uses CSS variables for consistent theming
- **Cross-browser Support** - Works on Webkit browsers and Firefox
- **Responsive** - Adapts to light/dark themes automatically

### Usage Example
```tsx
<div className="overflow-y-auto custom-scrollbar">
  {/* Scrollable content */}
</div>
```

## 🏗️ Project Structure

```
src/
├── app/[locale]/        # Next.js App Router with internationalization
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── ...              # Calculator components
├── messages/             # Internationalization files (en, es, pt)
├── interfaces/           # TypeScript interfaces
└── lib/                 # Utility functions
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Language Support

The application supports three languages:
- **English (en)** - Default language
- **Spanish (es)** - Español
- **Portuguese (pt)** - Português

## 📱 Responsive Design

Fully responsive and optimized for desktop, tablet, and mobile devices with touch-friendly interactions.

## 🔧 Development

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Functional Components** - Modern React with hooks
- **Internationalization** - Built with next-intl

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ using Next.js 15, React 19, and TypeScript**
