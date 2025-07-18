import { Pool } from 'pg';
import { config } from '../../src/config/test-db.config';

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'indii_music_test'
};

describe('Database Seed Data', () => {
    let pool: Pool;

    beforeAll(async () => {
        pool = new Pool(dbConfig);
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('Basic Data', () => {
        it('should have test users with correct roles', async () => {
            const { rows } = await pool.query(`
                SELECT u.email, u.profile_type, r.name as role_name
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                ORDER BY u.email
            `);

            expect(rows).toHaveLength(4);
            expect(rows).toContainEqual(
                expect.objectContaining({
email: 'test.admin@indii.music',
                    profile_type: 'service_provider',
                    profile_type: 'service_provider',
                    role_name: 'admin'
                })
            );
        });
    });

    describe('Music Content', () => {
        it('should have test tracks with proper metadata', async () => {
            const { rows } = await pool.query(`
                SELECT t.title, t.genre, t.duration, u.email as artist_email
                FROM tracks t
                JOIN users u ON t.artist_id = u.id
                ORDER BY t.created_at DESC
            `);

            expect(rows.length).toBeGreaterThan(0);
            expect(rows[0]).toMatchObject({
                title: expect.any(String),
                genre: expect.any(String),
                duration: expect.any(Number),
                artist_email: 'test.artist@indii.music'
            });
        });

        it('should have split sheets with correct percentages', async () => {
            const { rows } = await pool.query(`
                SELECT s.id, 
                       t.title as track_title,
                       SUM(sc.percentage) as total_percentage
                FROM split_sheets s
                JOIN tracks t ON s.track_id = t.id
                JOIN split_sheet_contributors sc ON s.id = sc.split_sheet_id
                GROUP BY s.id, t.title
            `);

            rows.forEach(row => {
                expect(row.total_percentage).toBe(100);
            });
        });
    });

    describe('Project Management', () => {
        it('should have project workspaces with associated tasks', async () => {
            const { rows } = await pool.query(`
                SELECT w.name as workspace_name,
                       COUNT(wt.id) as task_count,
                       SUM(CASE WHEN wt.is_completed THEN 1 ELSE 0 END) as completed_tasks
                FROM project_workspaces w
                LEFT JOIN workspace_tasks wt ON w.id = wt.workspace_id
                GROUP BY w.id, w.name
            `);

            expect(rows.length).toBeGreaterThan(0);
            rows.forEach(row => {
                expect(row.task_count).toBeGreaterThan(0);
                expect(row.completed_tasks).toBeLessThanOrEqual(row.task_count);
            });
        });
    });

    describe('Chat and Communication', () => {
        it('should have chat sessions with messages', async () => {
            const { rows } = await pool.query(`
                SELECT cs.role,
                       COUNT(cm.id) as message_count
                FROM chat_sessions cs
                LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
                GROUP BY cs.id, cs.role
            `);

            expect(rows.length).toBeGreaterThan(0);
            rows.forEach(row => {
                expect(row.message_count).toBeGreaterThan(0);
                expect(row.role).toBe('mastering');
            });
        });
    });
});
