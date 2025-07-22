from pathlib import Path
import json
import os
import subprocess
from datetime import datetime
from typing import Dict, List, Optional

class ProjectDetector:
    """Auto-detects project type and suggests appropriate configuration"""
    
    @staticmethod
    def detect_project_type(repo_path: Path) -> Dict[str, any]:
        """Detects project characteristics with confidence scoring"""
        detections = {
            "type": "unknown",
            "languages": {},
            "frameworks": {},
            "has_tests": False,
            "has_docs": False,
            "has_ci": False,
            "vcs": None,
            "confidence": 0.0
        }

        confidence_points = 0

        # Check for language indicators
        if (repo_path / "package.json").exists():
            detections["languages"]["javascript"] = 0.8
            confidence_points += 2
            try:
                with open(repo_path / "package.json") as f:
                    pkg = json.load(f)
                    deps = list(pkg.get("dependencies", {}).keys()) + list(pkg.get("devDependencies", {}).keys())
                    if "react" in deps:
                        detections["frameworks"]["react"] = 0.9
                        confidence_points += 3
                    if "playwright" in deps:
                        detections["has_tests"] = True
                        confidence_points += 1
            except: pass

        if (repo_path / "requirements.txt").exists() or (repo_path / "pyproject.toml").exists():
            detections["languages"]["python"] = 0.8
            confidence_points += 2
            
            # Check requirements.txt first
            if (repo_path / "requirements.txt").exists():
                try:
                    with open(repo_path / "requirements.txt") as f:
                        reqs = f.read().lower()
                        if "fastapi" in reqs:
                            detections["frameworks"]["fastapi"] = 0.9
                            confidence_points += 3
                        if "pytest" in reqs:
                            detections["has_tests"] = True
                            confidence_points += 1
                except: pass
            
            # Also check pyproject.toml if it exists
            if (repo_path / "pyproject.toml").exists():
                try:
                    import tomllib
                    with open(repo_path / "pyproject.toml", "rb") as f:
                        data = tomllib.load(f)
                        deps = data.get("project", {}).get("dependencies", [])
                        if any("fastapi" in str(d).lower() for d in deps):
                            detections["frameworks"]["fastapi"] = 0.9
                            confidence_points += 3
                        if any("pytest" in str(d).lower() for d in deps):
                            detections["has_tests"] = True
                            confidence_points += 1
                except: pass
            
            # Check for imports in Python files
            try:
                for py_file in repo_path.glob("**/*.py"):
                    with open(py_file) as f:
                        content = f.read().lower()
                        if "import fastapi" in content or "from fastapi import" in content:
                            detections["frameworks"]["fastapi"] = 0.9
                            confidence_points += 3
                        if "import pytest" in content or "from pytest import" in content:
                            detections["has_tests"] = True
                            confidence_points += 1
            except: pass

        # Determine primary type
        if "react" in detections["frameworks"]:
            detections["type"] = "frontend"
            confidence_points += 2
        elif "fastapi" in detections["frameworks"]:
            detections["type"] = "backend"
            confidence_points += 2
        elif detections["languages"]:
            detections["type"] = list(detections["languages"].keys())[0]

        # Calculate confidence score (simple scale)
        detections["confidence"] = min(1.0, confidence_points / 10.0)

        return detections

def get_customized_config(repo_path: Path, custom_overrides: Optional[Dict] = None) -> Dict:
    """Generate customized configuration based on project type"""
    detector = ProjectDetector()
    project_info = detector.detect_project_type(repo_path)
    
    # Base configuration
    config = {
        "repo_path": str(repo_path),
        "project_name": repo_path.name,
        "knowledge_base": "universal",
        "sync_enabled": True,
        "project_info": project_info,
        "monitors": ["tasks", "rules", "context", "dependencies"],
        "custom_rules": {},
        "integrations": [],
        "automated_tasks": []
    }
    
    # Customize based on project type
    if project_info["type"] == "frontend":
        config["monitors"].extend(["components", "styles", "state_management"])
        config["custom_rules"]["component_patterns"] = "functional_components_only"
        config["integrations"].append("react_devtools")
        
    elif project_info["type"] == "backend":
        config["monitors"].extend(["api_endpoints", "database_schema", "security"])
        config["custom_rules"]["api_patterns"] = "restful_conventions"
        config["integrations"].append("openapi_spec")
        
    if project_info["has_tests"]:
        config["monitors"].append("test_coverage")
        config["automated_tasks"].append("run_tests_on_sync")
        
    if project_info["vcs"] == "git":
        config["integrations"].append("git_hooks")
        
    # Apply custom overrides
    if custom_overrides:
        config.update(custom_overrides)
        
    return config

def setup_third_eye(repo_path: str, custom_config: Optional[Dict] = None, interactive: bool = True):
    """Sets up third eye monitoring and knowledge sync with auto-detection"""
    repo_path = Path(repo_path)

    # Get customized configuration
    config = get_customized_config(repo_path, custom_config)

    if interactive:
        print(f"👀 I've analyzed the project at '{repo_path.name}'.")
        detected_type = config.get("project_info", {}).get("type", "unknown")
        confidence = config.get("project_info", {}).get("confidence", 0.0) * 100
        print(f"   I believe this is a '{detected_type}' project (Confidence: {confidence:.0f}%).")
        
        user_input = input("   Is this correct? (Y/n) ")
        if user_input.lower() == 'n':
            print("Aborting setup. Please provide a custom configuration to override detection.")
            return None
    
    # Create necessary directories
    knowledge_dir = repo_path / "knowledge"
    monitors_dir = knowledge_dir / "monitors"
    rules_dir = knowledge_dir / "rules"
    templates_dir = knowledge_dir / "templates"
    
    for dir_path in [monitors_dir, rules_dir, templates_dir]:
        dir_path.mkdir(parents=True, exist_ok=True)
    
    # Write main config
    with open(knowledge_dir / "config.json", "w") as f:
        json.dump(config, f, indent=2)
        
    # Create monitor-specific configs
    for monitor in config["monitors"]:
        monitor_config = {
            "name": monitor,
            "enabled": True,
            "frequency": "on_change",
            "rules": config.get("custom_rules", {})
        }
        with open(monitors_dir / f"{monitor}.json", "w") as f:
            json.dump(monitor_config, f, indent=2)
    
    # Create git hooks if applicable
    if config["project_info"]["vcs"] == "git" and "git_hooks" in config["integrations"]:
        hooks_dir = repo_path / ".git" / "hooks"
        if hooks_dir.exists():
            pre_commit = hooks_dir / "pre-commit"
            pre_commit.write_text(
                "#!/bin/sh\n"
                "# Knowledge sync pre-commit hook\n"
                f"python -m knowledge_reinforcer_system.knowledge_sync . {config['knowledge_base']}\n"
            )
            pre_commit.chmod(0o755)
            
    # Create initial rules based on project type
    initial_rules = {
        "project_type": config["project_info"]["type"],
        "languages": config["project_info"]["languages"],
        "frameworks": config["project_info"]["frameworks"],
        "custom_patterns": config.get("custom_rules", {}),
        "created_at": datetime.now().isoformat()
    }
    
    with open(rules_dir / "project_rules.json", "w") as f:
        json.dump(initial_rules, f, indent=2)
        
    print(f"✅ Third Eye setup complete for {config['project_name']}")
    print(f"   Project type: {config['project_info']['type']}")
    print(f"   Monitors enabled: {', '.join(config['monitors'])}")
    print(f"   Integrations: {', '.join(config['integrations'])}")
    
    return config
