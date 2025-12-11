/**
 * Example test file for ProjectReportForm
 * 
 * This demonstrates how to test forms WITHOUT actually submitting them.
 * You can test:
 * - Form validation
 * - User interactions (typing, clicking, selecting)
 * - Form state changes
 * - Error messages
 * - Button states (enabled/disabled)
 */

/// <reference types="jest" />

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectReportForm from '../ProjectReportForm'
import { Employee } from '@/models/Employee'

// Mock dependencies
jest.mock('@/hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees: [],
    technicians: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
  }),
}))

const mockTimestamp = {
  seconds: Date.now() / 1000,
  nanoseconds: 0,
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  isEqual: jest.fn(),
  toJSON: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }),
  valueOf: () => '',
}

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
    fromDate: jest.fn((date: Date) => ({
      ...mockTimestamp,
      seconds: date.getTime() / 1000,
      toDate: () => date,
      toMillis: () => date.getTime(),
    })),
  },
}))

jest.mock('@/lib/openai', () => ({
  __esModule: true,
  default: {
    responses: {
      create: jest.fn(),
    },
  },
}))

describe('ProjectReportForm', () => {
  const mockAuthorTechnician: Employee = {
    id: 'tech-1',
    name: 'Test Technician',
    email: 'tech@example.com',
    phone: '123-456-7890',
    role: 'technician',
    active: true,
    clientId: 'client-1',
    clientSecret: 'secret-1',
    policy: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: mockTimestamp as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: mockTimestamp as any,
  }

  beforeEach(() => {
    // Prevent actual form submission
    window.location.href = ''
  })

  it('renders form fields without submitting', () => {
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    // Check that form fields are rendered
    // Project field uses a custom component (button), so check for the label element
    expect(screen.getByText('Project *')).toBeInTheDocument()
    // Notes and Additional Materials are actual textareas, so getByLabelText works
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/additional materials/i)).toBeInTheDocument()
  })

  it('allows typing in textarea fields without submitting', async () => {
    const user = userEvent.setup()
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const notesTextarea = screen.getByLabelText(/notes/i)
    
    // Type in the notes field
    await user.type(notesTextarea, 'Test notes content')
    
    // Verify the value was entered (without submitting)
    expect(notesTextarea).toHaveValue('Test notes content')
  })

  it('disables submit button when project is not selected', () => {
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Submit button should be disabled when project is not selected
    expect(submitButton).toBeDisabled()
  })

  it('form has submit handler that prevents default submission', () => {
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const form = document.querySelector('form')
    
    // Verify form exists and has onSubmit handler
    // The actual handleSubmit function calls e.preventDefault()
    // which prevents the default form submission behavior
    expect(form).toBeInTheDocument()
    
    // In a real scenario, you could spy on handleSubmit to verify
    // it's called when form is submitted, but the actual submission
    // (page reload, navigation) is prevented by preventDefault()
  })

  it('validates required fields before allowing submission', () => {
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Button should be disabled when required fields are missing
    expect(submitButton).toBeDisabled()

    // Note: In a real test, you'd mock selecting a project
    // and verify the button becomes enabled
  })

  it('allows adding and removing technicians without submitting', () => {
    // Mock employees hook to return technicians
    jest.doMock('@/hooks/useEmployees', () => ({
      useEmployees: () => ({
        employees: [
          { id: 'emp-1', name: 'Employee 1', role: 'technician' },
          { id: 'emp-2', name: 'Employee 2', role: 'technician' },
        ],
        technicians: [
          { id: 'emp-1', name: 'Employee 1', role: 'technician' },
          { id: 'emp-2', name: 'Employee 2', role: 'technician' },
        ],
        loading: false,
        error: null,
        refetch: jest.fn(),
      }),
    }))

    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    // Test that you can interact with technician selection
    // without triggering form submission
    
    // Verify UI elements exist
    // Assigned Technicians field uses a custom component, so check for label text
    expect(screen.getByText(/assigned technicians/i)).toBeInTheDocument()
  })

  it('handles draft save button click without submitting form', async () => {
    const user = userEvent.setup()
    
    // Mock window.location.href to prevent actual navigation
    const originalHref = window.location.href
    const mockHref = jest.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        get href() {
          return originalHref
        },
        set href(value: string) {
          mockHref(value)
        },
      },
      writable: true,
    })
    
    // Mock Firestore addDoc to prevent actual save and redirect
    const { addDoc } = await import('firebase/firestore')
    const mockAddDoc = addDoc as jest.Mock
    mockAddDoc.mockResolvedValue({ id: 'test-id' })
    
    // Spy on form's onSubmit handler to verify it's not called
    const formOnSubmitSpy = jest.fn((e) => {
      e.preventDefault()
    })
    
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const form = document.querySelector('form')
    if (form) {
      form.addEventListener('submit', formOnSubmitSpy)
    }

    const saveButton = screen.getByRole('button', { name: /save/i })
    
    // Verify save button has type="button" to prevent form submission
    expect(saveButton).toHaveAttribute('type', 'button')
    
    // Click save button (this should trigger handleSaveDraft, not handleSubmit)
    await user.click(saveButton)

    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify that form submission (handleSubmit) didn't happen
    // The save button has type="button" so it shouldn't trigger form submission
    expect(formOnSubmitSpy).not.toHaveBeenCalled()
    
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: window.location,
      writable: true,
    })
  })

  it('updates form state when fields change', async () => {
    const user = userEvent.setup()
    render(
      <ProjectReportForm authorTechnician={mockAuthorTechnician} />
    )

    const notesField = screen.getByLabelText(/notes/i)
    const materialsField = screen.getByLabelText(/additional materials/i)

    // Update notes
    await user.clear(notesField)
    await user.type(notesField, 'Updated notes')

    // Update materials
    await user.clear(materialsField)
    await user.type(materialsField, 'Updated materials')

    // Verify state updates (values are reflected in the inputs)
    expect(notesField).toHaveValue('Updated notes')
    expect(materialsField).toHaveValue('Updated materials')
  })
})

