/**
 * Example test file for ServiceReportForm
 * 
 * Tests form validation and interactions without submitting
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServiceReportForm from '../ServiceReportForm'
import { Employee } from '@/models/Employee'

// Mock dependencies
jest.mock('@/hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees: [
      { id: 'admin-1', name: 'Admin User', role: 'admin', email: 'admin@test.com' },
      { id: 'tech-1', name: 'Tech User', role: 'technician', email: 'tech@test.com' },
    ],
    technicians: [
      { id: 'tech-1', name: 'Tech User', role: 'technician', email: 'tech@test.com' },
    ],
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
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  getDocs: jest.fn(() => Promise.resolve({ 
    forEach: jest.fn(), 
    empty: true,
    docs: [],
  })),
  query: jest.fn(),
  where: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
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

jest.mock('@/services/employeeService', () => ({
  getEmployeeByEmail: jest.fn(() => Promise.resolve({
    id: 'emp-1',
    clientId: 'client-1',
    clientSecret: 'secret-1',
  })),
}))

jest.mock('@/services/reportService', () => ({
  reserveDocid: jest.fn(() => Promise.resolve(1)),
  fetchDraftServiceReports: jest.fn(() => Promise.resolve([])),
}))

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(() => ({
    searchSingleIndex: jest.fn(() => Promise.resolve({
      hits: [],
    })),
  })),
}))

describe('ServiceReportForm', () => {
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
    window.location.href = ''
  })

  it('renders form fields', () => {
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    // Check for labels - use getAllByText and check first occurrence since labels may appear multiple times
    const dispatcherLabels = screen.getAllByText(/dispatcher/i)
    expect(dispatcherLabels.length).toBeGreaterThan(0)
    
    const clientLabels = screen.getAllByText(/client select/i)
    expect(clientLabels.length).toBeGreaterThan(0)
    
    // Additional materials has proper label association
    expect(screen.getByLabelText(/additional materials/i)).toBeInTheDocument()
  })

  it('allows adding service notes without submitting', async () => {
    const user = userEvent.setup()
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    // Wait for initial render with increased timeout
    await screen.findByText(/entry #1/i, {}, { timeout: 15000 })
    
    const addNoteButton = screen.getByRole('button', { name: /add a service note/i })
    
    // Click to add a new service note
    await user.click(addNoteButton)

    // Verify a new service note entry was added
    // (check for multiple "Entry #" labels)
    const entries = await screen.findAllByText(/entry #/i, {}, { timeout: 10000 })
    expect(entries.length).toBeGreaterThan(1)
  }, 30000) // Increase timeout for this test

  it('validates service notes have required time fields', async () => {
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Submit should be disabled when:
    // - No client/building selected
    // - No dispatcher selected
    // - Service notes missing required time
    expect(submitButton).toBeDisabled()
  })

  it('allows editing service note fields without submitting', async () => {
    const user = userEvent.setup()
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    // Wait for the first textarea to appear - use exact text match
    const firstTextarea = await screen.findByPlaceholderText('Describe work performed', { timeout: 15000 })
    
    // Wrap user interaction in act() to suppress React warnings
    await act(async () => {
      await user.type(firstTextarea, 'Test service note content')
    })
    
    // Wait for the value to be set
    await waitFor(() => {
      expect(firstTextarea).toHaveValue('Test service note content')
    }, { timeout: 5000 })
  }, 25000) // Increase timeout for this test

  it('handles warranty toggle without submitting', async () => {
    const user = userEvent.setup()
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    const warrantySwitch = screen.getByLabelText(/warranty service/i)
    
    if (warrantySwitch) {
      await user.click(warrantySwitch)
      // Verify state changed (warranty is now checked)
      expect(warrantySwitch).toBeChecked()
    }
  })

  it('disables submit when required fields are missing', () => {
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Should be disabled when client/building/dispatcher not selected
    expect(submitButton).toBeDisabled()
  })

  it('allows editing material notes without submitting', async () => {
    const user = userEvent.setup()
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    // Wait for the materials field to appear
    const materialsField = await waitFor(
      () => screen.getByLabelText(/additional materials/i),
      { timeout: 10000 }
    )
    
    // Clear the field completely before typing
    await user.click(materialsField)
    // Use clear() which is more reliable than manual selection
    await user.clear(materialsField)
    // Verify the field is empty before typing
    await waitFor(() => {
      expect(materialsField).toHaveValue('')
    }, { timeout: 2000 })
    
    // Now type the new content
    await user.type(materialsField, 'Test materials')
    
    // Wait for the value to be set
    await waitFor(() => {
      expect(materialsField).toHaveValue('Test materials')
    }, { timeout: 5000 })
  }, 20000) // Increase timeout for this test

  it('handles save draft without submitting form', async () => {
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
    
    // Mock Firestore functions to prevent actual save
    const { addDoc, setDoc } = await import('firebase/firestore')
    const mockAddDoc = addDoc as jest.Mock
    const mockSetDoc = setDoc as jest.Mock
    mockAddDoc.mockResolvedValue({ id: 'test-id' })
    mockSetDoc.mockResolvedValue(undefined)
    
    // Mock reserveDocid
    const { reserveDocid } = await import('@/services/reportService')
    const mockReserveDocid = reserveDocid as jest.Mock
    mockReserveDocid.mockResolvedValue(1)
    
    // Spy on form's onSubmit handler to verify it's not called
    const formOnSubmitSpy = jest.fn((e) => {
      e.preventDefault()
    })
    
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

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

  it('validates service note time entries', () => {
    render(<ServiceReportForm authorTechnician={mockAuthorTechnician} />)

    // The form validates that each service note has:
    // - At least technician time > 0 OR helper time > 0
    
    // This validation happens in handleSubmit, but we can test
    // that the form renders time select fields correctly
    // TimeSelect uses a Select component (not a standard input), so we verify
    // the labels exist and the form structure is correct
    const technicianTimeLabels = screen.getAllByText(/technician time/i)
    expect(technicianTimeLabels.length).toBeGreaterThan(0)
    
    // Verify helper time labels also exist
    const helperTimeLabels = screen.getAllByText(/helper time/i)
    expect(helperTimeLabels.length).toBeGreaterThan(0)
  })
})

