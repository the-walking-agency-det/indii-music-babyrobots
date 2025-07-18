import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dbConfig } from './test-db-config';

/**
 * Sets up a Supabase client for testing
 */
export async function setupSupabase() {
  const supabase = createClient(
    dbConfig.supabase.url!,
    dbConfig.supabase.key!,
    {
      db: {
        schema: dbConfig.supabase.options.schema
      }
    }
  );
  
  // Clean all tables in test schema
  await cleanTables(supabase);
  
  return supabase;
}

/**
 * Clean all tables in the test schema
 */
async function cleanTables(supabase: SupabaseClient) {
  const tables = ['tasks', 'agents', 'vector_documents', 'memories'];
  
  for (const table of tables) {
    await supabase.from(table).delete().neq('id', 0);
  }
}

/**
 * Tests for the Supabase setup utility
 */
if (process.env.NODE_ENV === 'test') {
  describe('Supabase Setup', () => {
    let supabase: SupabaseClient;

    beforeEach(async () => {
      supabase = await setupSupabase();
    });

    it('should create a working database connection', async () => {
      const { data, error } = await supabase
        .from('_schema')
        .select('version')
        .single();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should use the test schema', async () => {
      const { data, error } = await supabase
        .rpc('current_schema');
      
      expect(error).toBeNull();
      expect(data).toBe('test');
    });

    it('should start with empty tables', async () => {
      const tables = ['memories', 'vector_documents', 'agents', 'tasks'];
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        expect(error).toBeNull();
        expect(count).toBe(0);
      }
    });

    it('should enforce foreign key constraints', async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          id: 'test-task',
          agent_id: 'fake-agent',
          status: 'pending',
          data: {}
        });
      
      expect(error).toBeDefined();
      expect(error!.message).toContain('foreign key constraint');
    });

    it('should handle RLS policies', async () => {
      // First try without auth
      const { error: insertError } = await supabase
        .from('agents')
        .insert({
          name: 'test-agent',
          metadata: {},
          last_active: new Date()
        });
      
      expect(insertError).toBeDefined(); // Should fail due to RLS
      
      // Now try with service role (bypasses RLS)
      const adminClient = createClient(
        dbConfig.supabase.url!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error } = await adminClient
        .from('agents')
        .insert({
          name: 'test-agent',
          metadata: {},
          last_active: new Date()
        });
      
      expect(error).toBeNull();
    });

    it('should support real-time subscriptions', (done) => {
      const subscription = supabase
        .channel('test')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'test',
            table: 'agents'
          },
          (payload) => {
            expect(payload.new.name).toBe('test-agent');
            subscription.unsubscribe();
            done();
          }
        )
        .subscribe();
      
      // Insert test data
      supabase
        .from('agents')
        .insert({
          name: 'test-agent',
          metadata: {},
          last_active: new Date()
        });
    });
  });
}
