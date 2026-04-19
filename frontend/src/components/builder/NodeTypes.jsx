import { Handle, Position } from '@xyflow/react'

const baseStyle = {
  padding:'10px 14px', borderRadius:'10px', minWidth:'130px',
  fontSize:'12px', fontFamily:'DM Sans, sans-serif', cursor:'default',
  position:'relative'
}

const labelStyle = { fontSize:'9px', fontWeight:'500', opacity:0.7, marginBottom:'2px', display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }
const nameStyle = { fontWeight:'500', fontSize:'12px' }

function NodeWrapper({ children, style, isSource = true, isTarget = true }) {
  return (
    <div style={{ ...baseStyle, ...style }}>
      {isTarget && <Handle type="target" position={Position.Left} />}
      {children}
      {isSource && <Handle type="source" position={Position.Right} />}
    </div>
  )
}

export function WebhookNode({ data, selected }) {
  return (
    <NodeWrapper isTarget={false}
      style={{ background:'#27500A', border: selected ? '2px solid #97C459' : '1px solid #3B6D11', color:'#C0DD97' }}>
      <span style={{ ...labelStyle, color:'#97C459' }}>trigger</span>
      <div style={{ ...nameStyle, color:'#EAF3DE' }}>Webhook</div>
      {data.webhookUrl && <div style={{ fontSize:'9px', color:'#97C459', marginTop:'4px', fontFamily:'DM Mono, monospace', wordBreak:'break-all' }}>
        {data.webhookUrl.split('/').slice(-1)[0].substring(0,16)}...
      </div>}
    </NodeWrapper>
  )
}

export function DelayNode({ data, selected }) {
  return (
    <NodeWrapper style={{ background:'var(--amber-50)', border: selected ? '2px solid #EF9F27' : '1px solid #EF9F27', color:'#412402' }}>
      <span style={{ ...labelStyle, color:'#BA7517' }}>delay</span>
      <div style={{ ...nameStyle, color:'#412402' }}>
        {data.duration ? `Wait ${data.duration} ${data.unit || 'seconds'}` : 'Delay'}
      </div>
    </NodeWrapper>
  )
}

export function EmailNode({ data, selected }) {
  return (
    <NodeWrapper style={{ background:'var(--teal-50)', border: selected ? '2px solid var(--teal-200)' : '1px solid var(--teal-200)', color:'var(--teal-800)' }}>
      <span style={{ ...labelStyle, color:'#0F6E56' }}>email</span>
      <div style={{ ...nameStyle, color:'#04342C' }}>{data.subject ? data.subject.substring(0,20) : 'Send email'}</div>
      {data.to && <div style={{ fontSize:'9px', color:'#0F6E56', marginTop:'2px' }}>→ {data.to.substring(0,20)}</div>}
    </NodeWrapper>
  )
}

export function HttpRequestNode({ data, selected }) {
  return (
    <NodeWrapper style={{ background:'var(--blue-50)', border: selected ? '2px solid var(--blue-200)' : '1px solid var(--blue-200)', color:'var(--blue-800)' }}>
      <span style={{ ...labelStyle, color:'#185FA5' }}>http</span>
      <div style={{ ...nameStyle, color:'#042C53' }}>{data.method || 'GET'} request</div>
      {data.url && <div style={{ fontSize:'9px', color:'#185FA5', marginTop:'2px' }}>{data.url.substring(0,22)}</div>}
    </NodeWrapper>
  )
}

export const nodeTypes = {
  webhook: WebhookNode,
  delay: DelayNode,
  email: EmailNode,
  httpRequest: HttpRequestNode,
}