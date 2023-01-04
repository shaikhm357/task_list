const axios = require('axios')
const { getCurrentUser, getTaskById, getKeycloakToken, getKeycloakGroup, getMembersOfGroups } = require('./config')

const isAuthenticatedUser = async function (token, id) {
  let isSameMember = false
  const groupIds = []
  const user = await axios(getCurrentUser(token)).catch((error) => {
    console.log(error)
  })
  const task = await axios(getTaskById(token, id)).catch((error) => {
    console.log(error)
  })
  const { assignee, candidateGroups } = task.data.data.task
  const { userId } = user.data.data.currentUser
  if (assignee !== null) {
    if (userId === assignee) {
      isSameMember = true
    }
  } else if (candidateGroups !== null) {
    let keyCloaktoken = await axios(getKeycloakToken()).catch((error) => {
      console.log(error)
    })
    let gruops = await axios(getKeycloakGroup(`Bearer ${keyCloaktoken.data.access_token}`)).catch((error) => {
      console.log(error)
    })
    for (let group of gruops.data) {
      if (candidateGroups.includes(group.name)) {
        groupIds.push(group.id)
      }
    }
    for (let groupId of groupIds) {
      let members = await axios(getMembersOfGroups(groupId, `Bearer ${keyCloaktoken.data.access_token}`)).catch((error) => {
        console.log(error)
      })
      for (let member of members.data) {
        if (member.id === userId) {
          isSameMember = true
        }
      }
    }
  }
  console.log('isSame member ===========>', isSameMember)
  return isSameMember
}

module.exports = {
  isAuthenticatedUser
}
