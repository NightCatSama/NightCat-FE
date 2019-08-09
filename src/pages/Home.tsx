import React, { useState } from 'react'

export function Home() {
  const [name, setName] = useState('nightcat')
  return (
    <>
      <h1>Hello {name}</h1>
      <button onClick={() => setName('夜喵')}>change</button>
    </>
  )
}