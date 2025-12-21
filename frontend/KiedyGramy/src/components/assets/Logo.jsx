export const Logo = ({ className = "w-8 h-8" }) => (
  /*<svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
    <path d="M50 5 L20 40 L80 40 Z" />
    <path d="M20 40 L50 85 L80 40" />
  </svg>*/

  <svg viewBox="0 0 100 100" className="w-full h-full text-violet-600 drop-shadow-2xl">
    <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" fill="currentColor" opacity="0.1"/>
    
    <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">

        <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" strokeWidth="6"/>
        
        
        <path d="M50 5 L20 40 L80 40 Z" />
        
    
        <path d="M20 40 L50 85 L80 40" />
        
    
        <path d="M20 40 L7 72" />
        <path d="M80 40 L93 72" />
        <path d="M50 85 L50 95" /> 
    </g>
    
    
    <circle cx="85" cy="15" r="11" fill="#FBBF24" stroke="white"  strokeWidth="3" />
    
    <text x="85" y="20" textAnchor="middle" fill="#78350F" fontFamily="sans-serif" fontWeight="900" fontSize="14">?</text>
  </svg>
);