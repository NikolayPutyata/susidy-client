export const Logo = ({ className = 'text-center items-center' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
   
    <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text font-extrabold tracking-tight text-transparent">
      <img src="logo.png" alt="" width={150}/>
    </span>
  </span>
)
