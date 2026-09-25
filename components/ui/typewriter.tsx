"use client"

import { useEffect, useState } from "react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"

interface TypewriterProps {
  text: string
  delay?: number
  className?: string
  showCursor?: boolean
}

export function Typewriter({
  text,
  delay = 0.028,
  className,
  showCursor = true,
}: TypewriterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [display, setDisplay] = useState("")

  useEffect(() => {
    count.set(0)
    setDisplay("")

    const unsubscribe = rounded.on("change", (v) => {
      setDisplay(text.slice(0, v))
    })

    const controls = animate(count, text.length, {
      type: "tween",
      duration: text.length * delay,
      ease: "linear",
    })

    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [text])

  return (
    <span className={className}>
      {display}
      {showCursor && (
        <motion.span
          className="inline-block ml-[2px] h-[0.82em] w-[2px] translate-y-[0.08em] rounded-sm bg-current align-middle opacity-80"
          animate={{ opacity: [0.8, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      )}
    </span>
  )
}
