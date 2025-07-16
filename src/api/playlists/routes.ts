import { Route, ApiRequest, ApiResponse } from '../types';
import { PlaylistService } from './service';
import { authMiddleware } from '../auth/middleware';

export class PlaylistRoutes {
  private playlistService: PlaylistService;

  constructor(playlistService: PlaylistService) {
    this.playlistService = playlistService;
  }

  getRoutes(): Route[] {
    return [
      {
        path: '/playlists',
        method: 'GET',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const playlists = await this.playlistService.getAllPlaylists();
            return {
              status: 200,
              body: { playlists }
            };
          } catch (error) {
            return {
              status: 500,
              body: { error: 'Failed to fetch playlists' }
            };
          }
        }
      },
      {
        path: '/playlists',
        method: 'POST',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const { name, description, tracks = [], isPublic = false } = request.body;
            const playlist = await this.playlistService.createPlaylist({
              name,
              description,
              tracks,
              isPublic,
              creator: request.user.id // Added by auth middleware
            });
            return {
              status: 201,
              body: { playlist }
            };
          } catch (error) {
            return {
              status: 400,
              body: { error: 'Failed to create playlist' }
            };
          }
        }
      },
      {
        path: '/playlists/:id',
        method: 'GET',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const playlistId = request.params.id;
            const playlist = await this.playlistService.getPlaylistById(playlistId);
            
            if (!playlist) {
              return {
                status: 404,
                body: { error: 'Playlist not found' }
              };
            }

            return {
              status: 200,
              body: { playlist }
            };
          } catch (error) {
            return {
              status: 500,
              body: { error: 'Failed to fetch playlist' }
            };
          }
        }
      },
      {
        path: '/playlists/:id',
        method: 'PUT',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const playlistId = request.params.id;
            const { name, description, isPublic } = request.body;
            
            const playlist = await this.playlistService.getPlaylistById(playlistId);
            if (!playlist) {
              return {
                status: 404,
                body: { error: 'Playlist not found' }
              };
            }

            // Check ownership
            if (playlist.creator !== request.user.id) {
              return {
                status: 403,
                body: { error: 'Not authorized to modify this playlist' }
              };
            }

            const updatedPlaylist = await this.playlistService.updatePlaylist(playlistId, {
              name,
              description,
              isPublic
            });

            return {
              status: 200,
              body: { playlist: updatedPlaylist }
            };
          } catch (error) {
            return {
              status: 400,
              body: { error: 'Failed to update playlist' }
            };
          }
        }
      },
      {
        path: '/playlists/:id',
        method: 'DELETE',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const playlistId = request.params.id;
            
            const playlist = await this.playlistService.getPlaylistById(playlistId);
            if (!playlist) {
              return {
                status: 404,
                body: { error: 'Playlist not found' }
              };
            }

            // Check ownership
            if (playlist.creator !== request.user.id) {
              return {
                status: 403,
                body: { error: 'Not authorized to delete this playlist' }
              };
            }

            await this.playlistService.deletePlaylist(playlistId);

            return {
              status: 204
            };
          } catch (error) {
            return {
              status: 500,
              body: { error: 'Failed to delete playlist' }
            };
          }
        }
      },
      {
        path: '/playlists/:id/tracks',
        method: 'POST',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const playlistId = request.params.id;
            const { trackId } = request.body;
            
            const playlist = await this.playlistService.getPlaylistById(playlistId);
            if (!playlist) {
              return {
                status: 404,
                body: { error: 'Playlist not found' }
              };
            }

            // Check ownership
            if (playlist.creator !== request.user.id) {
              return {
                status: 403,
                body: { error: 'Not authorized to modify this playlist' }
              };
            }

            const updatedPlaylist = await this.playlistService.addTrackToPlaylist(playlistId, trackId);

            return {
              status: 200,
              body: { playlist: updatedPlaylist }
            };
          } catch (error) {
            return {
              status: 400,
              body: { error: 'Failed to add track to playlist' }
            };
          }
        }
      },
      {
        path: '/playlists/:id/tracks/:trackId',
        method: 'DELETE',
        handler: async (request: ApiRequest): Promise\u003cApiResponse\u003e => {
          try {
            const { id: playlistId, trackId } = request.params;
            
            const playlist = await this.playlistService.getPlaylistById(playlistId);
            if (!playlist) {
              return {
                status: 404,
                body: { error: 'Playlist not found' }
              };
            }

            // Check ownership
            if (playlist.creator !== request.user.id) {
              return {
                status: 403,
                body: { error: 'Not authorized to modify this playlist' }
              };
            }

            const updatedPlaylist = await this.playlistService.removeTrackFromPlaylist(playlistId, trackId);

            return {
              status: 200,
              body: { playlist: updatedPlaylist }
            };
          } catch (error) {
            return {
              status: 400,
              body: { error: 'Failed to remove track from playlist' }
            };
          }
        }
      }
    ];
  }
}
