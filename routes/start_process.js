const { exec } = require('child_process')

function startProcesRoutes(fastify, options, done) {
  fastify.get('/start/process', async (request, reply) => {
    const scriptPath = 'deploy-and-start-process.js'

    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      console.log(`stdout: ${stdout}`)
      reply.send({ msg: 'deployed successfully' })
    })
  })

  done()
}

module.exports = startProcesRoutes
