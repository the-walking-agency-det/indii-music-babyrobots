#!/usr/bin/env python3
"""
Universal Knowledge Capture - Turn discoveries into distributable wisdom
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List
import hashlib
import re

class KnowledgeCapture:
    """Captures and synthesizes knowledge from various sources"""
    
    def __init__(self, universal_repo_path: str = None):
        # Find or set universal knowledge repo
        if universal_repo_path:
            self.universal_repo = Path(universal_repo_path)
        else:
            # Look for it on desktop or in known locations
            desktop = Path.home() / "Desktop"
            candidates = [
                desktop / "universal-knowledge-repo",
                desktop / "universal_knowledge_repo",
                Path.home() / "universal-knowledge-repo"
            ]
            for candidate in candidates:
                if candidate.exists():
                    self.universal_repo = candidate
                    break
            else:
                # Create it if not found
                self.universal_repo = desktop / "universal-knowledge-repo"
                self.universal_repo.mkdir(exist_ok=True)
                
        self.knowledge_dir = self.universal_repo / "knowledge"
        self.discoveries_dir = self.knowledge_dir / "discoveries"
        self.rules_dir = self.knowledge_dir / "rules"
        self.insights_dir = self.knowledge_dir / "insights"
        
        # Ensure all directories exist
        for dir_path in [self.discoveries_dir, self.rules_dir, self.insights_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
            
    def capture_discovery(self, 
                         title: str,
                         content: str,
                         source_type: str = "conversation",
                         tags: List[str] = None,
                         languages: List[str] = None,
                         frameworks: List[str] = None,
                         project_types: List[str] = None) -> Dict[str, Any]:
        """Capture a new discovery or insight"""
        
        # Input validation
        if not title or not isinstance(title, str) or title.isspace():
            raise ValueError("Title must be a non-empty string")
            
        if not content or not isinstance(content, str) or content.isspace():
            raise ValueError("Content must be a non-empty string")
            
        if not isinstance(source_type, str) or source_type.isspace():
            raise ValueError("Source type must be a non-empty string")
            
        # Validate list inputs
        for list_name, list_val in [
            ("tags", tags),
            ("languages", languages),
            ("frameworks", frameworks),
            ("project_types", project_types)
        ]:
            if list_val is not None:
                if not isinstance(list_val, list):
                    raise ValueError(f"{list_name} must be a list")
                if any(not isinstance(item, str) or item.isspace() for item in list_val):
                    raise ValueError(f"All {list_name} must be non-empty strings")
        
        # Generate unique ID
        content_hash = hashlib.sha256(f"{title}{content}".encode()).hexdigest()[:8]
        discovery_id = f"discovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{content_hash}"
        
        # Synthesize and enhance the content
        enhanced_content = self._enhance_content(content, source_type)
        
        # Extract keywords automatically
        auto_tags = self._extract_keywords(content)
        all_tags = list(set((tags or []) + auto_tags))
        
        # Create discovery object
        discovery = {
            "id": discovery_id,
            "title": title,
            "original_content": content,
            "enhanced_content": enhanced_content,
            "source_type": source_type,
            "captured_at": datetime.now().isoformat(),
            "tags": all_tags,
            "languages": languages or [],
            "frameworks": frameworks or [],
            "project_types": project_types or [],
            "universal": not bool(languages or frameworks or project_types),
            "metadata": {
                "char_count": len(content),
                "word_count": len(content.split()),
                "has_code": self._has_code(content),
                "has_links": bool(re.findall(r'https?://\S+', content))
            }
        }
        
        # Save discovery
        discovery_file = self.discoveries_dir / f"{discovery_id}.json"
        with open(discovery_file, "w") as f:
            json.dump(discovery, f, indent=2)
            
        # Also create a rule if it's actionable
        if self._is_actionable(enhanced_content):
            self._create_rule_from_discovery(discovery)
            
        print(f"✨ Knowledge captured: {title}")
        print(f"   ID: {discovery_id}")
        print(f"   Tags: {', '.join(all_tags)}")
        print(f"   Universal: {'Yes' if discovery['universal'] else 'No'}")
        
        return discovery
        
    def _enhance_content(self, content: str, source_type: str) -> str:
        """Enhance content with structure and clarity"""
        enhanced = []
        
        # Add header based on source type
        if source_type == "error":
            enhanced.append("## Error Resolution")
            enhanced.append("\n### Problem")
            # Extract error message if present
            error_pattern = r'(Error|Exception|Failed|error|exception).*'
            errors = re.findall(error_pattern, content)
            if errors:
                enhanced.append(f"```\n{errors[0]}\n```")
                
        elif source_type == "article":
            enhanced.append("## Key Insights")
            
        elif source_type == "video":
            enhanced.append("## Video Summary")
            
        # Add main content
        enhanced.append("\n### Details")
        enhanced.append(content)
        
        # Add actionable items if detected
        if "should" in content.lower() or "must" in content.lower() or "need to" in content.lower():
            enhanced.append("\n### Action Items")
            actions = re.findall(r'(?:should|must|need to)\s+([^.!?]+)[.!?]', content, re.IGNORECASE)
            for action in actions[:5]:  # Limit to 5 actions
                enhanced.append(f"- {action.strip()}")
                
        # Add implementation hints if code-related
        if self._has_code(content):
            enhanced.append("\n### Implementation Notes")
            enhanced.append("- Review code snippets for language-specific syntax")
            enhanced.append("- Test in isolated environment first")
            enhanced.append("- Consider security implications")
            
        return "\n".join(enhanced)
        
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract relevant keywords from content"""
        keywords = []
        
        # Technology keywords
        tech_patterns = [
            r'\b(python|javascript|typescript|react|fastapi|django|node|npm|pip)\b',
            r'\b(docker|kubernetes|aws|gcp|azure)\b',
            r'\b(git|github|gitlab|ci|cd|devops)\b',
            r'\b(api|rest|graphql|websocket|http)\b',
            r'\b(database|sql|nosql|postgres|mongodb|redis)\b',
            r'\b(ai|ml|llm|gpt|claude|gemini)\b',
            r'\b(security|auth|oauth|jwt|encryption)\b',
            r'\b(test|testing|pytest|jest|playwright)\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, content.lower())
            keywords.extend(matches)
            
        # Concept keywords
        if "error" in content.lower() or "exception" in content.lower():
            keywords.append("debugging")
        if "performance" in content.lower():
            keywords.append("optimization")
        if "design" in content.lower() or "pattern" in content.lower():
            keywords.append("architecture")
            
        return list(set(keywords))
        
    def _has_code(self, content: str) -> bool:
        """Check if content contains code snippets"""
        code_indicators = [
            r'```',  # Markdown code blocks
            r'def\s+\w+\s*\(',  # Python functions
            r'function\s+\w+\s*\(',  # JavaScript functions
            r'class\s+\w+',  # Class definitions
            r'import\s+',  # Import statements
            r'from\s+\w+\s+import',  # Python imports
            r'const\s+\w+\s*=',  # Const declarations
            r'let\s+\w+\s*=',  # Let declarations
        ]
        
        for pattern in code_indicators:
            if re.search(pattern, content):
                return True
        return False
        
    def _is_actionable(self, content: str) -> bool:
        """Determine if content contains actionable rules"""
        actionable_indicators = [
            "should", "must", "always", "never", "ensure",
            "implement", "use", "avoid", "prefer", "require"
        ]
        
        content_lower = content.lower()
        return any(indicator in content_lower for indicator in actionable_indicators)
        
    def _create_rule_from_discovery(self, discovery: Dict[str, Any]):
        """Create a rule file from actionable discovery"""
        rule = {
            "id": f"rule_{discovery['id']}",
            "title": discovery['title'],
            "content": discovery['enhanced_content'],
            "source_discovery": discovery['id'],
            "created_at": discovery['captured_at'],
            "tags": discovery['tags'],
            "languages": discovery['languages'],
            "frameworks": discovery['frameworks'],
            "project_types": discovery['project_types'],
            "universal": discovery['universal']
        }
        
        rule_file = self.rules_dir / f"{rule['id']}.json"
        with open(rule_file, "w") as f:
            json.dump(rule, f, indent=2)
            
    def sync_with_universe(self, project_path: str, force_refresh: bool = False) -> Dict[str, Any]:
        """Sync a project with universal knowledge"""
        from knowledge_sync import SmartKnowledgeSync
        from third_eye_setup import ProjectDetector
        
        print(f"🌌 Syncing with the universe...")
        
        # Check if project has evolved since last sync
        project_path = Path(project_path)
        knowledge_dir = project_path / "knowledge"
        config_path = knowledge_dir / "config.json"
        
        # Detect current project state
        detector = ProjectDetector()
        current_project_info = detector.detect_project_type(project_path)
        
        # Load existing config
        needs_rescan = False
        if config_path.exists():
            with open(config_path) as f:
                saved_config = json.load(f)
                saved_project_info = saved_config.get("project_info", {})
                
            # Check if project has evolved
            if (saved_project_info.get("languages", []) != current_project_info["languages"] or
                saved_project_info.get("frameworks", []) != current_project_info["frameworks"] or
                saved_project_info.get("has_tests") != current_project_info["has_tests"]):
                needs_rescan = True
                print("🔄 Project has evolved! Updating configuration...")
                
                # Update config with new project info
                saved_config["project_info"] = current_project_info
                saved_config["last_evolution"] = datetime.now().isoformat()
                
                with open(config_path, "w") as f:
                    json.dump(saved_config, f, indent=2)
        else:
            # First time setup
            from third_eye_setup import setup_third_eye
            print("🆕 First time sync - setting up knowledge system...")
            setup_third_eye(str(project_path))
            needs_rescan = True
            
        # Use our enhanced sync
        syncer = SmartKnowledgeSync(self.universal_repo, project_path)
        report = syncer.sync()
        
        # Load updated config
        with open(config_path) as f:
            project_config = json.load(f)
            
        # Find relevant discoveries (including newly relevant ones)
        all_discoveries = self._find_relevant_discoveries(project_config)
        
        # Check sync history to find truly new discoveries
        sync_history_file = knowledge_dir / "sync_history.json"
        if sync_history_file.exists():
            with open(sync_history_file) as f:
                sync_history = json.load(f)
                last_sync = sync_history.get("last_sync_date")
                seen_discoveries = set(sync_history.get("seen_discoveries", []))
        else:
            sync_history = {"sync_dates": [], "seen_discoveries": []}
            seen_discoveries = set()
            last_sync = None
            
        # Find discoveries that are either:
        # 1. Newly created since last sync
        # 2. Newly relevant due to project evolution
        new_discoveries = []
        newly_relevant = []
        
        for discovery in all_discoveries:
            if discovery["id"] not in seen_discoveries:
                if needs_rescan or force_refresh:
                    # Check if it's newly relevant vs truly new
                    discovery_date = datetime.fromisoformat(discovery["captured_at"])
                    if last_sync and discovery_date < datetime.fromisoformat(last_sync):
                        newly_relevant.append(discovery)
                    else:
                        new_discoveries.append(discovery)
                else:
                    new_discoveries.append(discovery)
                    
        # Update sync history
        all_seen = list(seen_discoveries)
        all_seen.extend([d["id"] for d in new_discoveries + newly_relevant])
        
        sync_history["last_sync_date"] = datetime.now().isoformat()
        sync_history["seen_discoveries"] = all_seen
        sync_history["sync_dates"].append({
            "date": datetime.now().isoformat(),
            "new_count": len(new_discoveries),
            "newly_relevant_count": len(newly_relevant),
            "project_evolved": needs_rescan
        })
        
        with open(sync_history_file, "w") as f:
            json.dump(sync_history, f, indent=2)
            
        # Report findings
        if new_discoveries:
            print(f"\n🎉 Found {len(new_discoveries)} new discoveries!")
            for discovery in new_discoveries[:3]:
                print(f"   - {discovery['title']}")
                
        if newly_relevant:
            print(f"\n🔮 Found {len(newly_relevant)} discoveries now relevant to your evolved project!")
            for discovery in newly_relevant[:3]:
                print(f"   - {discovery['title']} (became relevant due to: {discovery.get('frameworks', discovery.get('languages', []))})") 
                
        if not new_discoveries and not newly_relevant:
            print("\n✅ You're up to date with the universe!")
            
        # Check if it's been a while since last sync
        if last_sync:
            days_since_sync = (datetime.now() - datetime.fromisoformat(last_sync)).days
            if days_since_sync > 7:
                print(f"\n💡 Tip: It's been {days_since_sync} days since your last sync. Consider setting up automated sync!")
                
        return report
        
    def _find_relevant_discoveries(self, project_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find discoveries relevant to a project"""
        project_info = project_config.get("project_info", {})
        project_languages = set(project_info.get("languages", []))
        project_frameworks = set(project_info.get("frameworks", []))
        project_type = project_info.get("type", "unknown")
        
        relevant = []
        
        for discovery_file in self.discoveries_dir.glob("*.json"):
            with open(discovery_file) as f:
                discovery = json.load(f)
                
            # Universal discoveries are always relevant
            if discovery.get("universal", False):
                relevant.append(discovery)
                continue
                
            # Check language match
            disc_languages = set(discovery.get("languages", []))
            if disc_languages and disc_languages.intersection(project_languages):
                relevant.append(discovery)
                continue
                
            # Check framework match
            disc_frameworks = set(discovery.get("frameworks", []))
            if disc_frameworks and disc_frameworks.intersection(project_frameworks):
                relevant.append(discovery)
                continue
                
            # Check project type match
            disc_types = discovery.get("project_types", [])
            if disc_types and project_type in disc_types:
                relevant.append(discovery)
                
        # Sort by most recent
        relevant.sort(key=lambda x: x['captured_at'], reverse=True)
        
        return relevant


# Quick capture function for easy use
def capture(title: str, content: str, **kwargs):
    """Quick function to capture knowledge"""
    kc = KnowledgeCapture()
    return kc.capture_discovery(title, content, **kwargs)

def sync_universe(project_path: str = "."):
    """Quick function to sync with universe"""
    kc = KnowledgeCapture()
    return kc.sync_with_universe(project_path)
