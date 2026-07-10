"use client"

import { motion } from "framer-motion"

const artworks = [
  { id: 1, title: "Ethereal Bloom", gradient: "from-purple-500 to-pink-500" },
  { id: 2, title: "Neon Horizon", gradient: "from-cyan-500 to-blue-500" },
  { id: 3, title: "Celestial Garden", gradient: "from-emerald-500 to-teal-500" },
  { id: 4, title: "Crystal Cavern", gradient: "from-violet-500 to-indigo-500" },
  { id: 5, title: "Solar Drift", gradient: "from-orange-500 to-amber-500" },
  { id: 6, title: "Midnight Flora", gradient: "from-fuchsia-500 to-rose-500" },
  { id: 7, title: "Arctic Whisper", gradient: "from-sky-400 to-indigo-400" },
  { id: 8, title: "Volcanic Ember", gradient: "from-red-500 to-orange-500" },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-4xl font-bold text-text-primary mb-12"
        >
          Featured Work
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
            >
              {/* Gradient placeholder image */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${artwork.gradient}`}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
                <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-text-primary font-semibold text-lg">
                    {artwork.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
