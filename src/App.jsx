import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaArrowUp,
  FaAward,
  FaBookOpen,
  FaChartBar,
  FaCloud,
  FaCode,
  FaCodeBranch,
  FaDatabase,
  FaDownload,
  FaFileDownload,
  FaGithub,
  FaLaptopCode,
  FaLinkedin,
  FaPaperPlane,
  FaProjectDiagram,
  FaRocket,
  FaServer,
  FaTerminal,
  FaTrophy,
} from 'react-icons/fa'
import { useEffect, useState } from 'react'
import emailjs from 'emailjs-com'
import { portfolioData } from './data/portfolioData'
import SectionTitle from './components/SectionTitle'
import AnimatedText from './components/AnimatedText'
import SkillBar from './components/SkillBar'

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'surajpandey4543@gmail.com'
const isEmailConfigured = Boolean(serviceId && templateId && publicKey && !['service_id', 'template_id', 'user_id'].includes(serviceId))

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 900
    const stepTime = Math.max(16, Math.floor(duration / value))
    const timer = window.setInterval(() => {
      start += 1
      setDisplay(start)
      if (start >= value) {
        window.clearInterval(timer)
      }
    }, stepTime)

    return () => window.clearInterval(timer)
  }, [value])

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}

const RadarChart = ({ values }) => {
  const center = 110
  const radius = 82

  const points = values.map((item, index) => {
    const angle = (Math.PI / 2) + (index / values.length) * Math.PI * 2
    const x = center + Math.cos(angle) * radius * (item.value / 100)
    const y = center + Math.sin(angle) * radius * (item.value / 100)
    return { x, y }
  })

  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <svg viewBox="0 0 220 220" className="h-64 w-full">
      {[20, 40, 60, 80, 100].map((ring) => (
        <circle key={ring} cx="110" cy="110" r={(ring / 100) * 82} className="fill-none stroke-[#2A3555] stroke-[1]" />
      ))}
      <polygon points={polygonPoints} fill="rgba(89, 150, 146, 0.24)" stroke="#599692" strokeWidth="2" />
      {values.map((item, index) => {
        const angle = (Math.PI / 2) + (index / values.length) * Math.PI * 2
        const x = center + Math.cos(angle) * 92
        const y = center + Math.sin(angle) * 92

        return (
          <g key={item.label}>
            <line x1="110" y1="110" x2={x} y2={y} className="stroke-[#2A3555]" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-[#9AA7B8] text-[10px]">
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const App = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalOutput, setTerminalOutput] = useState([
    'Developer Terminal v1.0',
    'Type "help" to see available commands.',
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am Suraj AI. Ask me about my skills, experience, projects, resume, or contact details.',
    },
  ])

  const filteredProjects =
    activeFilter === 'All'
      ? portfolioData.projects
      : portfolioData.projects.filter((project) => project.filters.includes(activeFilter))

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setStatus('Please fill in all fields before sending.')
      return
    }

    setStatus('Sending...')

    const templateParams = {
      from_name: formState.name.trim(),
      from_email: formState.email.trim(),
      message: formState.message.trim(),
      reply_to: formState.email.trim(),
      to_email: contactEmail,
      to_name: 'Suraj Kumar Pandey',
    }

    if (isEmailConfigured) {
      emailjs
        .send(serviceId, templateId, templateParams, publicKey)
        .then(() => {
          setStatus('Message sent successfully!')
          setFormState({ name: '', email: '', message: '' })
        })
        .catch(() => {
          setStatus('Unable to send message right now. Please try again later.')
        })
      return
    }

    const subject = encodeURIComponent(`Portfolio Contact from ${templateParams.from_name}`)
    const body = encodeURIComponent(
      `Name: ${templateParams.from_name}\nEmail: ${templateParams.from_email}\n\nMessage:\n${templateParams.message}`,
    )

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
    setStatus('Opening your email app with your message...')
    setFormState({ name: '', email: '', message: '' })
  }

  const handleTerminalSubmit = (event) => {
    event.preventDefault()

    if (!terminalInput.trim()) {
      return
    }

    const value = terminalInput.trim().toLowerCase()
    const outputs = {
      help: [
        'Available commands:',
        'help',
        'about',
        'skills',
        'experience',
        'projects',
        'certifications',
        'resume',
        'contact',
      ],
      about: [portfolioData.about.passion],
      skills: portfolioData.skills.backend.concat(portfolioData.skills.frontend, portfolioData.skills.database, portfolioData.skills.devops),
      experience: portfolioData.timeline.map((item) => `${item.year} • ${item.role} @ ${item.company}`),
      projects: portfolioData.projects.map((project) => project.title),
      certifications: portfolioData.certifications.map((item) => item.title),
      resume: ['Resume available at: https://drive.google.com/file/d/1GVs9d5qHVVFwADMjlVY7fYdoESWotBOo/view?usp=drive_link'],
      contact: [`Email: ${portfolioData.contact.email}`, `LinkedIn: ${portfolioData.contact.linkedin}`],
    }

    const response = outputs[value] || ['Command not found. Type help to explore available commands.']
    setTerminalOutput((prev) => [...prev, `> ${terminalInput}`, ...response])
    setTerminalInput('')
  }

  const handleAssistantSubmit = (event) => {
    event.preventDefault()

    if (!chatInput.trim()) {
      return
    }

    const question = chatInput.trim().toLowerCase()
    let answer = 'I can help with skills, experience, projects, resume, or contact information.'

    if (question.includes('skill')) {
      answer = `My core strengths include ${portfolioData.skills.backend.slice(0, 4).join(', ')} and modern cloud tooling.`
    } else if (question.includes('experience') || question.includes('journey')) {
      answer = `I have worked as a ${portfolioData.timeline[2].role} and completed internships in ${portfolioData.timeline[0].role} and ${portfolioData.timeline[1].role}.`
    } else if (question.includes('project')) {
      answer = `My featured projects include ${portfolioData.projects.map((item) => item.title).join(', ')}.`
    } else if (question.includes('resume')) {
      answer = 'You can download my resume from the button in the hero section or use the profile card below.'
    } else if (question.includes('contact')) {
      answer = `Reach me via ${portfolioData.contact.email} or connect on LinkedIn at ${portfolioData.contact.linkedin}.`
    }

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: chatInput },
      { sender: 'assistant', text: answer },
    ])
    setChatInput('')
  }

  return (
    <div className="min-h-screen bg-[#11172A] text-[#DFE5EC]">
      <header className="sticky top-0 z-50 border-b border-[#2A3555]/80 bg-[#0D1425]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-400/40 bg-teal-400/10 text-sm font-semibold text-teal-300">
              SK
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Suraj</p>
              <p className="text-xs text-slate-500">Developer Portfolio</p>
            </div>
          </a>
          <div className="hidden flex-1 items-center justify-end gap-2 pr-4 text-sm md:flex">
            {[
              { label: 'Home', href: '#home' },
              { label: 'About', href: '#about' },
              { label: 'Skills', href: '#skills' },
              { label: 'Experience', href: '#experience' },
              { label: 'Projects', href: '#projects' },
              { label: 'Contact', href: '#contact' },
            ].map((link) => (
              <a key={link.label} href={link.href} className="rounded-full px-3 py-2 transition hover:bg-[#1A2238] hover:text-teal-300">
                {link.label}
              </a>
            ))}
          </div>
          <a href="#contact" className="hidden rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-300 transition hover:bg-teal-400/20 md:inline-flex">
            Let&apos;s Talk
          </a>
        </nav>
      </header>

      <main id="home">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#2A3555] bg-gradient-to-br from-[#16203A] via-[#11172A] to-[#0D1425] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_40%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-7 lg:items-start lg:text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                  Open for opportunities
                </div>
                <div className="space-y-4 max-w-2xl">
                  <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">
                    Hi, I&apos;m <span className="text-teal-300">{portfolioData.name}</span>
                  </h1>
                  <p className="text-lg font-medium text-slate-200 sm:text-xl">{portfolioData.title}</p>
                  <p className="text-base leading-8 text-slate-400 sm:text-lg">{portfolioData.intro}</p>
                  <p className="text-base font-medium text-slate-300 sm:text-lg">
                    I specialize in <AnimatedText />
                  </p>
                </div>
                <div className="flex flex-wrap justify-start gap-3">
                  <a href="https://drive.google.com/file/d/1GVs9d5qHVVFwADMjlVY7fYdoESWotBOo/view?usp=drive_link" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-teal-400">
                    <FaDownload /> Download Resume
                  </a>
                  <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-[#2A3555] bg-[#1A2238]/80 px-5 py-3 font-medium transition hover:border-teal-400 hover:text-teal-300">
                    <FaPaperPlane /> Contact Me
                  </a>
                  <a href="#projects" className="inline-flex items-center gap-2 rounded-full border border-[#2A3555] bg-[#1A2238]/80 px-5 py-3 font-medium transition hover:border-teal-400 hover:text-teal-300">
                    <FaProjectDiagram /> View Projects
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-[1.5rem] border border-[#2A3555] bg-[#10182D]/90 p-6 shadow-2xl shadow-black/40"
              >
                <div className="rounded-[1.25rem] border border-teal-400/20 bg-[#11172A]/80 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-3 w-24 rounded-full bg-teal-500/60" />
                    <div className="h-3 w-12 rounded-full bg-slate-700" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded-full bg-slate-800" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-800" />
                    <div className="h-3 w-4/6 rounded-full bg-slate-800" />
                  </div>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {['Java', 'Spring Boot', 'React', 'AWS'].map((item) => (
                      <div key={item} className="rounded-xl border border-[#2A3555] bg-[#1A2238] p-3 text-center text-sm font-medium text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="stats" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Developer Statistics" />
          <div className="flex flex-wrap gap-3">
            {portfolioData.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="rounded-2xl border border-[#2A3555] bg-[#1A2238]/80 px-4 py-3 shadow-sm shadow-black/20"
              >
                <span className="text-base font-semibold text-teal-300">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>{' '}
                <span className="text-sm text-slate-400">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6"
            >
              <h3 className="text-2xl font-semibold text-slate-100">Tech Stack Orbit</h3>
              <p className="mt-3 leading-8 text-slate-400">
                A circular view of the technologies I use to build resilient backend systems, polished frontends, and deployment-ready applications.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {portfolioData.techStackOrbit.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#2A3555] bg-[#11172A] px-3 py-2 text-sm text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-8"
            >
              <div className="orbit-ring mx-auto flex h-72 w-72 items-center justify-center rounded-full border border-dashed border-teal-400/30 p-4">
                <div className="rounded-full border border-teal-400/30 bg-[#11172A] px-6 py-4 text-center text-sm font-semibold text-teal-300">
                  Core Stack
                </div>
                {portfolioData.techStackOrbit.map((skill, index) => {
                  const angle = (index / portfolioData.techStackOrbit.length) * 360
                  const radius = 110
                  const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius
                  const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius

                  return (
                    <div
                      key={skill}
                      className="orbit-node absolute rounded-full border border-[#2A3555] bg-[#1A2238] px-3 py-2 text-xs text-slate-200"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      {skill}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Professional Summary" subtitle="About Me" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-8 shadow-lg shadow-black/20"
            >
              <p className="text-lg leading-8 text-slate-300">
                {portfolioData.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {portfolioData.availability.map((item) => (
                  <span key={item} className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-2 text-sm text-teal-300">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-gradient-to-br from-[#1A2238] to-[#11172A] p-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-2 text-sm text-teal-300">
                <FaRocket /> Availability Badge
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <p className="text-lg font-semibold text-slate-100">Open for Opportunities</p>
                </div>
                <p className="text-slate-400">
                  Available for Java Developer roles, backend engineering, full stack development, internships, and remote opportunities.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Professional Timeline" subtitle="Career Journey" />
          <div className="space-y-6">
            {[...portfolioData.timeline].reverse().map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-teal-300">{item.year}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-100">{item.role}</h3>
                  <p className="mt-1 text-teal-300">{item.company}</p>
                </div>
                <p className="mt-4 max-w-2xl text-slate-400 md:mt-0">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Coding Profiles" subtitle="Connect & Explore" />
          <div className="grid gap-6 lg:grid-cols-4">
            {portfolioData.profiles.map((profile, index) => (
              <motion.a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl border border-[#2A3555] bg-[#11172A] p-3 text-teal-300">
                    {profile.name === 'GitHub' ? <FaGithub /> : profile.name === 'LinkedIn' ? <FaLinkedin /> : profile.name === 'LeetCode' ? <FaCode /> : <FaFileDownload />}
                  </div>
                  <FaArrowRight className="text-slate-400" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-100">{profile.name}</h3>
                <p className="mt-2 text-slate-400">{profile.description}</p>
                <div className="mt-4 text-sm text-teal-300">{profile.stats}</div>
              </motion.a>
            ))}
          </div>
        </section>

        <section id="skills" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Interactive Skill Visualization" subtitle="Performance Snapshot" />
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-100">Skill Radar</h3>
              <div className="mt-4">
                <RadarChart values={portfolioData.skillRadar} />
              </div>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolioData.skillCategories.map((group, index) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-5"
                >
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">{group.title}</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full border border-[#2A3555] bg-[#11172A] px-2.5 py-1 text-xs text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Featured Projects" subtitle="Selected Work" />
          <div className="mb-8 flex flex-wrap gap-3">
            {['All', 'Java', 'Spring Boot', 'Backend', 'Full Stack', 'Database', 'Cloud'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm transition ${activeFilter === filter ? 'bg-teal-500 text-slate-950' : 'border border-[#2A3555] bg-[#1A2238] text-slate-300 hover:border-teal-400 hover:text-teal-300'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="overflow-hidden rounded-3xl border border-[#2A3555] bg-[#1A2238]/80"
              >
                <div className="h-40 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 p-3">
                  <img src={project.image} alt={project.title} className="h-full w-full rounded-2xl border border-teal-400/20 object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-100">{project.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{project.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-teal-300">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="rounded-full border border-[#2A3555] px-2 py-1 text-xs text-slate-300">{tech}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={project.github} target="_blank" rel="noreferrer" className="text-sm font-medium text-teal-300 hover:text-teal-200">GitHub</a>
                    <a href={project.demo} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-200 hover:text-teal-300">Live Demo</a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Certifications & Achievements" subtitle="Recognition" />
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {portfolioData.certifications.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-5 backdrop-blur"
                >
                  <div className="flex items-center gap-3 text-teal-300">
                    <FaAward />
                    <span className="text-sm uppercase tracking-[0.2em]">Certification</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.issuer}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.year}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-gradient-to-br from-[#1A2238] to-[#11172A] p-8"
            >
              <div className="flex items-center gap-3 text-teal-300">
                <FaTrophy />
                <h3 className="text-xl font-semibold text-slate-100">Achievement Wall</h3>
              </div>
              <div className="mt-6 rounded-3xl border border-teal-400/20 bg-[#11172A]/70 p-6 text-center">
                <p className="text-4xl">🏆</p>
                <p className="mt-4 text-xl font-semibold text-slate-100">1st Rank in Codomania Coding Competition</p>
                <p className="mt-3 text-slate-400">Recognized for problem-solving, consistency, and competitive programming discipline.</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6"
            >
              <div className="flex items-center gap-3 text-teal-300">
                <FaLaptopCode />
                <h3 className="text-xl font-semibold text-slate-100">Developer Terminal</h3>
              </div>
              <form onSubmit={handleTerminalSubmit} className="mt-6 rounded-2xl border border-[#2A3555] bg-[#11172A] p-4">
                <div className="space-y-2 whitespace-pre-wrap text-sm text-slate-300">
                  {terminalOutput.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#2A3555] bg-[#1A2238] px-3 py-3">
                  <span className="text-teal-300">$</span>
                  <input value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Type a command" />
                </div>
              </form>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-8"
            >
              <div className="flex items-center gap-3 text-teal-300">
                <FaCodeBranch />
                <h3 className="text-xl font-semibold text-slate-100">Suraj AI Assistant</h3>
              </div>
              <div className="mt-6 space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`rounded-2xl border px-4 py-3 text-sm ${message.sender === 'assistant' ? 'border-[#2A3555] bg-[#11172A] text-slate-300' : 'border-teal-400/20 bg-teal-400/10 text-slate-100'}`}>
                    {message.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAssistantSubmit} className="mt-6 flex gap-3">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 rounded-2xl border border-[#2A3555] bg-[#11172A] px-4 py-3 text-sm outline-none" placeholder="Ask about skills, projects, resume..." />
                <button type="submit" className="rounded-2xl bg-teal-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-teal-400">
                  Ask
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6"
            >
              <div className="flex items-center gap-3 text-teal-300">
                <FaChartBar />
                <h3 className="text-xl font-semibold text-slate-100">GitHub Analytics Dashboard</h3>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {portfolioData.githubStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#2A3555] bg-[#11172A] p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                  <span>Contribution Graph</span>
                  <span>Last 7 days</span>
                </div>
                <div className="flex h-28 items-end gap-2">
                  {[62, 74, 48, 86, 71, 92, 78].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-8"
            >
              <div className="flex items-center gap-3 text-teal-300">
                <FaBookOpen />
                <h3 className="text-xl font-semibold text-slate-100">Current Learning Roadmap</h3>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {portfolioData.learning.map((item) => (
                  <span key={item} className="rounded-full border border-[#2A3555] bg-[#11172A] px-3 py-2 text-sm text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 rounded-3xl border border-[#2A3555] bg-[#11172A]/70 p-6">
                <h4 className="text-lg font-semibold text-slate-100">Future-ready Blog Module</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {portfolioData.blogPosts.map((post) => (
                    <div key={post.title} className="rounded-2xl border border-[#2A3555] bg-[#1A2238] p-4">
                      <p className="text-sm font-medium text-slate-100">{post.title}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-teal-300">{post.tag}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionTitle title="Get in Touch" subtitle="Contact" />
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6">
              <div className="space-y-4 text-slate-300">
                <p><span className="text-teal-300">Email:</span> {portfolioData.contact.email}</p>
                <p><span className="text-teal-300">Phone:</span> {portfolioData.contact.phone}</p>
                <p><span className="text-teal-300">LinkedIn:</span> <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-teal-300">{portfolioData.contact.linkedin}</a></p>
                <p><span className="text-teal-300">GitHub:</span> <a href={portfolioData.contact.github} target="_blank" rel="noreferrer" className="hover:text-teal-300">{portfolioData.contact.github}</a></p>
                <p><span className="text-teal-300">LeetCode:</span> <a href={portfolioData.contact.leetcode} target="_blank" rel="noreferrer" className="hover:text-teal-300">{portfolioData.contact.leetcode}</a></p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="rounded-3xl border border-[#2A3555] bg-[#1A2238]/80 p-6">
              <div className="grid gap-4">
                <input required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="rounded-2xl border border-[#2A3555] bg-[#11172A] px-4 py-3 outline-none ring-0" placeholder="Your Name" />
                <input required type="email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} className="rounded-2xl border border-[#2A3555] bg-[#11172A] px-4 py-3 outline-none ring-0" placeholder="Your Email" />
                <textarea required rows="5" value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} className="rounded-2xl border border-[#2A3555] bg-[#11172A] px-4 py-3 outline-none ring-0" placeholder="Your Message" />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-teal-400">
                  <FaPaperPlane /> Send Message
                </button>
                {status ? <p className="text-sm text-teal-300">{status}</p> : null}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2A3555] bg-[#11172A]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            {portfolioData.socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-teal-300">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-2 text-sm text-teal-300">Built with React + Tailwind CSS</span> */}
            <p className="text-sm text-slate-500">© 2025 Suraj Kumar Pandey. All rights reserved.</p>
          </div>
          <a href="#home" className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200">
            <FaArrowUp /> Back to Top
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
