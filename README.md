# Finance Calculator

A modern, responsive web application built with Next.js and React that provides a comprehensive suite of financial calculators to help users make informed financial decisions.

## ✨ Features

### 🧮 Financial Calculators
- **Savings Growth Calculator** - Plan and track your savings growth over time
- **Paycheck Calculator** - Calculate take-home pay after taxes and deductions
- **Credit Card Payoff Calculator** - Plan your credit card debt payoff strategy
- **Save for Goal Calculator** - Set and achieve your financial goals
- **Save a Million Calculator** - Plan your path to millionaire status
- **Car Calculator** - Calculate car loan payments and total costs

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme Support** - Automatic theme switching based on system preferences
- **Custom Scrollbars** - Slim, iconic scrollbars for better visual appeal
- **Smooth Animations** - Elegant transitions and hover effects
- **Accessibility** - Built with accessibility best practices

### 🛠️ Technical Features
- **Next.js 14** - Latest React framework with App Router
- **TypeScript** - Full type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Accessible, unstyled UI components
- **Custom CSS Variables** - Consistent theming and design system

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
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
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
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and custom scrollbars
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   │   ├── dialog.tsx     # Dialog component with custom scrollbars
│   │   ├── button.tsx     # Button component
│   │   └── ...            # Other UI components
│   ├── Calculators.tsx    # Main calculators grid
│   ├── CreditCardPayoff.tsx
│   ├── PayCheck.tsx
│   ├── SavingsGrow.tsx
│   ├── SaveForGoal.tsx
│   ├── SaveMillion.tsx
│   └── CarCalculator.tsx
├── interfaces/             # TypeScript interfaces
└── lib/                   # Utility functions
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Customization

### Adding New Calculators
1. Create a new component in `src/components/`
2. Add the calculator to the `calculators` array in `Calculators.tsx`
3. Include appropriate icon and metadata

### Styling
- **Tailwind CSS** - Modify `tailwind.config.js` for design system changes
- **CSS Variables** - Update `src/app/globals.css` for theme modifications
- **Custom Scrollbars** - Modify scrollbar styles in `globals.css`

### Theming
The application supports both light and dark themes with automatic switching. Customize colors by modifying CSS variables in `globals.css`.

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full feature set with side-by-side layouts
- **Tablet** - Adaptive layouts with touch-friendly interactions
- **Mobile** - Mobile-first design with optimized touch targets

## 🔧 Development

### Code Style
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (if configured)

### Component Architecture
- **Functional Components** - Modern React with hooks
- **Props Interface** - TypeScript interfaces for component props
- **State Management** - React useState for local state
- **Event Handling** - Proper event handling with TypeScript

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

## 🚀 Roadmap

- [ ] Additional financial calculators
- [ ] Data persistence and user accounts
- [ ] Export functionality (PDF, CSV)
- [ ] Mobile app version
- [ ] Advanced charting and analytics
- [ ] Multi-currency support

---

**Built with ❤️ using Next.js, React, and TypeScript**
