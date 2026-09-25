"use client"

import { FC, useRef } from "react"
import { motion, useInView } from "motion/react"

interface TextAnimateProps {
  text: string
  className?: string
  delay?: number
  once?: boolean
}

export const TextAnimate: FC<TextAnimateProps> = ({
  text,
  className,
  delay = 0,
  once = true,
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once })

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.055, delayChildren: delay },
    },
  }

  const child = {
    hidden: {
      y: "110%",
      transition: { ease: [0.75, 0, 0.25, 1] as const, duration: 0.5 },
    },
    visible: {
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <motion.span
      ref={ref}
      aria-label={text}
      className={`inline-flex flex-wrap ${className ?? ""}`}
      style={{ gap: "0 0.22em" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden inline-block" aria-hidden="true">
          <motion.span className="inline-block" variants={child}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
