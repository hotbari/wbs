'use client'
import { useState } from 'react'
import type { TaskItem } from '@/lib/types'
import { useComments, useCreateComment } from '@/lib/hooks/useProjects'
import { Drawer, Badge, ProgressBar, Avatar, Card, CardBody, Button, Textarea } from '@/components/ui/primitives'
import { statusToProgress, statusToLabel } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success'> = {
  TODO: 'default', IN_PROGRESS: 'info', DONE: 'success',
}

interface Props {
  task: TaskItem | null
  onClose: () => void
}

export default function TaskDetailDrawer({ task, onClose }: Props) {
  const [comment, setComment] = useState('')
  const { data: comments } = useComments(task?.id ?? '')
  const { mutate: addComment, isPending } = useCreateComment(task?.id ?? '')

  return (
    <Drawer open={!!task} onClose={onClose} title={task?.title ?? ''}>
      {task && (
        <>
          <div className="px-5 py-4 space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">상태</span>
                <Badge variant={STATUS_VARIANT[task.status]}>{statusToLabel(task.status)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">진행률</span>
                <span className="text-sm font-medium">{statusToProgress(task.status)}%</span>
              </div>
            </div>
            <ProgressBar value={statusToProgress(task.status)} />
            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
            {task.dueDate && <p className="text-sm text-muted-foreground">마감일: {task.dueDate}</p>}

            <div className="border-t border-border pt-4">
              <h3 className="label-caps mb-3">댓글</h3>
              <div className="space-y-2">
                {comments?.map(c => (
                  <Card key={c.id}>
                    <CardBody className="py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar name={c.author.fullName} size="sm" />
                        <span className="text-xs font-medium text-muted-foreground">{c.author.fullName}</span>
                      </div>
                      <p className="text-sm">{c.body}</p>
                    </CardBody>
                  </Card>
                ))}
                {comments?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">댓글이 없습니다</p>
                )}
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-border shrink-0">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="댓글 입력..."
              rows={3}
            />
            <Button
              className="mt-2"
              disabled={!comment.trim()}
              loading={isPending}
              onClick={() => addComment(comment, { onSuccess: () => setComment('') })}
            >
              작성
            </Button>
          </div>
        </>
      )}
    </Drawer>
  )
}
