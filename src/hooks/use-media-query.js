import { useEffect, useState } from 'react'

const getMediaQueryMatch = (query) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMediaQueryMatch(query))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const matcher = window.matchMedia(query)
    const handleChange = (event) => {
      setMatches(event.matches)
    }

    setMatches(matcher.matches)
    matcher.addEventListener('change', handleChange)

    return () => {
      matcher.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

export default useMediaQuery
