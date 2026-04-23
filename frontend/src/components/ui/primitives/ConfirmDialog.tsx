'use client'
import { Modal, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  onConfirm,
  onClose,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && <ModalBody>{description}</ModalBody>}
      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
