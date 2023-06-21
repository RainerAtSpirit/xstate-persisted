'use client'

export function Button({ text, send }: { text: string; send: any }) {
  return <button onClick={() => send(text)}>{text}</button>
}
