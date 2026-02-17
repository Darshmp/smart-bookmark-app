'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AddBookmark({ onBookmarkAdded }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url || !title) {
      toast.error('Please fill in all fields')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert([
          {
            url,
            title,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Bookmark added successfully!')
      setUrl('')
      setTitle('')
      if (onBookmarkAdded) {
        onBookmarkAdded(data)
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast.error('Failed to add bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter bookmark title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {loading ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  )
}
