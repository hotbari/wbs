'use client'
import { useState } from 'react'
import type { TaskItem } from '@/lib/types'
import { useComments, useCreateComment } from '@/lib/hooks/useProjects'

interface Props {
  task: TaskItem | null
  onClose: () => void
}

export default function TaskDetailDrawer({ task, onClose }: Props) {
  const [comment, setComment] = useState('')
  const { data: comments } = useComments(task?.id ?? '')
  const { mutate: addComment, isPending } = useCreateComment(task?.id ?? '')

  if (!task) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white shadow-xl h-full overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3 flex-1">
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">{task.status.replace('_', ' ')}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500">Progress:</span>
            <span>{task.progressPercent}%</span>
          </div>
          {task.description && <p className="text-sm text-gray-700">{task.description}</p>}
          {task.dueDate && (
            <div className="text-sm text-gray-500">Due: {task.dueDate}</div>
          )}

          <hr />
          <h3 className="text-sm font-medium text-gray-700">Comments</h3>
          <div className="space-y-2">
            {comments?.map(c => (
              <div key={c.id} className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium text-xs text-gray-500 mb-1">{c.author.fullName}</p>
                <p>{c.body}</p>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="text-sm text-gray-400 italic">No comments yet</p>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="w-full border rounded p-2 text-sm resize-none"
            rows={3}
          />
          <button
            disabled={!comment.trim() || isPending}
            onClick={() => addComment(comment, { onSuccess: () => setComment('') })}
            className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
