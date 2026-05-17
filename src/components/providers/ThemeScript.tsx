const script = `
(function() {
  try {
    var theme = localStorage.getItem('atas-theme') || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})()
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
