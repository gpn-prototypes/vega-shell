// Чтобы это потестить надо запустить этот скрипт с дебаггером (node inspect diff-merge/index.js),
// в дебаггере дойти до точки останова с помощью команды `cont`,
// затем запустить этот скрипт в другом процессе (можно сделать это несколько раз),
// затем продолжить выполнение первого процесса остановленного на дебаггере командой `cont`

require('isomorphic-fetch');
const faker = require('faker');
const jsondiffpatch = require('jsondiffpatch');

const GetAllProjectsQuery = () => `
  query GetAllProjects {
    projectList {
      ... on Error {
        code
        message
        details
        payload
      }
      ... on ProjectList {
        projectList {
          vid
          code
          name
          version
        }
      }
    }
  }
`;

const GetLatestVersionOfProjectQuery = (vid) => `
  query GetLatestVersionOfProject {
    project(vid: "${vid}") {
      ... on Error {
        code
        message
        details
        payload
      }
      ... on Project {
        name
        description
        status
        version
      }
    }
  }
`;

const UpdateProjectMutation = (vid, data) => `
  mutation UpdateProject {
    updateProject(vid: "${vid}", data: {
      description: "${data.description}",
      status: ${data.status}
      version: ${data.version} # Можно попробовать поменять версию здесь
    }) {
      result {
        ... on Error {
          code
          errorMessage: message
          details
          payload
        }
        ... on Project {
          name
          description
          status
          version
        }
        ... on UpdateProjectDiff {
          message
        }
      }
    }
  }
`;

const host = 'http://outsourcing.nat.tepkom.ru:38080/graphql'
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYTExMTExMjNiMTExYzExMWQxMTFlMDAwMDAwMDAwMDAifQ.ugIJES0Ruu9cf5aA6hBPP1MLV1FfyaBV5ISq6EcCPKs',
}
const projectId = 'a3333333-b111-c111-d111-e00000000011'
let baseProject
let diff

const getLatestVersionOfProjectRequest = async () => {
  return fetch(host, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: GetLatestVersionOfProjectQuery(projectId) }),
  }).then(res => res.json())
}

const updateProjectRequest = async (data) => {
  return fetch(host, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: UpdateProjectMutation(projectId, data)
    }),
  }).then(res => res.json())
}

const updateProject = async (newProjectData) => {
  const updateObj = {
    ...baseProject,
    description: newProjectData.description,
    status: 'draft'
  }

  const updateResponse = await updateProjectRequest({
    ...updateObj,
    status: 'DRAFT'
  })

  console.log('Raw update response', JSON.stringify(updateResponse))

  const updateResult = updateResponse.data.updateProject.result

  if (updateResult.message === "Local and remote versions do not match. Check for conflicts and make merge.") {
    console.log('Version mismatch! Initiating conflict resolution cycle.')

    diff = jsondiffpatch.diff(baseProject, updateObj)
    console.log(`Diff between ${JSON.stringify(baseProject)} and ${JSON.stringify(updateObj)} === ${JSON.stringify(diff)}`)

    const getProjectResponse = await getLatestVersionOfProjectRequest()
    const latestProjectVersion = getProjectResponse.data.project
    console.log('Update cycle: get project from server:', JSON.stringify(latestProjectVersion))
    baseProject = latestProjectVersion
    const latestProjectVersionPatchedWithSavedDiff = jsondiffpatch.patch(latestProjectVersion, diff)
    console.log('New project version patched with saved diff:', JSON.stringify(latestProjectVersionPatchedWithSavedDiff))

    return await updateProject(latestProjectVersionPatchedWithSavedDiff)
  } else {
    return updateResult
  }
}

const start = async () => {
  const getProjectResponse = await getLatestVersionOfProjectRequest()
  baseProject = getProjectResponse.data.project
  console.log('Get project from server:', JSON.stringify(baseProject))

  const newDescription = faker.company.catchPhrase()
  console.log(`Start updating project description to "${newDescription}"`)
  const newProjectData = {
    description: newDescription,
  }
  debugger
  const newSavedProjectData = await updateProject(newProjectData)

  console.log('New project data:', JSON.stringify(newSavedProjectData))
  baseProject = newSavedProjectData
}

start()

