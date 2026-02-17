'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBookmarks()

    // Set up real-time subscription
    const subscription = supabase
      .channel('bookmarks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new, ...prev])
            toast.success('New bookmark added!')
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
            toast.success('Bookmark deleted')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setBookmarks([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
      // No need to update state as real-time will handle it
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bookmarks yet. Add your first bookmark above!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {bookmark.title}
            </h3>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate block"
            >
              {bookmark.url}
            </a>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete bookmark"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
