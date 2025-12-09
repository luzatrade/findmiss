'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Image, X, Loader2, Upload, Type, Palette } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function CreateStoryPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  
  const [user, setUser] = useState(null)
  const [step, setStep] = useState('select') // select, preview, edit
  const [mediaType, setMediaType] = useState(null) // image, video, camera
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  
  // Text overlay
  const [text, setText] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('transparent')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth?redirect=/stories/create')
      return
    }
    
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        if (u.role !== 'advertiser') {
          setError('Solo gli inserzionisti possono creare storie')
          return
        }
        setUser(u)
      } catch {}
    }
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStep('camera')
    } catch (err) {
      setError('Impossibile accedere alla camera')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      setMediaFile(blob)
      setMediaPreview(canvas.toDataURL('image/jpeg'))
      setMediaType('image')
      setStep('edit')
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
    }, 'image/jpeg')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const isVideo = file.type.startsWith('video/')
    setMediaType(isVideo ? 'video' : 'image')
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
    setStep('edit')
  }

  const uploadStory = async () => {
    if (!mediaFile) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      // Upload media
      const formData = new FormData()
      formData.append('file', mediaFile)
      formData.append('type', 'story')
      
      const uploadRes = await fetch(`${API_URL}/upload/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      
      const uploadData = await uploadRes.json()
      
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Errore upload')
      }
      
      // Create story
      const storyRes = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: mediaType,
          media_url: uploadData.data.url,
          thumbnail_url: uploadData.data.thumbnail_url,
          text_overlay: text || null,
          text_color: textColor,
          bg_color: bgColor
        })
      })
      
      const storyData = await storyRes.json()
      
      if (storyData.success) {
        router.push('/')
      } else {
        throw new Error(storyData.error || 'Errore creazione storia')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <Link href="/" className="text-pink-500 hover:underline">
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 'select') router.back()
              else setStep('select')
            }}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Crea Storia</h1>
          {step === 'edit' && (
            <button
              onClick={uploadStory}
              disabled={isUploading}
              className="bg-pink-500 px-4 py-1.5 rounded-full font-semibold text-sm disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pubblica'}
            </button>
          )}
          {step !== 'edit' && <div className="w-10" />}
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Select Media Type */}
      {step === 'select' && (
        <div className="p-6 space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Crea una Storia</h2>
            <p className="text-gray-400">Le storie scompaiono dopo 24 ore</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full p-5 bg-gray-900 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition"
            >
              <div className="w-14 h-14 bg-pink-500/20 rounded-full flex items-center justify-center">
                <Camera size={24} className="text-pink-500" />
              </div>
              <div className="text-left">
                <p className="font-bold">Scatta una foto</p>
                <p className="text-sm text-gray-400">Usa la fotocamera</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 bg-gray-900 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition"
            >
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Image size={24} className="text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-bold">Carica dalla galleria</p>
                <p className="text-sm text-gray-400">Foto o video</p>
              </div>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      )}

      {/* Camera View */}
      {step === 'camera' && (
        <div className="relative h-[calc(100vh-60px)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-white rounded-full" />
            </button>
          </div>
        </div>
      )}

      {/* Edit View */}
      {step === 'edit' && mediaPreview && (
        <div className="relative h-[calc(100vh-120px)]">
          {/* Preview */}
          <div className="relative h-full flex items-center justify-center bg-gray-950">
            {mediaType === 'video' ? (
              <video
                src={mediaPreview}
                className="max-h-full max-w-full object-contain"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            )}
            
            {/* Text overlay */}
            {text && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-xl font-bold text-center"
                style={{ color: textColor, backgroundColor: bgColor }}
              >
                {text}
              </div>
            )}
          </div>

          {/* Edit tools */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={20} className="text-gray-400" />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Aggiungi testo..."
                className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-gray-400" />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-2 border-white cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                {['transparent', 'rgba(0,0,0,0.7)', 'rgba(255,255,255,0.9)'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${bgColor === color ? 'border-pink-500' : 'border-gray-600'}`}
                    style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

