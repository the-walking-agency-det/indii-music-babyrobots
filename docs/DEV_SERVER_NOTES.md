# Development Server Notes

## Port Configuration
- **Primary Development Port**: 9000
- **Always use port 9000** for consistency across the team
- Start server with: `npm run dev` (configured to use port 9000)

## Server Management
- To kill existing server: `lsof -ti:9000 | xargs kill -9`
- To restart: `npm run dev`
- Server URL: `http://localhost:9000`

## API Endpoints Structure
- Main app: `http://localhost:9000`
- API routes: `http://localhost:9000/api/*`
- Health check: `http://localhost:9000/api/health`
- Knowledge base: `http://localhost:9000/api/knowledge/music-industry`

## Development Workflow
1. Always check if port 9000 is free before starting
2. Use `npm run dev` to start the Next.js development server
3. All AI agents and API testing should use `localhost:9000`
4. Keep this port consistent for team development

## Troubleshooting
- If "address already in use" error: Kill the process and restart
- If APIs not working: Ensure you're hitting the correct Next.js server on 9000
- Check `package.json` scripts for current dev configuration

---
*Last updated: 2025-01-17*
