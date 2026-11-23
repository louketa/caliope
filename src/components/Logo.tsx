export function Logo({ slogan }: { slogan: string }) {
  return (
    <div className="logo">
      <img src="/logo-mark.svg" alt="" className="logo-mark" />
      <h1 className="logo-word">CALIOPE</h1>
      <p className="logo-slogan">{slogan}</p>
    </div>
  )
}
