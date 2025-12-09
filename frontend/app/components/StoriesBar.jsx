'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function StoriesBar() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {}
      }
    }
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      const res = await fetch(`${API_URL}/stories`)
      const data = await res.json()
      
      if (data.success && data.data?.length > 0) {
        setStories(data.data)
      } else {
        // Demo stories
        setStories([
          { user_id: 1, user: { nickname: 'Sofia', avatar_url: null }, stories: [{ id: 1 }] },
          { user_id: 2, user: { nickname: 'Valentina', avatar_url: null }, stories: [{ id: 2 }] },
          { user_id: 3, user: { nickname: 'Giulia', avatar_url: null }, stories: [{ id: 3 }] },
          { user_id: 4, user: { nickname: 'Elena', avatar_url: null }, stories: [{ id: 4 }] },
          { user_id: 5, user: { nickname: 'Martina', avatar_url: null }, stories: [{ id: 5 }] },
        ])
      }
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto hide-scrollbar">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="w-12 h-2 bg-gray-200 rounded mt-1.5 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto hide-scrollbar bg-white border-b border-gray-100">
      {/* Add story button */}
      {user && user.role === 'advertiser' && (
        <Link href="/stories/create" className="flex-shrink-0 text-center">
          <div className="relative w-16 h-16">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <Plus size={24} className="text-pink-500" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 truncate w-16">La tua</p>
        </Link>
      )}

      {/* Stories */}
      {stories.map((storyGroup) => (
        <Link
          key={storyGroup.user_id}
          href={`/stories?user=${storyGroup.user_id}`}
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
            {/* Story count indicator */}
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
      ))}
    </div>
  )
}

