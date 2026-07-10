"use client"

import { motion } from "framer-motion"

const skills = [
  "Digital Illustration",
  "Concept Art",
  "Character Design",
  "Environment Art",
  "UI/UX Design",
  "Motion Graphics",
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            About Me
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
            I am a multidisciplinary digital artist with over 8 years of experience
            creating captivating visual narratives. My work spans illustration, concept
            art, and motion design, blending vibrant colors with atmospheric storytelling.
            I collaborate with studios, indie game developers, and brands to bring
            imaginative worlds to life.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {skills.map((skill) => (
            <motion.div
              key={skill}
              variants={itemVariants}
              className="glass rounded-2xl px-6 py-4 text-center"
            >
              <span className="text-text-primary font-medium">{skill}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
