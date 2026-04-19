import { Link } from 'react-router-dom'

const s = {
  page: { minHeight:'100vh', background:'var(--white)', display:'flex', flexDirection:'column' },
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', borderBottom:'1px solid var(--border)', background:'var(--green-50)' },
  logo: { display:'flex', alignItems:'center', gap:'8px', textDecoration:'none' },
  logoMark: { width:'28px', height:'28px', borderRadius:'8px', background:'var(--green-400)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoText: { fontSize:'16px', fontWeight:'500', color:'var(--green-800)' },
  navLinks: { display:'flex', gap:'10px', alignItems:'center' },
  btnOut: { padding:'6px 16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)', background:'transparent', color:'var(--green-600)', fontSize:'13px', cursor:'pointer', textDecoration:'none', fontFamily:'var(--font)' },
  btnPrimary: { padding:'6px 16px', borderRadius:'var(--radius-md)', border:'none', background:'var(--green-400)', color:'var(--green-50)', fontSize:'13px', cursor:'pointer', textDecoration:'none', fontFamily:'var(--font)', fontWeight:'500' },
  hero: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px 40px', textAlign:'center' },
  pill: { display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'11px', padding:'4px 12px', borderRadius:'99px', background:'var(--green-50)', color:'var(--green-600)', border:'1px solid var(--border)', marginBottom:'20px' },
  pillDot: { width:'6px', height:'6px', borderRadius:'50%', background:'var(--green-400)' },
  h1: { fontSize:'42px', fontWeight:'500', lineHeight:'1.25', color:'var(--gray-800)', marginBottom:'16px', maxWidth:'560px' },
  h1Accent: { color:'var(--green-600)' },
  sub: { fontSize:'15px', color:'var(--gray-600)', lineHeight:'1.7', marginBottom:'32px', maxWidth:'440px' },
  ctaRow: { display:'flex', gap:'12px', marginBottom:'50px' },
  btnLg: { padding:'10px 24px', fontSize:'14px', borderRadius:'var(--radius-md)', fontFamily:'var(--font)', fontWeight:'500', cursor:'pointer', textDecoration:'none' },
  flowStrip: { display:'flex', alignItems:'center', gap:'10px', padding:'16px 24px', background:'var(--green-50)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', flexWrap:'wrap', justifyContent:'center' },
  flowNode: { padding:'7px 14px', borderRadius:'var(--radius-md)', fontSize:'11px', fontWeight:'500' },
  nodeTrigger: { background:'var(--green-800)', color:'var(--green-100)', },
  nodeAction: { background:'var(--white)', color:'var(--green-800)', border:'1px solid var(--border)' },
  nodeLabel: { fontSize:'9px', opacity:0.7, display:'block', marginBottom:'1px' },
  arrow: { color:'var(--green-400)', fontSize:'14px' },
  features: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', padding:'40px 48px', background:'var(--gray-100)', borderTop:'1px solid var(--border)' },
  feat: { padding:'20px', background:'var(--white)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' },
  featIcon: { width:'32px', height:'32px', borderRadius:'var(--radius-md)', background:'var(--green-50)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px', border:'1px solid var(--border)' },
  featTitle: { fontSize:'13px', fontWeight:'500', color:'var(--gray-800)', marginBottom:'4px' },
  featDesc: { fontSize:'12px', color:'var(--gray-600)', lineHeight:'1.6' },
}

export default function Landing() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.logo}>
          <div style={s.logoMark}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4" stroke="#EAF3DE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.logoText}>Flowise</span>
        </Link>
        <div style={s.navLinks}>
          <Link to="/login" style={s.btnOut}>Login</Link>
          <Link to="/register" style={{ ...s.btnPrimary, ...s.btnLg, padding:'6px 16px', fontSize:'13px' }}>Get started free</Link>
        </div>
      </nav>

      <div style={s.hero}>
        <div style={s.pill}><div style={s.pillDot}></div>No-code workflow automation</div>
        <h1 style={s.h1}>Automate anything.<br /><span style={s.h1Accent}>Without writing code.</span></h1>
        <p style={s.sub}>Build powerful automation flows visually. Connect triggers to actions. Let your system do the work — even while you sleep.</p>
        <div style={s.ctaRow}>
          <Link to="/register" style={{ ...s.btnLg, background:'var(--green-400)', color:'var(--green-50)', border:'none' }}>Start building free</Link>
          <Link to="/login" style={{ ...s.btnLg, background:'transparent', color:'var(--green-600)', border:'1px solid var(--border-dark)' }}>Login to dashboard</Link>
        </div>
        <div style={s.flowStrip}>
          <div style={{ ...s.flowNode, ...s.nodeTrigger }}><span style={s.nodeLabel}>trigger</span>Webhook</div>
          <span style={s.arrow}>→</span>
          <div style={{ ...s.flowNode, ...s.nodeAction }}><span style={s.nodeLabel}>action</span>Delay 10s</div>
          <span style={s.arrow}>→</span>
          <div style={{ ...s.flowNode, ...s.nodeAction }}><span style={s.nodeLabel}>action</span>Send email</div>
          <span style={s.arrow}>→</span>
          <div style={{ ...s.flowNode, ...s.nodeAction }}><span style={s.nodeLabel}>action</span>HTTP call</div>
        </div>
      </div>

      <div style={s.features}>
        {[
          { title:'Visual builder', desc:'Drag and drop nodes onto a canvas. Connect them with edges. No code needed.' },
          { title:'Async execution', desc:'Your workflows run in the background using a job queue. No blocking, no waiting.' },
          { title:'AI workflow generator', desc:'Describe your automation in plain English and AI builds the workflow for you.' },
        ].map((f, i) => (
          <div key={i} style={s.feat}>
            <div style={s.featIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="var(--green-400)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={s.featTitle}>{f.title}</div>
            <div style={s.featDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}