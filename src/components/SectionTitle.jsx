import { motion } from 'framer-motion'

const SectionTitle = ({ title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-10 bg-teal-400/40" />
        <p className="text-sm uppercase tracking-[0.25em] text-teal-300">{subtitle || 'Section'}</p>
        <span className="h-px flex-1 max-w-24 bg-[#2A3555]" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-100 sm:text-4xl">{title}</h2>
    </motion.div>
  )
}

export default SectionTitle
