#!/usr/bin/env node
/**
 * Setup Blob + connessione progetto FindMiss (zero UI).
 * Uso: FINDMISS_VERCEL_API_TOKEN=xxx node scripts/vercel-blob-setup.mjs
 */
const token = process.env.FINDMISS_VERCEL_API_TOKEN || process.env.VERCEL_TOKEN
const teamSlug = process.env.VERCEL_TEAM_SLUG || 'luzatrades-projects'
const projectName = process.env.VERCEL_PROJECT_NAME || 'findmiss'
const storeName = process.env.VERCEL_BLOB_STORE_NAME || 'findmiss-blob'

if (!token) {
  console.error('Manca FINDMISS_VERCEL_API_TOKEN')
  process.exit(1)
}

const base = 'https://api.vercel.com'

async function api(path, options = {}) {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${base}${path}${sep}teamId=${encodeURIComponent(teamSlug)}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`)
  }
  return data
}

async function getProjectId() {
  const data = await api(`/v9/projects/${encodeURIComponent(projectName)}`)
  return data.id
}

async function listBlobStores() {
  const data = await api('/v1/storage/stores')
  return data.stores || data || []
}

async function createBlobStore(projectId) {
  return api('/v1/storage/stores/blob?billingState=active', {
    method: 'POST',
    body: JSON.stringify({
      name: storeName,
      access: 'public',
      region: 'fra1',
      projectId,
    }),
  })
}

async function connectStore(storeId, projectId) {
  return api(`/v1/storage/stores/${storeId}/connections`, {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      envVarPrefix: '',
    }),
  })
}

async function triggerDeploy(projectId) {
  return api(`/v13/deployments`, {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      target: 'production',
      gitSource: {
        type: 'github',
        ref: 'main',
        repoId: process.env.VERCEL_GITHUB_REPO_ID,
      },
    }),
  }).catch((e) => {
    console.warn('Redeploy automatico non riuscito (ok se fai Redeploy da dashboard):', e.message)
    return null
  })
}

async function main() {
  const projectId = await getProjectId()
  console.log('Project:', projectName, projectId)

  let stores = await listBlobStores()
  let store = stores.find((s) => s.name === storeName || s.slug === storeName)

  if (!store) {
    console.log('Creo Blob store', storeName)
    const created = await createBlobStore(projectId)
    store = created.store || created
  } else {
    console.log('Store esistente:', store.id, store.name)
  }

  const storeId = store.id
  await connectStore(storeId, projectId)
  console.log('Store collegato al progetto (env Blob iniettate).')

  const envs = await api(`/v10/projects/${projectId}/env`)
  const blobVars = (envs.envs || []).filter((e) => String(e.key).includes('BLOB'))
  console.log(
    'Variabili Blob:',
    blobVars.map((e) => `${e.key} → [${(e.target || []).join(', ')}]`).join('; ') || 'nessuna (controlla dashboard)'
  )

  await triggerDeploy(projectId)
  console.log('Fatto. Se serve, Redeploy da Vercel → Deployments.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
