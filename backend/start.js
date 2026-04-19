require('dotenv').config()
const { spawn } = require('child_process')

// Start the server
const server = spawn('node', ['server.js'], { stdio: 'inherit' })

// Start the worker
const worker = spawn('node', ['src/queue/worker.js'], { stdio: 'inherit' })

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`)
  process.exit(code)
})

worker.on('close', (code) => {
  console.log(`Worker exited with code ${code}`)
})