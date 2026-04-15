import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ active, onLogout, user }) {
  const nav = [
    { id:'workflows', label:'Workflows', to:'/dashboard',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg> },
  ]

  return (
    <aside style={{ width:'200px', background:'var(--white)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'var(--green-400)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#EAF3DE" strokeWidth="2.2" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize:'14px', fontWeight:'500', color:'var(--green-800)' }}>Flowise</span>
      </div>

      <nav style={{ flex:1, padding:'12px 8px' }}>
        {nav.map(item => (
          <Link key={item.id} to={item.to}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', borderRadius:'var(--radius-md)', textDecoration:'none', marginBottom:'2px',
              background: active === item.id ? 'var(--green-50)' : 'transparent',
              color: active === item.id ? 'var(--green-800)' : 'var(--gray-600)',
              borderRight: active === item.id ? '2px solid var(--green-400)' : '2px solid transparent',
              fontSize:'13px', fontWeight: active === item.id ? '500' : '400' }}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding:'12px', borderTop:'1px solid var(--border)' }}>
        {user && <div style={{ fontSize:'11px', color:'var(--gray-600)', marginBottom:'8px', padding:'0 2px' }}>{user.email}</div>}
        <button onClick={onLogout}
          style={{ width:'100%', padding:'7px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'12px', cursor:'pointer', fontFamily:'var(--font)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}