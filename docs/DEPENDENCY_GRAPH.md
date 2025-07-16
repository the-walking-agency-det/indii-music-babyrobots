# System Dependency Graph

## Backend Dependencies

### Data Models
```mermaid
graph TD
    Track[Track Model]
    Playlist[Playlist Model]
    User[User Model]
    Metadata[Metadata Model]
    
    Track --> Metadata
    Playlist --> Track
    Playlist --> User
```

### Services Layer
```mermaid
graph TD
    TrackService[Track Service]
    PlaylistService[Playlist Service]
    UserService[User Service]
    MetadataService[Metadata Service]
    
    TrackService --> MetadataService
    PlaylistService --> TrackService
    PlaylistService --> UserService
```

### API Routes
```mermaid
graph TD
    AuthRouter[Auth Router]
    PlaylistRouter[Playlist Router]
    TrackRouter[Track Router]
    MetadataRouter[Metadata Router]
    HealthRouter[Health Router]
    MetricsRouter[Metrics Router]
    
    AuthRouter --> UserService
    PlaylistRouter --> PlaylistService
    TrackRouter --> TrackService
    MetadataRouter --> MetadataService
```

## Frontend Dependencies

### Component Tree
```mermaid
graph TD
    Dashboard[IndiiMusicDashboard]
    TopNav[TopNavigation]
    Sidebar[Sidebar]
    Content[MainContent]
    
    Dashboard --> TopNav
    Dashboard --> Sidebar
    Dashboard --> Content
    
    Content --> AudioPlayer
    Content --> PlaylistView
    Content --> TrackList
    Content --> ArtCreation
```

### UI Components
```mermaid
graph TD
    Button[Button]
    Card[Card]
    Input[Input]
    Select[Select]
    Progress[Progress]
    
    AudioPlayer --> Button
    PlaylistView --> Card
    TrackList --> Progress
    ArtCreation --> Input
```

### State Management
```mermaid
graph TD
    AuthContext[AuthContext]
    ThemeContext[ThemeContext]
    
    Dashboard --> AuthContext
    Dashboard --> ThemeContext
    TopNav --> AuthContext
    Sidebar --> ThemeContext
```

## Database Schema
```mermaid
graph TD
    Users[(Users)]
    Tracks[(Tracks)]
    Playlists[(Playlists)]
    Metadata[(Metadata)]
    
    Playlists --> Users
    Playlists --> Tracks
    Tracks --> Metadata
```
