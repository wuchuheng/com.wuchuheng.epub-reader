# Universal Programming Rules for AI Agents

**Purpose**: Provide clear, enforceable standards for AI-generated code across all languages and frameworks.  
**Audience**: Any AI agent generating code for production systems.  
**Scope**: Universal principles with language-specific implementations.

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Code Organization](#2-code-organization)
3. [Documentation Standards](#3-documentation-standards)
4. [Error Handling & Security](#4-error-handling--security)
5. [Language Implementation](#5-language-implementation)
6. [Quality Assurance](#6-quality-assurance)
7. [Quick Reference](#7-quick-reference)

---

## 1. Core Principles

### 1.1 Fundamental Rules

**Readability First**: Code is written once, read many times

- Prefer explicit over implicit
- Use descriptive names over comments when possible
- Optimize for human understanding, not just functionality

**Consistency**: Follow established patterns within the codebase

- Match existing code style first
- Apply these rules only when no conflicting patterns exist
- Maintain consistent abstraction levels

**Maintainability**: Design for change

- Single Responsibility Principle
- Minimize dependencies between components
- Make intent clear through structure

### 1.2 Universal Standards

**Line Length**: Maximum 120 characters

- Break long argument lists across lines
- Split complex expressions into intermediate variables
- Use trailing commas where language supports it

**Naming Conventions**: Follow language standards

- Functions/methods: verbs describing action (`getUserData`, `calculateTotal`)
- Variables: nouns describing content (`userData`, `totalAmount`)
- Constants: SCREAMING_SNAKE_CASE where conventional

**File Organization**: Consistent structure across languages

- Dependencies/imports at top
- Types/interfaces before implementation
- Public API before private implementation
- Related functionality grouped together

---

## 2. Code Organization

### 2.1 Extraction Decision Tree

```
Is code repeated 3+ times?
├─ YES → Extract immediately
└─ NO → Is it complex business logic?
   ├─ YES → Consider extraction if >15 lines
   └─ NO → Is it violating single responsibility?
      ├─ YES → Extract to separate function
      └─ NO → Keep inline
```

### 2.2 Function Design

**Size Limits**:

- Functions: 20-30 lines maximum
- Methods in classes: 15-25 lines maximum
- Exception: Simple property getters/setters can be longer

**Parameter Guidelines**:

- Maximum 4 parameters for functions
- Use objects/structs for more complex data
- Required parameters first, optional parameters last

**Complexity Thresholds**:

- Cyclomatic complexity ≤ 8
- Nesting depth ≤ 3 levels
- If exceeded, extract sub-functions

### 2.3 Three-Phase Processing Pattern

**When to Apply**: Functions with >10 lines containing distinct phases

**Pattern Structure**:

```pseudo
function processData(input) {
  // 1. Input validation and preparation
  // - Validate parameters
  // - Apply defaults
  // - Transform input format

  // 2. Core processing
  // - Business logic execution
  // - Data transformations
  // - External API calls

  // 3. Output handling
  // - Format response
  // - Handle errors
  // - Return/emit results
}
```

**Numbering Guidelines**:

- Use 1/2/3 for main phases
- Use 1.1/1.2 for sub-steps within phases
- Maximum 3 sub-levels (1.2.1, 2.1.3, etc.)

---

## 3. Documentation Standards

### 3.1 Documentation Decision Matrix

| Code Element       | Documentation Required | Example               |
| ------------------ | ---------------------- | --------------------- |
| Public API         | Always                 | Full JSDoc/docstring  |
| Private methods    | If complex logic       | Brief purpose comment |
| Properties/Fields  | If not obvious         | Type and constraints  |
| Complex algorithms | Always                 | Algorithm explanation |
| Business rules     | Always                 | Why, not just what    |

### 3.2 Comment Placement Rules

**DO**:

- Document classes/types above declaration
- Document public functions with full API docs
- Use numbered comments inside function bodies only
- Explain WHY for business logic, not WHAT

**DON'T**:

- Add numbered comments at file scope
- Comment obvious code (`i++; // increment i`)
- Use numbered comments on property declarations
- Repeat information available in type signatures

### 3.3 Language-Specific Documentation

**JavaScript/TypeScript**: JSDoc format

```typescript
/**
 * Calculates user's total purchase amount including tax.
 * @param items - Array of purchase items
 * @param taxRate - Tax rate as decimal (0.08 = 8%)
 * @returns Total amount with tax applied
 * @throws {ValidationError} When items array is empty
 */
function calculateTotal(items: PurchaseItem[], taxRate: number): number {
  // 1. Input validation
  if (!items.length) throw new ValidationError('Items required');

  // 2. Core calculation
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal * (1 + taxRate);

  // 3. Output formatting
  return Math.round(total * 100) / 100;
}
```

**Python**: Google/NumPy style docstrings

```python
def calculate_total(items: List[PurchaseItem], tax_rate: float) -> float:
    """Calculates user's total purchase amount including tax.

    Args:
        items: List of purchase items
        tax_rate: Tax rate as decimal (0.08 = 8%)

    Returns:
        Total amount with tax applied

    Raises:
        ValueError: When items list is empty
    """
    # 1. Input validation
    if not items:
        raise ValueError('Items required')

    # 2. Core calculation
    subtotal = sum(item.price for item in items)
    total = subtotal * (1 + tax_rate)

    # 3. Output formatting
    return round(total, 2)
```

---

## 4. Error Handling & Security

### 4.1 Error Handling Patterns

**Input Validation**: Always validate at boundaries

```typescript
// Good: Validate early and explicitly
function processUser(userData: unknown): User {
  // 1. Input validation
  if (!userData || typeof userData !== 'object') {
    throw new ValidationError('Invalid user data provided');
  }

  const data = userData as Record<string, unknown>;
  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    throw new ValidationError('Valid email required');
  }

  // 2. Core processing continues...
}
```

**Error Propagation**: Be explicit about error handling

- Use exceptions for unexpected conditions
- Return error objects for expected failure cases
- Always log errors with sufficient context
- Never swallow errors silently

### 4.2 Security Guidelines

**Input Sanitization**: Treat all external input as untrusted

- Validate data types and ranges
- Sanitize strings for injection attacks
- Use parameterized queries for database operations
- Validate file uploads and restrict file types

**Authentication/Authorization**: Implement at boundaries

- Check permissions before data access
- Use secure session management
- Implement proper logout functionality
- Validate tokens/credentials on every request

### 4.3 Logging Standards

**Log Levels**:

- ERROR: System failures, exceptions
- WARN: Recoverable issues, deprecation usage
- INFO: Important business events, state changes
- DEBUG: Detailed execution flow (development only)

**Structured Logging**: Include context

```typescript
logger.info('User login successful', {
  userId: user.id,
  timestamp: new Date().toISOString(),
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

---

## 5. Language Implementation

### 5.1 Object-Oriented Languages (Java, C#, TypeScript)

**Class Structure**:

```typescript
/**
 * Manages user account operations and validation.
 */
export class UserManager {
  /** Database connection for user operations. */
  private readonly db: Database;

  /** User validation service. */
  private readonly validator: UserValidator;

  constructor(db: Database, validator: UserValidator) {
    this.db = db;
    this.validator = validator;
  }

  /**
   * Creates new user account with validation.
   * @param userData - User information to create account
   * @returns Created user with generated ID
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    // 1. Input validation
    await this.validator.validateCreateRequest(userData);

    // 2. Core processing
    const hashedPassword = await this.hashPassword(userData.password);
    const user = await this.db.users.create({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // 3. Output handling
    return this.sanitizeUserForResponse(user);
  }
}
```

### 5.2 Functional Languages (Rust, Go, modern JavaScript)

**Function Composition**:

```rust
/// Processes payment transaction with validation and logging.
///
/// # Arguments
/// * `payment_request` - Payment details and amount
///
/// # Returns
/// * `Ok(PaymentResult)` - Successful payment confirmation
/// * `Err(PaymentError)` - Payment validation or processing error
pub fn process_payment(payment_request: PaymentRequest) -> Result<PaymentResult, PaymentError> {
    // 1. Input validation
    validate_payment_request(&payment_request)?;

    // 2. Core processing
    let payment_method = resolve_payment_method(&payment_request.method_id)?;
    let transaction = execute_payment(&payment_method, &payment_request)?;

    // 3. Output handling
    log_payment_success(&transaction);
    Ok(PaymentResult::from(transaction))
}
```

### 5.3 Scripting Languages (Python, Shell)

**Python Module Structure**:

```python
"""User management utilities for account operations."""

from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

def create_user_batch(user_data_list: List[dict],
                     validate_emails: bool = True) -> List[User]:
    """Creates multiple user accounts in batch operation.

    Args:
        user_data_list: List of user data dictionaries
        validate_emails: Whether to validate email addresses

    Returns:
        List of created User objects

    Raises:
        BatchProcessingError: When batch operation fails
    """
    # 1. Input validation
    if not user_data_list:
        raise ValueError("User data list cannot be empty")

    validated_users = []
    for user_data in user_data_list:
        # 1.1 Validate individual records
        validated_user = _validate_user_data(user_data, validate_emails)
        validated_users.append(validated_user)

    # 2. Core processing
    created_users = []
    for user_data in validated_users:
        # 2.1 Create individual users
        user = _create_single_user(user_data)
        created_users.append(user)

        # 2.2 Log progress
        logger.info(f"Created user: {user.email}")

    # 3. Output handling
    logger.info(f"Batch created {len(created_users)} users")
    return created_users
```

---

## 6. Quality Assurance

### 6.1 Code Review Checklist

**Functionality**:

- [ ] Does the code solve the intended problem?
- [ ] Are edge cases handled appropriately?
- [ ] Is error handling comprehensive?
- [ ] Are there any obvious bugs or logic errors?

**Design**:

- [ ] Does the code follow single responsibility principle?
- [ ] Are abstractions appropriate for the problem?
- [ ] Is the code extensible for future requirements?
- [ ] Are dependencies minimized and justified?

**Style**:

- [ ] Does code follow established project conventions?
- [ ] Are variable and function names descriptive?
- [ ] Is the code properly formatted and consistent?
- [ ] Are comments helpful and not redundant?

**Performance**:

- [ ] Are there any obvious performance bottlenecks?
- [ ] Is memory usage reasonable?
- [ ] Are database queries optimized?
- [ ] Is caching used appropriately?

### 6.2 Refactoring Triggers

**Extract Function When**:

- Function exceeds 25 lines
- Complex nested logic (>3 levels)
- Repeated code blocks (3+ times)
- Multiple responsibilities evident

**Extract Class When**:

- File exceeds 300 lines
- Multiple related functions operate on same data
- High coupling between function groups
- Clear domain concepts emerge

**Simplify When**:

- Cyclomatic complexity >8
- Parameter count >4
- Deep inheritance hierarchies (>3 levels)
- Excessive coupling between modules

### 6.3 Testing Standards

**Test Structure**: Arrange, Act, Assert pattern

```typescript
describe('UserManager', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      const mockDb = createMockDatabase();
      const manager = new UserManager(mockDb, new UserValidator());

      // Act
      const result = await manager.createUser(userData);

      // Assert
      expect(result.email).toBe(userData.email);
      expect(result.id).toBeDefined();
      expect(mockDb.users.create).toHaveBeenCalledWith(expect.objectContaining(userData));
    });
  });
});
```

**Test Coverage**: Minimum requirements

- Unit tests: 80% line coverage
- Integration tests: All API endpoints
- Critical path testing: 100% coverage for core business logic

---

## 7. Quick Reference

### 7.1 Common Violations and Fixes

| Violation              | Fix                        | Example                                    |
| ---------------------- | -------------------------- | ------------------------------------------ |
| Function too long      | Extract sub-functions      | Split 50-line function into 3 smaller ones |
| Too many parameters    | Use parameter object       | `func(a,b,c,d,e)` → `func(options)`        |
| Unclear variable names | Use descriptive names      | `d` → `userRegistrationDate`               |
| Missing error handling | Add try/catch blocks       | Wrap API calls in error handling           |
| No input validation    | Validate at function start | Check types and ranges early               |

### 7.2 Decision Quick Reference

**Should I add a comment?**

- Is the WHY unclear from code? → Yes, add comment
- Is it complex business logic? → Yes, explain the rule
- Is it just describing WHAT code does? → No, improve code clarity instead

**Should I extract this code?**

- Used 3+ times? → Yes, extract immediately
- > 20 lines with clear purpose? → Yes, extract function
- Complex nested logic? → Yes, extract for clarity

**Should I add documentation?**

- Public API? → Yes, full documentation
- Complex algorithm? → Yes, explain approach
- Simple getter/setter? → No, type info sufficient

### 7.3 Language-Specific Quick Hits

**TypeScript/JavaScript**:

- Use `const` by default, `let` when reassignment needed
- Prefer `async/await` over Promise chains
- Use optional chaining (`obj?.prop`) for safe property access

**Python**:

- Use type hints for function signatures
- Prefer f-strings for string formatting
- Use context managers (`with` statements) for resource management

**Java**:

- Use Optional for nullable returns
- Prefer composition over inheritance
- Use builder pattern for complex object creation

**Go**:

- Handle errors explicitly, don't ignore them
- Use interfaces for behavior contracts
- Prefer composition with embedded structs

**Rust**:

- Use `Result` type for fallible operations
- Prefer borrowing over ownership when possible
- Use pattern matching for control flow

---
