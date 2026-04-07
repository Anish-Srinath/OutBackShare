# CrisisLink - Development Guidelines

## Project Structure

```
CrisisLink/
├── Layer5-Data/          # Data & Database
├── Layer4-AI/            # ML Models
├── Layer3-Backend/       # API & Microservices
├── Layer2-Frontend/      # React Apps
├── docs/                 # Documentation
└── README.md
```

## Git Workflow

### Branch Naming Convention
```
feature/<feature-name>          # New feature
bugfix/<bug-description>        # Bug fixes
docs/<documentation-title>      # Documentation
refactor/<what-is-refactored>   # Code refactoring
```

### Commit Message Format
```
[Layer#] <component>: <Brief description>

Example:
[Layer3] listing-service: Add endpoint for creating listing
[Layer2] donor-app: Implement camera integration for food photo
[Layer4] image-recognition: Improve model inference speed
```

### Pull Request Process
1. Create feature branch from `main`
2. Make atomic commits
3. Push to GitHub
4. Create Pull Request with description of changes
5. At least one review approval before merge
6. Squash and merge to keep history clean

## Development Environment Setup

### Python Projects (Layer 3, 4, 5)
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Node.js Projects (Layer 2)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Code Standards

### Python
- PEP 8 style guide
- Type hints for function arguments and returns
- Docstrings for all public functions/classes
- Use `black` for code formatting

### JavaScript/React
- ESLint configuration enforced
- Functional components with hooks
- PropTypes or TypeScript for prop validation
- Clear component organization (pages/components/utils)

## Testing Guidelines

- Write tests for new features before merging
- Maintain >80% code coverage for critical paths
- Integration tests for microservice interactions

## Documentation

- Update `docs/` folder when making architectural changes
- Add README files to new directories
- Include setup instructions for new dependencies

---

**Last Updated**: April 2026
