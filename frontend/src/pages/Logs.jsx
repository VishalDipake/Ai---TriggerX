import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExecutions, getExecution } from '../api/executions.js'
import { getWorkflow } from '../api/workflows.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Sidebar from '../components/layout/Sidebar.jsx'

const statusColors = {
  queued:  { bg:'var(--blue-50)',  color:'#042C53',  border:'var(--blue-200)' },
  running: { bg:'var(--amber-50)', color:'#412402',  border:'#EF9F27' },
  success: { bg:'var(--green-50)', color:'var(--green-800)', border:'var(--border)' },
  failed:  { bg:'var(--red-50)',   color:'#791F1F',  border:'#F09595' },
}

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.queued
  return (
    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'99px', fontWeight:'500',
      background: c.bg, color: c.color, border:`1px solid ${c.border}` }}>
      {status}
    </span>
  )
}

function StepRow({ step }) {
  const ok = step.status === 'success'
  const fail = step.status === 'failed'
  const running = step.status === 'running'
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'10px 0',
      borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:'22px', height:'22px', borderRadius:'50%', display:'flex',
        alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px',
        background: ok ? 'var(--green-50)' : fail ? 'var(--red-50)' : 'var(--amber-50)',
        border: ok ? '1px solid var(--border)' : fail ? '1px solid #F09595' : '1px solid #EF9F27' }}>
        {ok && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="var(--green-800)" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        {fail && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3 3l4 4M7 3l-4 4" stroke="#791F1F" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        {running && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#BA7517' }}/>}
        {step.status === 'pending' && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--gray-400)' }}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
          <span style={{ fontSize:'12px', fontWeight:'500', color:'var(--gray-800)' }}>
            {step.nodeType.charAt(0).toUpperCase() + step.nodeType.slice(1)} node
          </span>
          <StatusBadge status={step.status} />
          {step.durationMs != null && (
            <span style={{ fontSize:'10px', color:'var(--gray-400)', marginLeft:'auto' }}>
              {step.durationMs > 1000 ? `${(step.durationMs/1000).toFixed(1)}s` : `${step.durationMs}ms`}
            </span>
          )}
        </div>
        {step.output && (
          <div style={{ fontSize:'10px', color:'var(--gray-600)', fontFamily:'DM Mono, monospace',
            background:'var(--gray-100)', padding:'5px 8px', borderRadius:'5px', marginTop:'4px',
            wordBreak:'break-word', maxHeight:'60px', overflow:'hidden' }}>
            {JSON.stringify(step.output, null, 0).substring(0, 120)}
            {JSON.stringify(step.output).length > 120 && '...'}
          </div>
        )}
        {step.error && (
          <div style={{ fontSize:'10px', color:'#791F1F', fontFamily:'DM Mono, monospace',
            background:'var(--red-50)', padding:'5px 8px', borderRadius:'5px', marginTop:'4px',
            wordBreak:'break-word', border:'1px solid #F09595' }}>
            {step.error}
          </div>
        )}
        {/* Duration bar */}
        {step.durationMs != null && (
          <div style={{ height:'3px', borderRadius:'99px', background:'var(--gray-200)', marginTop:'6px', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:'99px',
              width: `${Math.min(100, (step.durationMs / 15000) * 100)}%`,
              background: ok ? 'var(--green-400)' : fail ? '#E24B4A' : '#EF9F27' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function ExecutionDetail({ executionId, onClose }) {
  const [exec, setExec] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExecution(executionId)
      .then(res => setExec(res.data.data.execution))
      .catch(() => toast.error('Failed to load execution'))
      .finally(() => setLoading(false))
  }, [executionId])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex',
      alignItems:'center', justifyContent:'flex-end', zIndex:200 }}>
      <div style={{ width:'480px', height:'100vh', background:'var(--white)',
        borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column',
        overflowY:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'var(--green-50)', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'13px', fontWeight:'500', color:'var(--green-800)' }}>Execution detail</div>
            {exec && <div style={{ fontSize:'10px', color:'var(--green-600)', marginTop:'1px', fontFamily:'DM Mono, monospace' }}>
              {exec._id}
            </div>}
          </div>
          <button onClick={onClose}
            style={{ padding:'5px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)',
              background:'transparent', color:'var(--gray-600)', fontSize:'12px', cursor:'pointer', fontFamily:'var(--font)' }}>
            Close
          </button>
        </div>

        {loading ? (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--gray-400)', fontSize:'12px' }}>Loading...</div>
        ) : exec ? (
          <div style={{ padding:'16px 20px' }}>
            {/* Meta */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
              {[
                ['Status', <StatusBadge status={exec.status} />],
                ['Triggered by', exec.triggeredBy],
                ['Duration', exec.durationMs ? `${(exec.durationMs/1000).toFixed(2)}s` : '—'],
                ['Started', exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString() : '—'],
              ].map(([label, val], i) => (
                <div key={i} style={{ background:'var(--gray-100)', padding:'8px 10px', borderRadius:'var(--radius-md)' }}>
                  <div style={{ fontSize:'10px', color:'var(--gray-400)', marginBottom:'2px' }}>{label}</div>
                  <div style={{ fontSize:'12px', color:'var(--gray-800)' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Trigger data */}
            {exec.triggerData && Object.keys(exec.triggerData).length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:'500', color:'var(--gray-600)', marginBottom:'6px' }}>Trigger payload</div>
                <pre style={{ fontSize:'10px', fontFamily:'DM Mono, monospace', background:'var(--gray-100)',
                  padding:'10px', borderRadius:'var(--radius-md)', color:'var(--gray-800)',
                  overflowX:'auto', whiteSpace:'pre-wrap', wordBreak:'break-word', lineHeight:'1.6' }}>
                  {JSON.stringify(exec.triggerData, null, 2)}
                </pre>
              </div>
            )}

            {/* Steps */}
            <div style={{ fontSize:'11px', fontWeight:'500', color:'var(--gray-600)', marginBottom:'6px' }}>
              Steps ({exec.steps?.length || 0})
            </div>
            {exec.steps?.map((step, i) => <StepRow key={i} step={step} />)}

            {exec.error && (
              <div style={{ marginTop:'12px', padding:'10px', background:'var(--red-50)', borderRadius:'var(--radius-md)',
                border:'1px solid #F09595', fontSize:'11px', color:'#791F1F' }}>
                <strong>Error:</strong> {exec.error}
              </div>
            )}
          </div>
        ) : <div style={{ padding:'32px', textAlign:'center', color:'var(--gray-400)', fontSize:'12px' }}>Not found</div>}
      </div>
    </div>
  )
}

export default function Logs() {
  const { workflowId } = useParams()
  const { user, logoutUser } = useAuth()
  const [workflow, setWorkflow] = useState(null)
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExecId, setSelectedExecId] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    getWorkflow(workflowId)
      .then(res => setWorkflow(res.data.data.workflow))
      .catch(() => toast.error('Workflow not found'))
  }, [workflowId])

  const load = (p = 1) => {
    setLoading(true)
    getExecutions(workflowId, { page: p, limit: 20 })
      .then(res => {
        setExecutions(res.data.data.executions)
        setPagination(res.data.data.pagination)
      })
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [workflowId, page])

  const successCount = executions.filter(e => e.status === 'success').length
  const failCount = executions.filter(e => e.status === 'failed').length

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--gray-50)' }}>
      <Sidebar active="workflows" onLogout={logoutUser} user={user} />

      <main style={{ flex:1, overflow:'auto', padding:'28px 32px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
              <Link to="/dashboard" style={{ fontSize:'12px', color:'var(--green-600)', textDecoration:'none' }}>← Dashboard</Link>
              <span style={{ color:'var(--gray-400)', fontSize:'12px' }}>/</span>
              <span style={{ fontSize:'12px', color:'var(--gray-600)' }}>{workflow?.name || '...'}</span>
            </div>
            <h1 style={{ fontSize:'22px', fontWeight:'500', color:'var(--gray-800)' }}>Execution logs</h1>
            <p style={{ fontSize:'13px', color:'var(--gray-600)', marginTop:'2px' }}>
              {pagination.total || 0} total executions
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <Link to={`/builder/${workflowId}`}
              style={{ padding:'7px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)',
                background:'transparent', color:'var(--gray-600)', fontSize:'12px', textDecoration:'none', fontFamily:'var(--font)' }}>
              Open builder
            </Link>
            <button onClick={() => load(page)}
              style={{ padding:'7px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)',
                background:'var(--green-50)', color:'var(--green-600)', fontSize:'12px', cursor:'pointer', fontFamily:'var(--font)' }}>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total runs',  value: pagination.total || 0,  accent:'var(--green-800)' },
            { label:'Success',     value: successCount,            accent:'var(--green-600)' },
            { label:'Failed',      value: failCount,               accent:'#A32D2D' },
            { label:'Success rate', value: executions.length ? `${Math.round((successCount/executions.length)*100)}%` : '—', accent:'var(--green-600)' },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--green-50)', borderRadius:'var(--radius-lg)', padding:'14px 16px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'11px', color:'var(--green-600)', marginBottom:'4px' }}>{s.label}</div>
              <div style={{ fontSize:'24px', fontWeight:'500', color: s.accent }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Execution list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'var(--gray-400)', fontSize:'13px' }}>Loading logs...</div>
        ) : executions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px', background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'13px', color:'var(--gray-600)', marginBottom:'4px' }}>No executions yet</div>
            <div style={{ fontSize:'12px', color:'var(--gray-400)' }}>Trigger your webhook or use "Test run" in the builder</div>
          </div>
        ) : (
          <>
            <div style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 80px 80px', gap:'12px',
                padding:'10px 16px', background:'var(--gray-100)', borderBottom:'1px solid var(--border)',
                fontSize:'11px', fontWeight:'500', color:'var(--gray-600)' }}>
                <span>Execution ID</span><span>Status</span><span>Triggered</span><span>Duration</span><span></span>
              </div>
              {executions.map(ex => (
                <div key={ex._id}
                  style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 80px 80px', gap:'12px',
                    padding:'11px 16px', borderBottom:'1px solid var(--border)', alignItems:'center',
                    cursor:'pointer', transition:'background 0.1s' }}
                  onClick={() => setSelectedExecId(ex._id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize:'11px', fontFamily:'DM Mono, monospace', color:'var(--gray-600)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {ex._id}
                  </span>
                  <StatusBadge status={ex.status} />
                  <span style={{ fontSize:'11px', color:'var(--gray-600)' }}>
                    {new Date(ex.createdAt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </span>
                  <span style={{ fontSize:'11px', color:'var(--gray-600)' }}>
                    {ex.durationMs ? (ex.durationMs > 1000 ? `${(ex.durationMs/1000).toFixed(1)}s` : `${ex.durationMs}ms`) : '—'}
                  </span>
                  <span style={{ fontSize:'11px', color:'var(--green-600)' }}>View →</span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginTop:'16px' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { setPage(p); load(p) }}
                    style={{ width:'32px', height:'32px', borderRadius:'var(--radius-md)',
                      border: p === page ? 'none' : '1px solid var(--border)',
                      background: p === page ? 'var(--green-400)' : 'transparent',
                      color: p === page ? 'var(--green-50)' : 'var(--gray-600)',
                      fontSize:'12px', cursor:'pointer', fontFamily:'var(--font)' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedExecId && (
        <ExecutionDetail executionId={selectedExecId} onClose={() => setSelectedExecId(null)} />
      )}
    </div>
  )
}