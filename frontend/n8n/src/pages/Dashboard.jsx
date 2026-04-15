import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getWorkflows, createWorkflow, deleteWorkflow, updateWorkflow } from '../api/workflows.js'
import { triggerManual } from '../api/executions.js'
import { generateWorkflow } from '../api/ai.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Sidebar from '../components/layout/Sidebar.jsx'

const nodeColors = {
  webhook: { bg:'var(--green-50)', color:'var(--green-800)', border:'var(--border)' },
  delay:   { bg:'var(--amber-50)', color:'var(--amber-800)', border:'#EF9F27' },
  email:   { bg:'var(--teal-50)',  color:'var(--teal-800)',  border:'var(--teal-200)' },
  httpRequest: { bg:'var(--blue-50)', color:'var(--blue-800)', border:'var(--blue-200)' },
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const { user, logoutUser } = useAuth()
  const nav = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await getWorkflows()
      const wfs = res.data.data.workflows
      setWorkflows(wfs)
      setStats({ total: wfs.length, active: wfs.filter(w => w.isActive).length })
    } catch { toast.error('Failed to load workflows') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await createWorkflow({ name: newName.trim() })
      toast.success('Workflow created')
      setShowNew(false); setNewName('')
      nav(`/builder/${res.data.data.workflow._id}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCreating(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteWorkflow(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const handleToggle = async (wf) => {
    try {
      await updateWorkflow(wf._id, { isActive: !wf.isActive })
      toast.success(wf.isActive ? 'Deactivated' : 'Activated')
      load()
    } catch { toast.error('Failed') }
  }

  const handleRun = async (id) => {
    try {
      await triggerManual(id, {})
      toast.success('Workflow triggered!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to trigger') }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || aiPrompt.trim().length < 10) { toast.error('Describe your workflow (at least 10 characters)'); return }
    setAiLoading(true)
    try {
      const res = await generateWorkflow(aiPrompt, true)
      toast.success('AI generated your workflow!')
      setShowAi(false); setAiPrompt('')
      nav(`/builder/${res.data.data.workflow._id}`)
    } catch (err) { toast.error(err.response?.data?.message || 'AI generation failed') }
    finally { setAiLoading(false) }
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--gray-50)' }}>
      <Sidebar active="workflows" onLogout={logoutUser} user={user} />
      <main style={{ flex:1, overflow:'auto', padding:'28px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:'500', color:'var(--gray-800)' }}>My workflows</h1>
            <p style={{ fontSize:'13px', color:'var(--gray-600)', marginTop:'2px' }}>Build and manage your automations</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setShowAi(true)}
              style={{ padding:'8px 16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)', background:'var(--green-50)', color:'var(--green-600)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:'6px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5z" fill="var(--green-400)"/></svg>
              AI builder
            </button>
            <button onClick={() => setShowNew(true)}
              style={{ padding:'8px 16px', borderRadius:'var(--radius-md)', border:'none', background:'var(--green-400)', color:'var(--green-50)', fontSize:'13px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font)' }}>
              + New workflow
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total workflows', value: stats.total },
            { label:'Active', value: stats.active },
            { label:'Inactive', value: stats.total - stats.active },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--green-50)', borderRadius:'var(--radius-lg)', padding:'16px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'11px', color:'var(--green-600)', marginBottom:'4px' }}>{s.label}</div>
              <div style={{ fontSize:'28px', fontWeight:'500', color:'var(--green-800)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Workflow list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'var(--gray-400)', fontSize:'13px' }}>Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px', background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div>
            <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--gray-800)', marginBottom:'6px' }}>No workflows yet</div>
            <div style={{ fontSize:'13px', color:'var(--gray-600)', marginBottom:'20px' }}>Create your first automation in seconds</div>
            <button onClick={() => setShowNew(true)}
              style={{ padding:'8px 20px', borderRadius:'var(--radius-md)', border:'none', background:'var(--green-400)', color:'var(--green-50)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)' }}>
              Create workflow
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {workflows.map(wf => (
              <div key={wf._id} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
                    <span style={{ fontSize:'14px', fontWeight:'500', color:'var(--gray-800)' }}>{wf.name}</span>
                    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'99px', fontWeight:'500',
                      background: wf.isActive ? 'var(--green-50)' : 'var(--gray-100)',
                      color: wf.isActive ? 'var(--green-800)' : 'var(--gray-600)',
                      border: wf.isActive ? '1px solid var(--border)' : '1px solid var(--gray-200)' }}>
                      {wf.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    {wf.executionCount > 0 && <span style={{ fontSize:'10px', color:'var(--gray-400)' }}>{wf.executionCount} runs ·</span>}
                    <span style={{ fontSize:'10px', color:'var(--gray-400)' }}>
                      Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
                  <button onClick={() => handleRun(wf._id)}
                    style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)', background:'var(--green-50)', color:'var(--green-600)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)' }}>
                    Run
                  </button>
                  <Link to={`/logs/${wf._id}`}
                    style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)', textDecoration:'none' }}>
                    Logs
                  </Link>
                  <Link to={`/builder/${wf._id}`}
                    style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)', textDecoration:'none' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleToggle(wf)}
                    style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)' }}>
                    {wf.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(wf._id, wf.name)}
                    style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid #F09595', background:'var(--red-50)', color:'#791F1F', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New workflow modal */}
        {showNew && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
            <div style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', padding:'28px', width:'400px', maxWidth:'90vw' }}>
              <h3 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px', color:'var(--gray-800)' }}>New workflow</h3>
              <label style={{ fontSize:'12px', color:'var(--gray-600)', display:'block', marginBottom:'6px' }}>Workflow name</label>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Welcome email flow"
                style={{ width:'100%', padding:'9px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', fontSize:'13px', fontFamily:'var(--font)', outline:'none', marginBottom:'16px', color:'var(--gray-800)' }} />
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button onClick={() => { setShowNew(false); setNewName('') }}
                  style={{ padding:'7px 16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)' }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={creating}
                  style={{ padding:'7px 16px', borderRadius:'var(--radius-md)', border:'none', background:'var(--green-400)', color:'var(--green-50)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)', fontWeight:'500' }}>
                  {creating ? 'Creating...' : 'Create & open builder'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI builder modal */}
        {showAi && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
            <div style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', padding:'28px', width:'500px', maxWidth:'90vw' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5z" fill="var(--green-400)"/></svg>
                <h3 style={{ fontSize:'16px', fontWeight:'500', color:'var(--gray-800)' }}>AI workflow builder</h3>
              </div>
              <p style={{ fontSize:'12px', color:'var(--gray-600)', marginBottom:'16px' }}>Describe your automation in plain English</p>
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. When someone fills my form, wait 5 minutes then send a welcome email to their address"
                rows={4}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', fontSize:'13px', fontFamily:'var(--font)', outline:'none', marginBottom:'16px', color:'var(--gray-800)', resize:'vertical' }} />
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button onClick={() => { setShowAi(false); setAiPrompt('') }}
                  style={{ padding:'7px 16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)' }}>
                  Cancel
                </button>
                <button onClick={handleAiGenerate} disabled={aiLoading}
                  style={{ padding:'7px 16px', borderRadius:'var(--radius-md)', border:'none', background:'var(--green-400)', color:'var(--green-50)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)', fontWeight:'500' }}>
                  {aiLoading ? 'Generating...' : 'Generate workflow'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}