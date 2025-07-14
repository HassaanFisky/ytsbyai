'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Mail, Heart, Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full py-12 mt-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                YTS by AI
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              Transform any YouTube video or voice input into engaging, AI-powered summaries using GPT-4 and Whisper.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://twitter.com/ytsbyai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="text-sm">Twitter</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/app" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Summarize
                </Link>
              </li>
              <li>
                <Link 
                  href="/how-it-works" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:hello@ytsbyai.com" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>© {currentYear} YTS by AI. All rights reserved.</span>
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/privacy" 
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookies" 
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>and</span>
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>AI</span>
            </div>
          </div>
          
          {/* Mobile Legal Links */}
          <div className="md:hidden mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link 
              href="/privacy" 
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/cookies" 
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
} 