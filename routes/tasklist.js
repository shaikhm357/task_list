const axios = require('axios')
const { isAuthenticatedUser } = require('../utils')
const {
  getToken,
  getTasks,
  getKeycloakToken,
  getKeycloakGroup,
  getCurrentUser,
  getMembersOfGroups,
  getTaskById,
  claimTask,
  completeTheTask,
  unclaim
} = require('../config')

function tasklistRoutes(fastify, options, done) {
  fastify.get('/tasks', async (request, reply) => {
    let showTasksTo = []
    let notAssigned = { data: { tasks: [] } }
    let showToGroup = { data: { tasks: [] } }

    // const { username, password } = request.body
    // //token call
    // const response = await axios(getToken(username, password)).catch((error) => {
    //   console.log(error)
    // })

    // let addBearerTasklist = `Bearer ${response.data.access_token}`
    //all tasks call
    const tasklistRes = await axios(getTasks(request.headers.authorization)).catch((error) => {
      console.log(error)
    })

    //getting logged user
    const tasklistCurrentUser = await axios(getCurrentUser(request.headers.authorization)).catch((error) => {
      console.log(error)
    })

    //generating token of key cloak
    const keycloakToken = await axios(getKeycloakToken()).catch((error) => {
      console.log(error)
    })
    let addBearerKeycloak = `Bearer ${keycloakToken.data.access_token}`
    //getting all groups in keycloak
    const allGroups = await axios(getKeycloakGroup(addBearerKeycloak)).catch((error) => {
      console.log(error)
    })

    //for getting assigned grouped to the task
    for (let task of tasklistRes.data.data.tasks) {
      // getting all groups in keycloak
      if (task.candidateGroups !== null) {
        for (let element of allGroups.data) {
          if (task.candidateGroups.includes(element.name)) {
            const allMembersInGroups = await axios(getMembersOfGroups(element.id, addBearerKeycloak)).catch((error) => {
              console.log(error)
            })
            console.log(allMembersInGroups.data)
            for (let member of allMembersInGroups.data) {
              if (member.id === tasklistCurrentUser.data.data.currentUser.userId) {
                showToGroup.data.tasks.push(task)
              }
            }
          }
        }
      }

      if (task.assignee === null && task.candidateGroups === null) {
        notAssigned.data.tasks.push(task)
      }
      if (task.assignee === tasklistCurrentUser.data.data.currentUser.userId) {
        showTasksTo.push(task.assignee)
      }
    }
    // console.log(showTasksTo)

    if (showTasksTo.includes(tasklistCurrentUser.data.data.currentUser.userId)) {
      let assignedAndUnassignedTasks = tasklistRes.data.data.tasks.filter(
        (t) => t.assignee === tasklistCurrentUser.data.data.currentUser.userId || (t.assignee === null && t.candidateGroups === null)
      )
      reply.send({ data: { tasks: assignedAndUnassignedTasks } })
    } else if (showToGroup.data.tasks.length === 0 && notAssigned.data.tasks.length > 0) {
      reply.send(notAssigned)
    } else {
      showToGroup.data.tasks.push(...notAssigned.data.tasks)
      reply.send(showToGroup)
    }
  })

  fastify.get('/tasks/:id', async (request, reply) => {
    const task = await axios(getTaskById(request.headers.authorization, request.params.id)).catch((error) => {
      console.log(error)
    })
    const { assignee, candidateGroups } = task.data.data.task
    let isAuthenticated = await isAuthenticatedUser(request.headers.authorization, request.params.id)
    console.log('authentication ===============>', isAuthenticated)
    if (assignee !== null || candidateGroups !== null) {
      let res = isAuthenticated ? task.data : { msg: 'unauthenticated user' }
      reply.send(res)
    } else {
      reply.send(task.data)
    }
  })

  fastify.post('/tasks/:id/claim', async (request, reply) => {
    const task = await axios(getTaskById(request.headers.authorization, request.params.id)).catch((error) => {
      console.log(error)
    })
    const { assignee, candidateGroups } = task.data.data.task
    let isAuthenticated = await isAuthenticatedUser(request.headers.authorization, request.params.id)
    if (assignee !== null || candidateGroups !== null) {
      if (!isAuthenticated) {
        reply.send({ msg: 'unauthenticated user' })
        return
      }
    }
    const tasklistCurrentUser = await axios(getCurrentUser(request.headers.authorization)).catch((error) => {
      console.log(error)
    })
    const { userId } = tasklistCurrentUser.data.data.currentUser
    let claimedRes = await axios(claimTask(request.params.id, userId, request.headers.authorization)).catch((error) => {
      console.log(error)
    })
    reply.send(claimedRes.data)
  })

  fastify.post('/tasks/:id/complete', async (request, reply) => {
    const { name, value } = request.body
    let taskId = request.params.id

    const task = await axios(getTaskById(request.headers.authorization, taskId)).catch((error) => {
      console.log(error)
    })
    const { assignee, candidateGroups } = task.data.data.task
    let isAuthenticated = await isAuthenticatedUser(request.headers.authorization, request.params.id)
    if (assignee !== null || candidateGroups !== null) {
      if (!isAuthenticated) {
        reply.send({ msg: 'unauthenticated user' })
        return
      }
    }
    let completeTheTaskRes = await axios(completeTheTask(taskId, name, value, request.headers.authorization)).catch((error) => {
      console.log(error)
    })

    reply.send(completeTheTaskRes.data)
  })

  fastify.post('/tasks/:id/unclaim', async (request, reply) => {
    let taskId = request.params.id

    const task = await axios(getTaskById(request.headers.authorization, taskId)).catch((error) => {
      console.log(error)
    })
    const { assignee, candidateGroups } = task.data.data.task
    let isAuthenticated = await isAuthenticatedUser(request.headers.authorization, request.params.id)
    if (assignee !== null || candidateGroups !== null) {
      if (!isAuthenticated) {
        reply.send({ msg: 'unauthenticated user' })
        return
      }
    }
    let unclaimRes = await axios(unclaim(taskId, request.headers.authorization)).catch((error) => {
      console.log(error)
    })
    reply.send(unclaimRes.data)
  })

  done()
}

module.exports = tasklistRoutes
