import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react"

export default function Footer() {
  // Calculate current year on the server side
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-800 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Stickball</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering individuals to take control of their financial future through smart tools and insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Available Calculators */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Available Calculators</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 text-sm">Savings Growth Calculator</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Paycheck Calculator</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Credit Card Payoff</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Save for Goal</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Save a Million</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Car Calculator</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 text-sm">info@stickball.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 text-sm">123 Finance St, NY 10001</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>© {currentYear} Stickball. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for you</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
