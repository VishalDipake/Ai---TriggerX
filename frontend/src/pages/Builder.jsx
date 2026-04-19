import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ReactFlow, Background, Controls, addEdge, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { getWorkflow, updateWorkflow } from '../api/workflows.js'
import { triggerManual } from '../api/executions.js'
import { nodeTypes } from '../components/builder/NodeTypes.jsx'
import ConfigPanel from '../components/builder/ConfigPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

const PALETTE = [
  { type:'webhook', label:'Webhook', sublabel:'trigger', style:{ background:'#27500A', color:'#C0DD97', border:'1px solid #3B6D11' } },
  { type:'delay',   label:'Delay',   sublabel:'action',  style:{ background:'var(--amber-50)', color:'#412402', border:'1px solid #EF9F27' } },
  { type:'email',   label:'Email',   sublabel:'action',  style:{ background:'var(--teal-50)', color:'var(--teal-800)', border:'1px solid var(--teal-200)' } },
  { type:'httpRequest', label:'HTTP', sublabel:'action', style:{ background:'var(--blue-50)', color:'var(--blue-800)', border:'1px solid var(--blue-200)' } },
]

let nodeId = 100

export default function Builder() {
  const { id } = useParams()
  const nav = useNavigate()
  const { logoutUser, user } = useAuth()
  const [workflow, setWorkflow] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const reactFlowWrapper = useRef(null)
  const [rfInstance, setRfInstance] = useState(null)

  useEffect(() => {
    getWorkflow(id).then(res => {
      const wf = res.data.data.workflow
      const url = res.data.data.webhookUrl
      setWorkflow(wf)
      setWebhookUrl(url)
      if (wf.nodes?.length) {
        const mapped = wf.nodes.map(n => ({
          id: n.id, type: n.type,
          position: n.position || { x: 100, y: 150 },
          data: n.type === 'webhook' ? { ...n.data, webhookUrl: url } : { ...n.data }
        }))
        setNodes(mapped)
        setEdges(wf.edges?.map(e => ({ id: e.id, source: e.source, target: e.target, animated: true })) || [])
      }
    }).catch(() => { toast.error('Workflow not found'); nav('/dashboard') })
  }, [id])

  const onConnect = useCallback((params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)), [])

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), [])
  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const handleConfigChange = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: newData } : n))
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: newData } : prev)
  }, [])

  const addNode = (type) => {
    const newId = `node_${++nodeId}`
    const pos = rfInstance ? rfInstance.screenToFlowPosition({ x: 300, y: 200 + nodes.length * 80 }) : { x: 300, y: 200 }
    const newNode = {
      id: newId, type,
      position: pos,
      data: type === 'webhook' ? { webhookUrl } : {}
    }
    setNodes(nds => [...nds, newNode])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const nodesData = nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }))
      const edgesData = edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      await updateWorkflow(id, { nodes: nodesData, edges: edgesData })
      toast.success('Workflow saved!')
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleRun = async () => {
    setRunning(true)
    try {
      await handleSave()
      await triggerManual(id, {})
      toast.success('Workflow triggered! Check logs to see execution.')
    } catch { toast.error('Failed to trigger') }
    finally { setRunning(false) }
  }

  const handleDeleteNode = () => {
    if (!selectedNode) return
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id))
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
  }

  return (
    <div style={{ display:'flex', height:'100vh', flexDirection:'column', background:'var(--gray-50)' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'var(--green-50)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Link to="/dashboard" style={{ color:'var(--green-600)', fontSize:'12px', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}>
            ← Back
          </Link>
          <div style={{ width:'1px', height:'16px', background:'var(--border)' }}></div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--green-400)' }}></div>
            <span style={{ fontSize:'13px', fontWeight:'500', color:'var(--green-800)' }}>{workflow?.name || 'Loading...'}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {webhookUrl && (
            <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Webhook URL copied!') }}
              style={{ padding:'5px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)', background:'transparent', color:'var(--green-600)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:'5px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3V2a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H8" stroke="currentColor" strokeWidth="1.2"/></svg>
              Copy webhook URL
            </button>
          )}
          <Link to={`/logs/${id}`}
            style={{ padding:'5px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--gray-600)', fontSize:'11px', textDecoration:'none', fontFamily:'var(--font)' }}>
            View logs
          </Link>
          <button onClick={handleRun} disabled={running}
            style={{ padding:'6px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-dark)', background:'var(--green-50)', color:'var(--green-600)', fontSize:'12px', cursor:'pointer', fontFamily:'var(--font)', fontWeight:'500' }}>
            {running ? 'Running...' : 'Test run'}
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'6px 14px', borderRadius:'var(--radius-md)', border:'none', background: saving ? 'var(--green-200)' : 'var(--green-400)', color:'var(--green-50)', fontSize:'12px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font)' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Builder body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Node palette */}
        <div style={{ width:'150px', background:'var(--white)', borderRight:'1px solid var(--border)', padding:'12px 8px', flexShrink:0, overflowY:'auto' }}>
          <div style={{ fontSize:'9px', fontWeight:'500', color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px', padding:'0 4px' }}>Drag to add</div>
          {PALETTE.map(item => (
            <div key={item.type}
              draggable onDragStart={e => e.dataTransfer.setData('nodeType', item.type)}
              onClick={() => addNode(item.type)}
              style={{ padding:'8px 10px', borderRadius:'var(--radius-md)', marginBottom:'5px', cursor:'pointer', ...item.style, fontSize:'11px' }}>
              <div style={{ fontSize:'9px', opacity:0.7, marginBottom:'1px', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.05em' }}>{item.sublabel}</div>
              <div style={{ fontWeight:'500' }}>{item.label}</div>
            </div>
          ))}
          {selectedNode && (
            <div style={{ marginTop:'16px', paddingTop:'12px', borderTop:'1px solid var(--border)' }}>
              <button onClick={handleDeleteNode}
                style={{ width:'100%', padding:'6px', borderRadius:'var(--radius-md)', border:'1px solid #F09595', background:'var(--red-50)', color:'#791F1F', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font)' }}>
                Delete node
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex:1, position:'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onNodeClick={onNodeClick}
            onPaneClick={onPaneClick} nodeTypes={nodeTypes}
            onInit={setRfInstance}
            onDrop={e => {
              e.preventDefault()
              const type = e.dataTransfer.getData('nodeType')
              if (!type || !rfInstance) return
              const pos = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
              const newId = `node_${++nodeId}`
              setNodes(nds => [...nds, { id: newId, type, position: pos, data: type === 'webhook' ? { webhookUrl } : {} }])
            }}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
            fitView defaultEdgeOptions={{ animated: true, style: { stroke:'var(--green-400)', strokeWidth:2 } }}>
            <Background variant={BackgroundVariant.Dots} color="#C0DD97" gap={18} size={1} />
            <Controls />
          </ReactFlow>
          {nodes.length === 0 && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ textAlign:'center', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'13px', marginBottom:'4px' }}>Click a node from the panel to add it</div>
                <div style={{ fontSize:'11px' }}>Then connect them by dragging from the handles</div>
              </div>
            </div>
          )}
        </div>

        {/* Config panel */}
        <div style={{ width:'200px', background:'var(--white)', borderLeft:'1px solid var(--border)', flexShrink:0, overflowY:'auto' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontSize:'11px', fontWeight:'500', color:'var(--gray-600)' }}>
            {selectedNode ? `${selectedNode.type} config` : 'Node config'}
          </div>
          <ConfigPanel node={selectedNode} onChange={handleConfigChange} />
        </div>
      </div>
    </div>
  )
}