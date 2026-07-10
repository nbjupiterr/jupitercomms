"use client"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"

function XIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="glass rounded-2xl p-10 md:p-14 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Interested in collaborating or commissioning a piece? Reach out through any
            of the channels below.
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <a
              href="mailto:hello@aurorachen.art"
              aria-label="Email"
              className="text-text-secondary hover:text-accent-light transition-colors duration-300"
            >
              <Mail size={28} />
            </a>

            <a
              href="https://instagram.com/aurorachen.art"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-text-secondary hover:text-accent-light transition-colors duration-300"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://github.com/aurorachen"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-text-secondary hover:text-accent-light transition-colors duration-300"
            >
              <GithubIcon />
            </a>

            <a
              href="https://x.com/aurorachen"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-text-secondary hover:text-accent-light transition-colors duration-300"
            >
              <XIcon />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://aurorachen.art"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-accent transition-colors duration-300 underline underline-offset-4"
            >
              Portfolio Website
            </a>
            <span className="text-text-secondary">|</span>
            <a
              href="https://vgen.co/aurorachen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-accent transition-colors duration-300 underline underline-offset-4"
            >
              VGen Commissions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
