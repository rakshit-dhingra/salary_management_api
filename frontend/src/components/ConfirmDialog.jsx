import { Modal } from './Modal'

export function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="modal-sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger"    onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : 'Deactivate'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 22 }}>⚠️</span>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{description}</p>
      </div>
    </Modal>
  )
}