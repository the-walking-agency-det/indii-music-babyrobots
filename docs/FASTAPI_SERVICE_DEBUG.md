# FastAPI Service Debug Report

## Current Status
The FastAPI service is failing to start due to Python module import issues.

## Expected Behavior
- FastAPI service should start successfully on port 8000
- Service should expose endpoints for track, metadata, and playlist management
- All Python modules should import correctly using the src package structure

## Current Issues
1. Module import errors when trying to import from models package
2. PYTHONPATH setting may not be correctly resolving the src directory
3. Relative vs absolute imports causing conflicts

## Attempted Solutions

### 1. Import Path Fixes
Modified import statements in:
- `src/services/metadata_service.py`:
  ```python
  # Before
  from models.metadata import MusicMetadata, AudioMetadata
  # After
  from src.models.metadata import MusicMetadata, AudioMetadata
  ```
- `src/services/track_service.py`:
  ```python
  # Before
  from models.track import Track
  # After
  from src.models.track import Track
  ```

### 2. PYTHONPATH Configuration
Attempted to set PYTHONPATH to the project root:
```bash
PYTHONPATH=/Volumes/X\ SSD\ 2025/Users/narrowchannel/Desktop/indii-music-babyrobots uvicorn src.main:app --reload --port 8000
```

## Project Structure
```
src/
├── __init__.py
├── main.py
├── models/
│   ├── __init__.py
│   ├── metadata.py
│   ├── track.py
│   └── user.py
├── routers/
│   ├── __init__.py
│   ├── track_router.py
│   └── metadata_router.py
└── services/
    ├── __init__.py
    ├── metadata_service.py
    └── track_service.py
```

## Required Components
1. Module Resolution
   - [ ] Fix Python package structure
   - [ ] Ensure all __init__.py files are properly configured
   - [ ] Standardize import approach (relative vs absolute)

2. Service Dependencies
   - [ ] Verify all required Python packages are installed
   - [ ] Check mutagen package installation for metadata handling
   - [ ] Ensure FastAPI and uvicorn are properly installed

3. Configuration
   - [ ] Review FastAPI app configuration in main.py
   - [ ] Verify router registration
   - [ ] Check environment variables and settings

## Next Steps

1. Create a proper Python package structure:
   ```bash
   pip install -e .
   ```

2. Add a setup.py or pyproject.toml to properly define the package:
   ```python
   from setuptools import setup, find_packages

   setup(
       name="indii-music-babyrobots",
       version="0.1",
       packages=find_packages(),
       install_requires=[
           "fastapi",
           "uvicorn",
           "mutagen",
       ],
   )
   ```

3. Standardize imports:
   - Use relative imports within the package
   - Use absolute imports for external dependencies
   - Update all service and router files accordingly

4. Fix module resolution:
   - Review and update all __init__.py files
   - Ensure proper module exports
   - Verify package namespace structure

## Additional Notes
- Current implementation uses in-memory storage (tracks_db dict)
- Future database integration planned
- Authentication and user management partially implemented
- API documentation needs to be generated once service is running

## Related Issues
- Import errors preventing service startup
- Module resolution issues with src package
- PYTHONPATH configuration may need adjustment
- Package structure needs standardization

## References
- FastAPI documentation on project structure
- Python packaging guide
- Previous successful implementations in the codebase

This report will be updated as progress is made on resolving these issues.
