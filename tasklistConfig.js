const qs = require('qs')

const getToken = function (username, password) {
  const tasklistTokenGendata = qs.stringify({
    client_id: 'tasklist',
    client_secret: 'XALaRPl5qwTEItdwCMiPS62nVpKs7dL7',
    grant_type: 'password',
    username: username,
    password: password
  })
  const tasklistTokenGenConfig = {
    method: 'post',
    url: 'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: tasklistTokenGendata
  }
  return tasklistTokenGenConfig
}

const getTasks = function (addBearer) {
  const tasklistData = JSON.stringify({
    query: `query tasks ($query: TaskQuery!) {
      tasks (query: $query) {
          id
          name
          taskDefinitionId
          processName
          creationTime
          completionTime
          assignee
          variables {
              id
              name
              value
              previewValue
              isValueTruncated
          }
          taskState
          sortValues
          isFirst
          formKey
          processDefinitionId
          candidateGroups
      }
  }`,
    variables: { query: { state: 'CREATED' } }
  })

  const tokenConfig = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: addBearer,
      'Content-Type': 'application/json'
    },
    data: tasklistData
  }
  return tokenConfig
}

const getKeycloakToken = function () {
  const data = qs.stringify({
    client_id: 'admin-cli',
    client_secret: 'pT7KJd1ZVNZESSDdZ68BeK9UtFa1Vhsd',
    grant_type: 'client_credentials'
  })

  const config = {
    method: 'post',
    url: 'http://localhost:18080/auth/realms/master/protocol/openid-connect/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  }
  return config
}

const getKeycloakGroup = function (addBearerKeycloak) {
  var config = {
    method: 'get',
    url: 'http://localhost:18080/auth/admin/realms/camunda-platform/groups',
    headers: {
      Authorization: addBearerKeycloak
    }
  }
  return config
}

const getCurrentUser = function (addBearer) {
  const data = JSON.stringify({
    query: `query currentUser {
      currentUser {
          userId
          displayName
          permissions
      }
  }`,
    variables: {}
  })
  var config = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: addBearer,
      'Content-Type': 'application/json'
    },
    data: data
  }
  return config
}

const getMembersOfGroups = function (groupId, token) {
  var config = {
    method: 'get',
    url: `http://localhost:18080/auth/admin/realms/camunda-platform/groups/${groupId}/members`,
    headers: {
      Authorization: token
    }
  }
  return config
}

const claimTask = function (taskId, assignee, token) {
  var data = JSON.stringify({
    query: `mutation claimTask ($taskId: String!, $assignee: String) {
      claimTask (taskId: $taskId, assignee: $assignee) {
          id
          name
          taskDefinitionId
          processName
          creationTime
          completionTime
          assignee
          variables {
              id
              name
              value
              previewValue
              isValueTruncated
          }
          taskState
          sortValues
          isFirst
          formKey
          processDefinitionId
          candidateGroups
      }
  }`,
    variables: { taskId: taskId, assignee: assignee }
  })

  var config = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: data
  }
  return config
}

const getTaskById = function (token, tid) {
  var data = JSON.stringify({
    query: `query task ($id: String!) {
      task (id: $id) {
          id
          name
          taskDefinitionId
          processName
          creationTime
          completionTime
          assignee
          variables {
              id
              name
              value
              previewValue
              isValueTruncated
          }
          taskState
          sortValues
          isFirst
          formKey
          processDefinitionId
          candidateGroups
      }
  }`,
    variables: { id: tid }
  })

  var config = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: data
  }
  return config
}

const completeTheTask = function (taskId, name, value, token) {
  value = JSON.stringify(value)
  var data = JSON.stringify({
    query: `mutation completeTask ($taskId: String!, $variables: [VariableInput!]!) {
      completeTask (taskId: $taskId, variables: $variables) {
          id
          name
          taskDefinitionId
          processName
          creationTime
          completionTime
          assignee
          variables {
              id
              name
              value
              previewValue
              isValueTruncated
          }
          taskState
          sortValues
          isFirst
          formKey
          processDefinitionId
          candidateGroups
      }
  }`,
    variables: { taskId: taskId, variables: { name: name, value: value } }
  })

  var config = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: data
  }
  return config
}

const unclaim = function (taskId, token) {
  var data = JSON.stringify({
    query: `mutation unclaimTask ($taskId: String!) {
      unclaimTask (taskId: $taskId) {
          id
          name
          taskDefinitionId
          processName
          creationTime
          completionTime
          assignee
          variables {
              id
              name
              value
              previewValue
              isValueTruncated
          }
          taskState
          sortValues
          isFirst
          formKey
          processDefinitionId
          candidateGroups
      }
  }`,
    variables: { taskId: taskId }
  })

  var config = {
    method: 'post',
    url: 'http://localhost:8082/graphql',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: data
  }

  return config
}

module.exports = {
  getToken,
  getTasks,
  getKeycloakToken,
  getKeycloakGroup,
  getCurrentUser,
  getMembersOfGroups,
  claimTask,
  getTaskById,
  completeTheTask,
  unclaim
}
