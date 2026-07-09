import { useEffect, useState } from 'react'

const words = ['Java', 'Spring Boot', 'Backend Systems', 'Microservices']

const AnimatedText = () => {
  const [index, setIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[index]
    const typingSpeed = deleting ? 60 : 100

    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplayText(currentWord.slice(0, displayText.length + 1))
        if (displayText.length === currentWord.length) {
          setDeleting(true)
        }
      } else {
        setDisplayText(currentWord.slice(0, displayText.length - 1))
        if (displayText.length === 0) {
          setDeleting(false)
          setIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayText, deleting, index])

  return <span className="text-teal-300">{displayText}|</span>
}

export default AnimatedText
