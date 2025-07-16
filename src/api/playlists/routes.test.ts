import { PlaylistRoutes } from './routes';
import { PlaylistService } from './service';
import { ApiRequest } from '../types';

// Mock the playlist service
jest.mock('./service');

describe('PlaylistRoutes', () => {
  let playlistRoutes: PlaylistRoutes;
  let mockPlaylistService: jest.Mocked<PlaylistService>;
  
  const mockUser = {
    id: 'user123',
    name: 'Test User'
  };

  const mockPlaylist = {
    id: 'playlist123',
    name: 'My Test Playlist',
    description: 'A playlist for testing',
    creator: mockUser.id,
    tracks: [],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockPlaylistService = new PlaylistService() as jest.Mocked<PlaylistService>;
    playlistRoutes = new PlaylistRoutes(mockPlaylistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /playlists', () => {
    it('should return all playlists', async () => {
      const mockPlaylists = [mockPlaylist];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      const request: ApiRequest = {
        path: '/playlists',
        method: 'GET',
        headers: {},
        user: mockUser
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists' && r.method === 'GET')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ playlists: mockPlaylists });
      expect(mockPlaylistService.getAllPlaylists).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockPlaylistService.getAllPlaylists.mockRejectedValue(new Error('Database error'));

      const request: ApiRequest = {
        path: '/playlists',
        method: 'GET',
        headers: {},
        user: mockUser
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists' && r.method === 'GET')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch playlists' });
    });
  });

  describe('POST /playlists', () => {
    it('should create a new playlist', async () => {
      const newPlaylist = {
        name: 'New Playlist',
        description: 'A new test playlist',
        isPublic: false
      };

      mockPlaylistService.createPlaylist.mockResolvedValue({
        ...mockPlaylist,
        ...newPlaylist
      });

      const request: ApiRequest = {
        path: '/playlists',
        method: 'POST',
        headers: {},
        user: mockUser,
        body: newPlaylist
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists' && r.method === 'POST')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(201);
      expect(response.body.playlist).toMatchObject(newPlaylist);
      expect(mockPlaylistService.createPlaylist).toHaveBeenCalledWith({
        ...newPlaylist,
        creator: mockUser.id,
        tracks: []
      });
    });

    it('should handle validation errors', async () => {
      mockPlaylistService.createPlaylist.mockRejectedValue(new Error('Invalid playlist data'));

      const request: ApiRequest = {
        path: '/playlists',
        method: 'POST',
        headers: {},
        user: mockUser,
        body: {}
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists' && r.method === 'POST')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Failed to create playlist' });
    });
  });

  describe('GET /playlists/:id', () => {
    it('should return a specific playlist', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue(mockPlaylist);

      const request: ApiRequest = {
        path: '/playlists/playlist123',
        method: 'GET',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'GET')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ playlist: mockPlaylist });
      expect(mockPlaylistService.getPlaylistById).toHaveBeenCalledWith('playlist123');
    });

    it('should return 404 for non-existent playlist', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue(null);

      const request: ApiRequest = {
        path: '/playlists/nonexistent',
        method: 'GET',
        headers: {},
        user: mockUser,
        params: { id: 'nonexistent' }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'GET')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Playlist not found' });
    });
  });

  describe('PUT /playlists/:id', () => {
    const updateData = {
      name: 'Updated Playlist',
      description: 'Updated description',
      isPublic: true
    };

    it('should update a playlist when user is owner', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue(mockPlaylist);
      mockPlaylistService.updatePlaylist.mockResolvedValue({
        ...mockPlaylist,
        ...updateData
      });

      const request: ApiRequest = {
        path: '/playlists/playlist123',
        method: 'PUT',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' },
        body: updateData
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'PUT')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(response.body.playlist).toMatchObject(updateData);
      expect(mockPlaylistService.updatePlaylist).toHaveBeenCalledWith('playlist123', updateData);
    });

    it('should return 403 when user is not owner', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue({
        ...mockPlaylist,
        creator: 'otherUser123'
      });

      const request: ApiRequest = {
        path: '/playlists/playlist123',
        method: 'PUT',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' },
        body: updateData
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'PUT')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Not authorized to modify this playlist' });
      expect(mockPlaylistService.updatePlaylist).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /playlists/:id', () => {
    it('should delete a playlist when user is owner', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue(mockPlaylist);
      mockPlaylistService.deletePlaylist.mockResolvedValue(undefined);

      const request: ApiRequest = {
        path: '/playlists/playlist123',
        method: 'DELETE',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'DELETE')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(204);
      expect(mockPlaylistService.deletePlaylist).toHaveBeenCalledWith('playlist123');
    });

    it('should return 403 when user is not owner', async () => {
      mockPlaylistService.getPlaylistById.mockResolvedValue({
        ...mockPlaylist,
        creator: 'otherUser123'
      });

      const request: ApiRequest = {
        path: '/playlists/playlist123',
        method: 'DELETE',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id' && r.method === 'DELETE')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Not authorized to delete this playlist' });
      expect(mockPlaylistService.deletePlaylist).not.toHaveBeenCalled();
    });
  });

  describe('POST /playlists/:id/tracks', () => {
    it('should add a track to playlist when user is owner', async () => {
      const trackId = 'track123';
      mockPlaylistService.getPlaylistById.mockResolvedValue(mockPlaylist);
      mockPlaylistService.addTrackToPlaylist.mockResolvedValue({
        ...mockPlaylist,
        tracks: [trackId]
      });

      const request: ApiRequest = {
        path: '/playlists/playlist123/tracks',
        method: 'POST',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123' },
        body: { trackId }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id/tracks' && r.method === 'POST')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(response.body.playlist.tracks).toContain(trackId);
      expect(mockPlaylistService.addTrackToPlaylist).toHaveBeenCalledWith('playlist123', trackId);
    });
  });

  describe('DELETE /playlists/:id/tracks/:trackId', () => {
    it('should remove a track from playlist when user is owner', async () => {
      const trackId = 'track123';
      mockPlaylistService.getPlaylistById.mockResolvedValue({
        ...mockPlaylist,
        tracks: [trackId]
      });
      mockPlaylistService.removeTrackFromPlaylist.mockResolvedValue({
        ...mockPlaylist,
        tracks: []
      });

      const request: ApiRequest = {
        path: '/playlists/playlist123/tracks/track123',
        method: 'DELETE',
        headers: {},
        user: mockUser,
        params: { id: 'playlist123', trackId }
      };

      const routes = playlistRoutes.getRoutes();
      const handler = routes.find(r => r.path === '/playlists/:id/tracks/:trackId' && r.method === 'DELETE')?.handler;
      
      if (!handler) {
        throw new Error('Route handler not found');
      }

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(response.body.playlist.tracks).toHaveLength(0);
      expect(mockPlaylistService.removeTrackFromPlaylist).toHaveBeenCalledWith('playlist123', trackId);
    });
  });
});
