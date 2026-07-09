```markdown
# storesoues-web Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill covers the core development patterns and conventions used in the `storesoues-web` TypeScript codebase. It documents file naming, import/export styles, commit message conventions, and testing patterns. Whether you're a new contributor or looking to maintain consistency, this guide will help you write code that fits seamlessly into the project.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.ts`, `orderList.test.ts`

### Import Style
- Use **relative imports** for referencing other modules.
  - Example:
    ```typescript
    import { getUser } from './userService';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // userService.ts
    export function getUser(id: string) { ... }
    ```

### Commit Message Patterns
- Follow **Conventional Commits** with these prefixes:
  - `fix`: Bug fixes
  - `feat`: New features
  - `docs`: Documentation changes
- Keep commit messages concise but descriptive (average ~100 characters).
  - Example:
    ```
    feat: add user authentication with JWT and session storage
    ```

## Workflows

*No automated workflows detected in this repository.*

## Testing Patterns

- Test files follow the `*.test.*` naming pattern.
  - Example: `userService.test.ts`
- The testing framework is **unknown**, but tests are colocated with source files or in the same directory.
- Example test file structure:
  ```typescript
  // userService.test.ts
  import { getUser } from './userService';

  describe('getUser', () => {
    it('returns user data for valid ID', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command     | Purpose                                           |
|-------------|---------------------------------------------------|
| /test       | Run all test files matching `*.test.*` pattern    |
| /commit     | Format commit message using conventional pattern  |
```