"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-text-primary tracking-tight">
          Aurora<span className="text-accent-light">.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-accent-light transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden glass-strong"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-accent-light transition-colors duration-300 text-lg"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
