import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeForm } from './EmployeeForm'

const minValid = {
  first_name: 'Jane', last_name: 'Doe',
  email: 'jane@acme.com', job_title: 'Engineer',
  department: 'Engineering', country: 'USA',
  salary: '100000', hire_date: '2022-01-01',
  currency: 'USD', employment_type: 'Full-time',
}

describe('EmployeeForm', () => {
  it('renders all required fields', () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Salary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hire Date/i)).toBeInTheDocument()
  })

  it('shows required errors on empty submit', async () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }))
    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    })
  })

  it('shows email error for invalid email', async () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/Email/i), 'not-an-email')
    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }))
    await waitFor(() => expect(screen.getByText('Invalid email')).toBeInTheDocument())
  })

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn()
    render(<EmployeeForm initial={minValid} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ first_name: 'Jane', email: 'jane@acme.com' })
  })

  it('calls onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows API error banner when apiError prop set', () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} apiError="Email taken" />)
    expect(screen.getByText('Email taken')).toBeInTheDocument()
  })

  it('shows Save Changes in edit mode', () => {
    render(<EmployeeForm initial={{ id: 1, ...minValid }} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })
})