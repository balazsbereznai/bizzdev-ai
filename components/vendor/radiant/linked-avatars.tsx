// components/vendor/radiant/linked-avatars.tsx
'use client'

import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import * as React from 'react'

// Simple inline check icon to avoid external @heroicons dependency
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.586l6.543-6.543a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const transition = {
  duration: 0.75,
  repeat: Infinity,
  repeatDelay: 1.25,
}

function Rings() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      className={clsx(
        'col-start-1 row-start-1 size-full',
        'mask-[linear-gradient(to_bottom,black_90%,transparent),radial-gradient(circle,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_100%)] mask-intersect',
      )}
    >
      {Array.from({ length: 42 }).map((_, n) => (
        <motion.circle
          key={n}
          cx="250"
          cy="250"
          r={n * 14 + 4}
          className="stroke-white"
          variants={{
            idle: {
              scale: 1,
              strokeOpacity: 0.15,
            },
            active: {
              scale: [1, 1.08, 1],
              strokeOpacity: [0.15, 0.3, 0.15],
              transition: { ...transition, delay: n * 0.05 },
            },
          }}
        />
      ))}
    </svg>
  )
}

function Checkmark() {
  return (
    <div className="z-10 col-start-1 row-start-1 flex items-center justify-center">
      <motion.div
        variants={{
          idle: { scale: 1 },
          active: {
            scale: [1, 1.15, 1],
            transition: { ...transition, duration: 0.75 },
          },
        }}
        className="flex size-6 items-center justify-center rounded-full bg-linear-to-t from-green-500 to-green-300 shadow-sm"
      >
        <CheckIcon className="size-4 text-white" />
      </motion.div>
    </div>
  )
}

function Photos() {
  return (
    <div className="z-10 col-start-1 row-start-1">
      <div className="mx-auto flex size-full max-w-md items-center justify-around">
        <img
          alt=""
          src="/linked-avatars/customer.jpg"
          className="size-20 rounded-full bg-white/15 ring-4 ring-white/10"
        />
        <img
          alt=""
          src="/linked-avatars/manager.jpg"
          className="size-20 rounded-full bg-white/15 ring-4 ring-white/10"
        />
      </div>
    </div>
  )
}

export function LinkedAvatars() {
  return (
    <div aria-hidden="true" className="isolate mx-auto grid h-full grid-cols-1">
      <Rings />
      <Photos />
      <Checkmark />
    </div>
  )
}

