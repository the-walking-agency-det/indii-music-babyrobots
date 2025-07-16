from fastapi import APIRouter, Depends
from typing import List, Dict, Any
import yaml
import json
from pathlib import Path

router = APIRouter(prefix="/api/dev-progress", tags=["development"])

def read_markdown_file(file_path: str) -> str:
    with open(file_path, 'r') as f:
        return f.read()

@router.get("/status")
async def get_dev_status():
    """Get current development status from TREE_RING_PROGRESS.md"""
    progress_file = Path("docs/TREE_RING_PROGRESS.md")
    content = read_markdown_file(progress_file)
    
    # Parse the markdown content to extract status
    rings = []
    current_ring = None
    
    for line in content.split('\n'):
        if line.startswith('## Ring'):
            if 'Status:' in line:
                status = line.split('Status:')[1].strip()
                current_ring = {
                    'name': line.split('Status:')[0].replace('##', '').strip(),
                    'status': status,
                    'tasks': []
                }
                rings.append(current_ring)
        elif line.startswith('- [x]'):
            if current_ring:
                current_ring['tasks'].append({
                    'name': line.replace('- [x]', '').strip(),
                    'completed': True
                })
        elif line.startswith('- [ ]'):
            if current_ring:
                current_ring['tasks'].append({
                    'name': line.replace('- [ ]', '').strip(),
                    'completed': False
                })
    
    return {
        "rings": rings,
        "metrics": {
            "features_completed": len([t for r in rings for t in r['tasks'] if t['completed']]),
            "total_features": len([t for r in rings for t in r['tasks']]),
        }
    }

@router.get("/dependency-graphs")
async def get_dependency_graphs():
    """Get system dependency graphs from DEPENDENCY_GRAPH.md"""
    graph_file = Path("docs/DEPENDENCY_GRAPH.md")
    content = read_markdown_file(graph_file)
    
    # Extract mermaid diagrams
    graphs = {}
    current_section = None
    current_graph = []
    
    for line in content.split('\n'):
        if line.startswith('###'):
            if current_section and current_graph:
                graphs[current_section] = '\n'.join(current_graph)
            current_section = line.replace('###', '').strip()
            current_graph = []
        elif line.startswith('```mermaid'):
            continue
        elif line.startswith('```'):
            if current_section and current_graph:
                graphs[current_section] = '\n'.join(current_graph)
            current_graph = []
        elif current_section and line.strip():
            current_graph.append(line)
    
    return {"graphs": graphs}
