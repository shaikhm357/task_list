const fastify = require('fastify')({
  logger: true
})

fastify.register(require('@fastify/swagger'), {
  exposeRoute: true,
  routePrefix: '/docs',
  swagger: {
    info: { title: 'claims-api' }
  }
})
fastify.register(require('./routes/tasklist'))
fastify.register(require('./routes/start_process'))

fastify.listen({ port: 8000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
