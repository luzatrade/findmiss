*** Begin Patch
*** Update File: frontend/lib/api.js
@@
-    // Server-side: usa localhost
-    return 'http://localhost:3001/api'
-  }
-  
-  // Client-side: rileva automaticamente
-  const hostname = window.location.hostname
-  const protocol = window.location.protocol
-  
-  // Se siamo su localhost, usa localhost
-  if (hostname === 'localhost' || hostname === '127.0.0.1') {
-    return 'http://localhost:3001/api'
-  }
-  
-  // Se siamo su findmiss.it o www.findmiss.it, usa api.findmiss.it
-  if (hostname === 'findmiss.it' || hostname === 'www.findmiss.it') {
-    return `${protocol}//api.findmiss.it/api`
-  }
-  
-  // Altrimenti usa l'IP/hostname corrente (per accesso da rete locale/cellulare)
-  return `http://${hostname}:3001/api`
-}
-
-const API_URL = getApiUrl()
- 
-// Helper per gestire le risposte
-async function handleResponse(response) {
-  const data = await response.json()
-  
-  if (!response.ok) {
-    const error = new Error(data.error || 'Errore nella richiesta')
-    error.status = response.status
-    error.data = data
-    throw error
-  }
-  
-  return data
-}
+// Miglioramenti:
+// - Usa NEXT_PUBLIC_API_URL se definita (più prevedibile in produzione / dev).
+// - getHeaders accetta isFormData per non impostare Content-Type quando si invia FormData.
+// - handleResponse gestisce risposte senza body o non-JSON in modo robusto.
+// - Log dell'API_URL per debug in dev.
+function getApiUrl() {
+  // Se è definita la variabile d'ambiente Next.js, usala direttamente
+  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
+    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') // rimuove slash finale
+  }
+
+  // Server-side (es. SSR) fallback: usa localhost
+  if (typeof window === 'undefined') {
+    return 'http://localhost:3001/api'
+  }
+
+  // Client-side: rileva automaticamente
+  const hostname = window.location.hostname
+  const protocol = window.location.protocol
+
+  // Se siamo su localhost, usa localhost
+  if (hostname === 'localhost' || hostname === '127.0.0.1') {
+    return 'http://localhost:3001/api'
+  }
+
+  // Se siamo su findmiss.it o www.findmiss.it, usa api.findmiss.it
+  if (hostname === 'findmiss.it' || hostname === 'www.findmiss.it') {
+    return `${protocol}//api.findmiss.it/api`
+  }
+
+  // Altrimenti usa l'IP/hostname corrente (per accesso da rete locale/cellulare)
+  return `http://${hostname}:3001/api`
+}
+
+const API_URL = getApiUrl()
+// Log utile per debug (solo in dev)
+if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
+  // eslint-disable-next-line no-console
+  console.log('[API] using API_URL =', API_URL)
+}
+
+// Helper per gestire le risposte in modo robusto
+async function handleResponse(response) {
+  // 204 No Content
+  if (response.status === 204) return {}
+
+  const contentType = response.headers.get('content-type') || ''
+
+  let data
+  try {
+    if (contentType.includes('application/json')) {
+      data = await response.json()
+    } else {
+      data = await response.text()
+    }
+  } catch (err) {
+    // Se il parsing fallisce, restituisci il testo grezzo
+    try {
+      data = await response.text()
+    } catch (e) {
+      data = null
+    }
+  }
+
+  if (!response.ok) {
+    const message = (data && (data.error || data.message)) || data || 'Errore nella richiesta'
+    const error = new Error(message)
+    error.status = response.status
+    error.data = data
+    throw error
+  }
+
+  return data
+}
+
+// Helper per ottenere headers con token
+// Se isFormData = true non impostiamo Content-Type (browser lo farà con boundary)
+function getHeaders(includeAuth = false, isFormData = false) {
+  const headers = {}
+
+  if (!isFormData) {
+    headers['Content-Type'] = 'application/json'
+  }
+
+  if (includeAuth && typeof window !== 'undefined') {
+    const token = localStorage.getItem('token')
+    if (token) {
+      headers['Authorization'] = `Bearer ${token}`
+    }
+  }
+
+  return headers
+}
+
+// ==========================================
+// AUTH
+// ==========================================
+
+export async function login(email, password) {
+  const response = await fetch(`${API_URL}/auth/login`, {
+    method: 'POST',
+    headers: getHeaders(false, false),
+    body: JSON.stringify({ email, password }),
+  })
+
+  const data = await handleResponse(response)
+
+  if (data.success && data.data.token) {
+    localStorage.setItem('token', data.data.token)
+    localStorage.setItem('refreshToken', data.data.refreshToken)
+    localStorage.setItem('user', JSON.stringify(data.data.user))
+  }
+
+  return data
+}
+
+export async function register(email, password, nickname) {
+  const response = await fetch(`${API_URL}/auth/register`, {
+    method: 'POST',
+    headers: getHeaders(false, false),
+    body: JSON.stringify({ email, password, nickname }),
+  })
+
+  const data = await handleResponse(response)
+
+  if (data.success && data.data.token) {
+    localStorage.setItem('token', data.data.token)
+    localStorage.setItem('refreshToken', data.data.refreshToken)
+    localStorage.setItem('user', JSON.stringify(data.data.user))
+  }
+
+  return data
+}
+
+export async function logout() {
+  const refreshToken = localStorage.getItem('refreshToken')
+
+  try {
+    await fetch(`${API_URL}/auth/logout`, {
+      method: 'POST',
+      headers: getHeaders(false, false),
+      body: JSON.stringify({ refreshToken }),
+    })
+  } catch (error) {
+    // eslint-disable-next-line no-console
+    console.error('Errore logout:', error)
+  }
+
+  localStorage.removeItem('token')
+  localStorage.removeItem('refreshToken')
+  localStorage.removeItem('user')
+}
+
+export async function refreshToken() {
+  const refreshTokenValue = localStorage.getItem('refreshToken')
+
+  if (!refreshTokenValue) {
+    throw new Error('No refresh token')
+  }
+
+  const response = await fetch(`${API_URL}/auth/refresh`, {
+    method: 'POST',
+    headers: getHeaders(false, false),
+    body: JSON.stringify({ refreshToken: refreshTokenValue }),
+  })
+
+  const data = await handleResponse(response)
+
+  if (data.success && data.data.token) {
+    localStorage.setItem('token', data.data.token)
+    if (data.data.refreshToken) {
+      localStorage.setItem('refreshToken', data.data.refreshToken)
+    }
+  }
+
+  return data
+}
+
+// NOTE: quando invii FormData (upload media), chiama getHeaders(true, true) e usa body = formData (non impostare Content-Type)
*** End Patch
*** Begin Patch
*** Update File: frontend/app/components/Chat.jsx
@@
-    <div className={`flex ${msg.sender_id === 'current_user_id' ? 'justify-end' : 'justify-start'}`}>
-            <div
-              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
-                msg.sender_id === 'current_user_id'
-                  ? 'bg-purple-600 text-white'
-                  : 'bg-gray-800 text-white'
-              }`}
-            >
+    <div className={`flex ${msg.sender_id === 'current_user_id' ? 'justify-end' : 'justify-start'}`}>
+          <div
+            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
+              msg.sender_id === 'current_user_id'
+                ? 'bg-purple-600 text-white'
+                : 'bg-gray-800 text-white'
+            }`}
+          >
@@
-              <p className="text-xs opacity-60 mt-1">
+              <p className="text-xs opacity-60 mt-1">
                 {/* timestamp o altre info */}
                 {new Date(msg.created_at).toLocaleString()}
               </p>
             </div>
           </div>
         ))}
       </div>
*** End Patch
*** End Patch
