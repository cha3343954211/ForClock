# Contributing to ZenClock

Thank you for your interest in contributing to ZenClock! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in ZenClock a harassment-free experience for everyone. We welcome contributors of all backgrounds and skill levels.

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

Examples of unacceptable behavior:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information without permission

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js v18+ installed
- Basic knowledge of React and TypeScript
- Git installed and configured
- A GitHub account

### Setup Development Environment

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/zen-clock.git
cd zen-clock

# Install dependencies
npm install

# Create a branch for your work
git checkout -b feature/your-feature-name
```

---

## How to Contribute

### Types of Contributions We Welcome

1. **Bug Fixes**: Fix reported issues or bugs you discover
2. **New Features**: Add new functionality (please discuss first)
3. **Documentation**: Improve README, add comments, create tutorials
4. **Performance Improvements**: Optimize existing code
5. **UI/UX Improvements**: Enhance visual design or user experience
6. **Tests**: Add or improve test coverage
7. **Translations**: Translate documentation or UI text

### Not Sure Where to Start?

- Look for issues labeled `good first issue` or `help wanted`
- Check the [Project Roadmap](#roadmap)
- Improve documentation
- Fix typos or clarify confusing text

---

## Development Workflow

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/add-new-particle-effect

# Bug fix branch
git checkout -b fix/camera-permission-issue

# Documentation branch
git checkout -b docs/update-readme
```

### 2. Make Changes

Follow the coding standards and make focused, atomic commits.

### 3. Test Your Changes

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Test on different browsers if possible
```

### 4. Commit Your Changes

Follow the commit message guidelines (see below).

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Open a PR on GitHub with a clear description of your changes.

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types from `types.ts` when reusable

```typescript
// Good
interface ParticleConfig {
  x: number;
  y: number;
  speed: number;
}

// Avoid
interface ParticleConfig {
  x: any;
  y: any;
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use descriptive component names
- Add PropTypes or TypeScript types

```typescript
// Good
interface DigitalClockProps {
  time: TimeState;
  theme: ThemeConfig;
  showSeconds: boolean;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ time, theme, showSeconds }) => {
  // Component logic
};

// Component implementation
```

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles
- Use CSS modules for complex components if needed
- Follow existing design patterns

```tsx
// Good
<div className="flex items-center justify-center w-full h-screen bg-neutral-900">
  Content
</div>

// Avoid
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  Content
</div>
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `DigitalClock`)
- **Functions/Variables**: camelCase (e.g., `handleClick`, `timeState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `THEME_CONFIGS`)
- **Types/Interfaces**: PascalCase (e.g., `ClockMode`, `ThemeConfig`)

### Comments and Documentation

- Add JSDoc comments for complex functions
- Comment "why" not "what"
- Keep comments up-to-date
- Document public APIs

```typescript
/**
 * Generates a poetic reflection about time using AI
 * @param timeString - Current time in format "HH:MM AM/PM"
 * @param themeLabel - Selected theme name
 * @param config - AI provider configuration
 * @returns Promise resolving to bilingual reflection text
 */
export const generateTimeReflection = async (
  timeString: string,
  themeLabel: string,
  config?: AIConfig
): Promise<string> => {
  // Implementation
};
```

---

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes
- `perf`: Performance improvements

### Examples

```bash
# Feature
feat(particles): add snowflake particle effect

# Bug fix
fix(camera): resolve hand detection issue on Safari

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(ai): simplify provider selection logic

# Multiple scopes
feat(ui,particles): add settings for particle density
```

### Commit Best Practices

- Keep commits atomic (one logical change)
- Write clear, concise messages
- Use imperative mood in subject line ("add" not "added")
- Don't end subject line with period
- Reference issues in footer when applicable

---

## Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Verify feature works as expected
   - Test on multiple browsers
   - Check mobile responsiveness

2. **Update documentation**
   - Update README if adding features
   - Add inline comments for complex code
   - Update DEVELOPMENT.md if needed

3. **Clean up code**
   - Remove console.log statements
   - Remove unused imports
   - Format code consistently

### PR Template

When creating a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile

## Screenshots (if applicable)
Add screenshots of UI changes

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, PR will be merged
4. Congratulations! 🎉

---

## Issue Reporting

### Before Reporting

- Check if issue already exists
- Search closed issues for solutions
- Try basic troubleshooting steps

### Good Issue Reports

Include:
- **Clear title**: Descriptive and specific
- **Description**: What happened, what you expected
- **Steps to reproduce**: Numbered list
- **Environment**: OS, browser, Node version
- **Screenshots**: If applicable
- **Error messages**: From console

### Issue Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node: [e.g., v20.10.0]

**Additional context**
Any other relevant information
```

---

## Development Tips

### Debugging

- Use React DevTools for component inspection
- Check browser console for errors
- Use `console.trace()` for complex call stacks
- Test in multiple browsers

### Performance

- Profile with Chrome DevTools
- Monitor frame rates (target 60fps)
- Minimize re-renders with React.memo
- Lazy load heavy components

### Testing Checklist

Before submitting PR:
- [ ] Feature works as intended
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works in multiple browsers
- [ ] Documentation updated
- [ ] Code follows style guide

---

## Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes
- Project documentation

---

## Questions?

- Check existing [documentation](DEVELOPMENT.md)
- Search [GitHub Issues](https://github.com/yourusername/zen-clock/issues)
- Ask in discussions tab
- Contact maintainers

---

**Thank you for contributing to ZenClock! 🙏**

Your contributions help make this project better for everyone.
