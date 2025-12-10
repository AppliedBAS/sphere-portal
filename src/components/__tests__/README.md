# Form Testing Guide

This directory contains example test files demonstrating how to test forms **without actually submitting them**.

## Key Testing Strategies

### 1. **Test Form Rendering**
- Verify all form fields are present
- Check that labels and inputs are correctly associated
- Ensure buttons are rendered with correct states

### 2. **Test User Interactions**
- Type in input fields and verify values update
- Click buttons and verify state changes
- Select options from dropdowns
- Toggle switches and checkboxes

### 3. **Test Validation Logic**
- Verify submit button is disabled when required fields are missing
- Test input format validation (e.g., numeric inputs)
- Check that error states are displayed correctly

### 4. **Test Form State Management**
- Verify state updates when fields change
- Test conditional field visibility
- Check that dependent fields update correctly

### 5. **Prevent Actual Submission**
- Mock form submission handlers
- Use `preventDefault()` in event handlers
- Mock external API calls and database operations
- Verify handlers are called without executing them

## Example Test Patterns

### Testing Input Changes
```typescript
const user = userEvent.setup()
const input = screen.getByLabelText(/description/i)

await user.type(input, 'Test value')
expect(input).toHaveValue('Test value')
```

### Testing Button States
```typescript
const submitButton = screen.getByRole('button', { name: /submit/i })
expect(submitButton).toBeDisabled() // When form is invalid
```

### Testing Without Submission
```typescript
// Mock the submit handler
const handleSubmit = jest.fn()
render(<Form onSubmit={handleSubmit} />)

// Interact with form
await user.click(submitButton)

// Verify handler was called but no actual submission occurred
expect(handleSubmit).toHaveBeenCalled()
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Mocking External Dependencies

All forms depend on:
- Firebase (Firestore, Storage)
- Context providers (AuthContext)
- Custom hooks (useEmployees, etc.)
- External APIs

These should be mocked in your tests to prevent actual network calls or database operations.

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Services**: Never make real API calls or database writes
3. **Test User Behavior**: Focus on what users see and do
4. **Verify State Changes**: Check that form state updates correctly
5. **Test Edge Cases**: Invalid inputs, missing fields, etc.

