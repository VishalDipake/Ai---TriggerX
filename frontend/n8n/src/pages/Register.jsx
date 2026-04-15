import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register(form)
      loginUser(res.data.data.user, res.data.data.token)
      toast.success('Account created!')
      nav('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--green-50)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', justifyContent:'center', marginBottom:'32px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--green-400)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#EAF3DE" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize:'18px', fontWeight:'500', color:'var(--green-800)' }}>Flowise</span>
        </Link>
        <div style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', padding:'32px' }}>
          <h2 style={{ fontSize:'20px', fontWeight:'500', color:'var(--gray-800)', marginBottom:'6px' }}>Create account</h2>
          <p style={{ fontSize:'13px', color:'var(--gray-600)', marginBottom:'24px' }}>Start automating for free</p>
          <form onSubmit={handle}>
            {[['Your name', 'name', 'text'], ['Email', 'email', 'email'], ['Password (min 6 chars)', 'password', 'password']].map(([label, name, type]) => (
              <div key={name} style={{ marginBottom:'16px' }}>
                <label style={{ fontSize:'12px', fontWeight:'500', color:'var(--gray-600)', display:'block', marginBottom:'5px' }}>{label}</label>
                <input
                  type={type} required
                  value={form[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', fontSize:'13px', fontFamily:'var(--font)', outline:'none', background:'var(--gray-50)', color:'var(--gray-800)' }}
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'10px', borderRadius:'var(--radius-md)', border:'none', background: loading ? 'var(--green-200)' : 'var(--green-400)', color:'var(--green-50)', fontSize:'14px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'var(--font)', marginTop:'8px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--gray-600)' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--green-600)', textDecoration:'none', fontWeight:'500' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}