import { useState } from 'react'
import { Modal } from './Modal'
import { EmployeeForm } from './EmployeeForm'
import { createEmployee, updateEmployee } from '../lib/api'
import { useToast } from './Toast'

export function EmployeeModal({ open, employee, onClose, onSaved }) {
  const toast = useToast()
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState(null)

  async function handleSubmit(data) {
    setLoading(true)
    setApiError(null)
    try {
      if (employee?.id) {
        await updateEmployee(employee.id, data)
        toast('Employee updated')
      } else {
        await createEmployee(data)
        toast('Employee added')
      }
      onSaved()
      onClose()
    } catch (e) {
      setApiError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee?.id ? 'Edit Employee' : 'Add Employee'}
    >
      <EmployeeForm
        initial={employee || {}}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        apiError={apiError}
      />
    </Modal>
  )
}