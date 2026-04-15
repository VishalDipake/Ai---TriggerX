import { useState, useEffect } from 'react'

const inputStyle = {
  width:'100%', padding:'7px 10px', borderRadius:'6px',
  border:'1px solid var(--border)', fontSize:'12px',
  fontFamily:'DM Sans, sans-serif', outline:'none',
  background:'var(--gray-50)', color:'var(--gray-800)',
  marginTop:'4px', display:'block'
}
const labelStyle = { fontSize:'11px', fontWeight:'500', color:'var(--gray-600)', display:'block', marginTop:'12px' }

export default function ConfigPanel({ node, onChange }) {
  const [data, setData] = useState(node?.data || {})

  useEffect(() => { setData(node?.data || {}) }, [node])

  const update = (key, val) => {
    const updated = { ...data, [key]: val }
    setData(updated)
    onChange(node.id, updated)
  }

  if (!node) return (
    <div style={{ padding:'20px', color:'var(--gray-400)', fontSize:'12px', textAlign:'center' }}>
      <div style={{ marginBottom:'8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity:0.4 }}>
          <path d="M12 5v14M5 12h14" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      Click a node to configure it
    </div>
  )

  return (
    <div style={{ padding:'14px', overflowY:'auto' }}>
      <div style={{ fontSize:'12px', fontWeight:'500', color:'var(--gray-800)', marginBottom:'12px', paddingBottom:'10px', borderBottom:'1px solid var(--border)' }}>
        Configure: {node.type}
      </div>

      {node.type === 'webhook' && (
        <div>
          <div style={{ fontSize:'11px', color:'var(--gray-600)', lineHeight:'1.6' }}>
            This is the trigger. When someone calls your webhook URL, the workflow starts.
          </div>
          {data.webhookUrl && (
            <div style={{ marginTop:'12px' }}>
              <label style={labelStyle}>Webhook URL</label>
              <div style={{ ...inputStyle, background:'var(--green-50)', color:'var(--green-800)', fontFamily:'DM Mono, monospace', fontSize:'10px', wordBreak:'break-all', cursor:'text', userSelect:'all' }}>
                {data.webhookUrl}
              </div>
              <div style={{ fontSize:'10px', color:'var(--gray-400)', marginTop:'4px' }}>Click to select, then copy</div>
            </div>
          )}
        </div>
      )}

      {node.type === 'delay' && (
        <div>
          <label style={labelStyle}>Duration</label>
          <input type="number" min="1" value={data.duration || ''} onChange={e => update('duration', e.target.value)}
            placeholder="10" style={inputStyle} />
          <label style={labelStyle}>Unit</label>
          <select value={data.unit || 'seconds'} onChange={e => update('unit', e.target.value)} style={inputStyle}>
            <option value="ms">Milliseconds</option>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
      )}

      {node.type === 'email' && (
        <div>
          <div style={{ fontSize:'10px', color:'var(--green-600)', background:'var(--green-50)', padding:'6px 8px', borderRadius:'6px', marginBottom:'4px', border:'1px solid var(--border)' }}>
            Use {'{{variable}}'} for dynamic data from webhook
          </div>
          <label style={labelStyle}>To</label>
          <input value={data.to || ''} onChange={e => update('to', e.target.value)}
            placeholder="{{email}} or john@example.com" style={inputStyle} />
          <label style={labelStyle}>Subject</label>
          <input value={data.subject || ''} onChange={e => update('subject', e.target.value)}
            placeholder="Hi {{name}}, welcome!" style={inputStyle} />
          <label style={labelStyle}>Body (HTML supported)</label>
          <textarea value={data.body || ''} onChange={e => update('body', e.target.value)}
            placeholder="Hello {{name}}, thanks for signing up!" rows={5}
            style={{ ...inputStyle, resize:'vertical' }} />
        </div>
      )}

      {node.type === 'httpRequest' && (
        <div>
          <label style={labelStyle}>Method</label>
          <select value={data.method || 'GET'} onChange={e => update('method', e.target.value)} style={inputStyle}>
            {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m}>{m}</option>)}
          </select>
          <label style={labelStyle}>URL</label>
          <input value={data.url || ''} onChange={e => update('url', e.target.value)}
            placeholder="https://api.example.com/{{path}}" style={inputStyle} />
          <label style={labelStyle}>Headers (JSON)</label>
          <textarea value={data.headersRaw || ''} onChange={e => { update('headersRaw', e.target.value); try { update('headers', JSON.parse(e.target.value)) } catch {} }}
            placeholder='{"Authorization": "Bearer token"}' rows={3}
            style={{ ...inputStyle, resize:'vertical', fontFamily:'DM Mono, monospace', fontSize:'11px' }} />
          <label style={labelStyle}>Body (JSON, for POST/PUT)</label>
          <textarea value={data.bodyRaw || ''} onChange={e => { update('bodyRaw', e.target.value); try { update('body', JSON.parse(e.target.value)) } catch {} }}
            placeholder='{"key": "{{value}}"}' rows={3}
            style={{ ...inputStyle, resize:'vertical', fontFamily:'DM Mono, monospace', fontSize:'11px' }} />
        </div>
      )}
    </div>
  )
}