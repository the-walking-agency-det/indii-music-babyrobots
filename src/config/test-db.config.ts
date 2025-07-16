export const config = {
    development: {
        connection: {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'postgres',
            database: 'indii_music_test'
        },
        migrations: {
            directory: 'supabase/migrations'
        },
        seeds: {
            directory: 'supabase/seeds'
        }
    }
};
