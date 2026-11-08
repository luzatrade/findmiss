'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'

import { getApiUrl } from '../../lib/runtime-api'
import { buildAuthHref } from '../../lib/authRedirect'
import { syncStoredUserFromProfile } from '../../lib/syncStoredUser'

const API_URL = getApiUrl()

export default function StoriesBar() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [myStoryCount, setMyStoryCount] = useState(0)

  const loadStories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stories`)
      const data = await res.json()

      if (data.success && Array.isArray(data.data)) {
        setStories(data.data.filter((g) => (g.stories?.length || 0) > 0))
      } else {
        setStories([])
      }
    } catch (error) {
      console.error('Errore:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyStories = useCallback(async (token) => {
    if (!token) {
      setMyStoryCount(0)
      return
    }
    try {
      const res = await fetch(`${API_URL}/stories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setMyStoryCount((data.data || []).length)
      }
    } catch {
      setMyStoryCount(0)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    const init = async () => {
      if (token) {
        const synced = await syncStoredUserFromProfile(API_URL, token)
        if (synced) setUser(synced)
        else if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {
            setUser(null)
          }
        }
        await loadMyStories(token)
      } else if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          setUser(null)
        }
      }
      await loadStories()
    }

    init()
  }, [loadStories, loadMyStories])

  const isAdvertiser = user?.role === 'advertiser' || user?.role === 'admin'
  const myUserId = user?.id
  const othersStories = stories.filter(
    (g) => String(g.user_id || g.user?.id) !== String(myUserId)
  )

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto hide-scrollbar">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="w-12 h-2 bg-gray-200 rounded mt-1.5 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto hide-scrollbar">
        {isAdvertiser && myUserId ? (
          <>
            <Link
              href="/stories/create"
              className="flex-shrink-0 text-center group"
              title="Pubblica una storia (visibile 24 ore)"
            >
              <div className="relative w-16 h-16">
                <div className="w-full h-full rounded-full border-2 border-dashed border-pink-300 flex items-center justify-center bg-pink-50 group-hover:bg-pink-100 transition">
                  <Plus size={28} className="text-pink-500" />
                </div>
              </div>
              <p className="text-[10px] text-pink-600 font-medium mt-1.5 truncate w-16">Nuova</p>
            </Link>

            {myStoryCount > 0 && (
              <Link
                href={`/stories?user=${myUserId}`}
                className="flex-shrink-0 text-center"
                title="Le tue storie attive — tieni premuto o apri per eliminarle"
              >
                <div className="relative w-16 h-16">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user?.nickname?.[0]?.toUpperCase() || 'Tu'}
                      </div>
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 bg-purple-600 text-white text-[9px] min-w-[1rem] h-4 px-1 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {myStoryCount}
                  </span>
                </div>
                <p className="text-[10px] text-gray-800 font-medium mt-1.5 truncate w-16">Le tue</p>
              </Link>
            )}
          </>
        ) : !user ? (
          <Link
            href={buildAuthHref({ register: true, role: 'advertiser', redirect: '/stories/create' })}
            className="flex-shrink-0 text-center"
          >
            <div className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus size={22} className="text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 truncate w-16">Storie</p>
          </Link>
        ) : null}

        {othersStories.map((storyGroup) => {
          const uid = storyGroup.user_id || storyGroup.user?.id
          return (
            <Link
              key={uid}
              href={`/stories?user=${uid}`}
              className="flex-shrink-0 text-center"
            >
              <div className="relative w-16 h-16">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    {storyGroup.user?.avatar_url ? (
                      <img
                        src={storyGroup.user.avatar_url}
                        alt={storyGroup.user.nickname}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {storyGroup.user?.nickname?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                </div>
                {storyGroup.stories?.length > 1 && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-pink-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {storyGroup.stories.length}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5 truncate w-16">
                {storyGroup.user?.nickname || 'Utente'}
              </p>
            </Link>
          )
        })}
      </div>
      {isAdvertiser && (
        <p className="text-[10px] text-gray-400 px-4 pb-2 -mt-1">
          Le storie restano online <span className="font-medium text-gray-500">24 ore</span>, poi spariscono da sole.
          Eliminazione manuale: apri <span className="font-medium text-gray-500">Le tue</span> → icona cestino.
        </p>
      )}
    </div>
  )
}
