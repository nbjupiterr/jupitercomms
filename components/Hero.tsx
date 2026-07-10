"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-light/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 glass rounded-2xl p-10 md:p-16 max-w-2xl text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-text-primary mb-4"
        >
          Aurora Chen
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed"
        >
          Digital artist &amp; illustrator crafting immersive visual worlds
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          href="#gallery"
          className="inline-block bg-accent hover:bg-accent-light text-text-primary font-semibold px-8 py-3 rounded-full transition-colors duration-300"
        >
          View Portfolio
        </motion.a>
      </motion.div>
    </section>
  )
}
