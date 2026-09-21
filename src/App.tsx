import { useEffect, useState } from 'react'
import { animations } from './animations/registry'
import IndexPage from './components/IndexPage'
import AnimationPage from './components/AnimationPage'
import DocsPage from './components/DocsPage'

function getHash(): string {
  return window.location.hash.replace(/^#\/?/, '')
}

export default function App() {
  const [route, setRoute] = useState(getHash())

  useEffect(() => {
    const onHash = () => {
      setRoute(getHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const entry = animations.find((a) => a.id === route)

  if (entry) {
    return <AnimationPage entry={entry} />
  }
  if (route === 'docs') {
    return <DocsPage />
  }
  return <IndexPage />
}