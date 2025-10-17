function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-800 dark:to-green-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              Swachhta Dashboard is committed to maintaining cleanliness through 
              innovative waste detection technology.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:underline">Terms of Service</a></li>
              <li><a href="#contact" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/icons/facebook.svg" alt="Facebook" className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <img src="/icons/twitter.svg" alt="Twitter" className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/icons/instagram.svg" alt="Instagram" className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-400 dark:border-green-700 mt-8 pt-8 text-center">
          <p className="text-sm dark:text-gray-300">© 2025 Swachhta Dashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
