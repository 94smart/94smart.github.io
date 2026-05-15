const storageKey = 'theme'

const getTheme = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey)
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const setTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  localStorage.setItem(storageKey, theme)
}

setTheme(getTheme())

window.toggleTheme = () => {
  const current = document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'

  setTheme(current === 'dark' ? 'light' : 'dark')
}