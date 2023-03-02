const { ZBClient } = require('zeebe-node')

void (async () => {
  try {
    const zbc = new ZBClient('localhost:26500')

    const topology = await zbc.topology()
    console.log(JSON.stringify(topology, null, 2))

    const res = await zbc.deployProcess(['process/sample_claim.bpmn'])
    console.log(res)

    const result = await zbc.createProcessInstance('Process_claims', {
      message_content: 'Hello from the node.js get started'
    })

    console.log(result)
  } catch (err) {
    console.log(err)
  }
})()
