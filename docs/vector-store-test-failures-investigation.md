# VectorStore Test Failures Investigation & Recovery Guide

**Date**: 2025-07-18  
**Issue**: VectorStore tests failing with `SQLITE_MISMATCH: datatype mismatch` errors  
**Status**: Investigation complete, fixes pending

## Summary of the Problem

The VectorStore class, which manages documents with a vector-like database adapter interface, is experiencing test failures due to SQLite datatype mismatches. This occurred after implementing relevance scoring enhancements to the search functionality.

## What Was Done

### 1. Enhanced VectorStore Search Functionality
- Added relevance scoring based on word matches
- Implemented query splitting into individual words
- Created a scoring system using `CASE WHEN` statements
- Modified ordering to prioritize relevance score, then timestamp

### 2. Code Changes Made
```typescript
// In vector-store.ts search method:
const searchWords = query.toLowerCase().split(/\s+/);
const searchScores = searchWords
  .map(word => `(CASE WHEN LOWER(content) LIKE ? THEN 1 ELSE 0 END)`)
  .join(' + ');

// SQL query with relevance scoring
`SELECT id, content, metadata
 FROM vector_documents
 WHERE namespace = ?
 AND (${searchWords.map(() => 'LOWER(content) LIKE ?').join(' OR ')}) ${filterClause}
 ORDER BY (${searchScores}) DESC, timestamp DESC
 LIMIT ?`
```

### 3. Validation Added
- Document content must be non-empty string
- Metadata must be an object
- No undefined values allowed in metadata

## Root Cause Analysis

### The SQLite Datatype Mismatch Issue

The error `SQLITE_MISMATCH: datatype mismatch` is occurring because:

1. **Parameter Binding Mismatch**: The SQL query is constructing parameters in a specific order, but they're being bound incorrectly.

2. **Parameter Array Construction**: The current implementation builds the params array like this:
   ```typescript
   const params: any[] = [this.namespace];
   params.push(...searchWords.map(word => `%${word}%`));
   // ... filter params added here ...
   // Then in the query call:
   [...params, limit]
   ```

3. **The Problem**: The CASE WHEN statements in the ORDER BY clause are expecting the same search parameters again, but they're not being provided. The SQLite query has:
   - Namespace parameter (1x)
   - Search words for WHERE clause (N times)
   - Filter parameters (if any)
   - Search words AGAIN for ORDER BY scoring (N times)
   - Limit parameter (1x)

## What Was Tried

1. **Initial Implementation**: Added relevance scoring with CASE WHEN statements
2. **Test Execution**: Ran `npx vitest run` which revealed the datatype mismatch errors
3. **Investigation**: Analyzed the SQL query structure and parameter binding

## What Wasn't Tried Yet

1. **Fix Parameter Array**: The parameters need to be duplicated for the ORDER BY clause
2. **Alternative Scoring Methods**: Using a simpler scoring approach
3. **SQL Function Creation**: Creating a custom SQLite function for scoring
4. **Different Database Testing**: Testing with PostgreSQL or MySQL adapters

## Recommended Fixes

### Option 1: Fix Parameter Binding (Recommended)
```typescript
async search(query: string, options: SearchOptions = {}): Promise<Document[]> {
  const { limit = 10, filter } = options;
  const params: any[] = [this.namespace];
  
  // Split the query into words
  const searchWords = query.toLowerCase().split(/\s+/);
  const searchPatterns = searchWords.map(word => `%${word}%`);
  
  // Add patterns for WHERE clause
  params.push(...searchPatterns);
  
  // Handle filters
  let filterClause = '';
  if (filter) {
    const filterConditions = [];
    for (const [key, value] of Object.entries(filter)) {
      filterConditions.push(`json_extract(metadata, '$.${key}') = ?`);
      params.push(value);
    }
    if (filterConditions.length > 0) {
      filterClause = `AND ${filterConditions.join(' AND ')}`;
    }
  }
  
  // Add patterns again for ORDER BY scoring
  params.push(...searchPatterns);
  
  // Add limit
  params.push(limit);
  
  // Create relevance scoring
  const searchScores = searchWords
    .map(() => `(CASE WHEN LOWER(content) LIKE ? THEN 1 ELSE 0 END)`)
    .join(' + ');
  
  const results = await this.adapter.query<Document>(
    `SELECT id, content, metadata
     FROM vector_documents
     WHERE namespace = ?
     AND (${searchWords.map(() => 'LOWER(content) LIKE ?').join(' OR ')}) ${filterClause}
     ORDER BY (${searchScores}) DESC, timestamp DESC
     LIMIT ?`,
    params
  );
  
  return results.map(doc => ({
    ...doc,
    metadata: JSON.parse(doc.metadata as string)
  }));
}
```

### Option 2: Simplify Scoring Without Extra Parameters
```typescript
// Use a single match count without parameters in ORDER BY
const results = await this.adapter.query<Document>(
  `SELECT id, content, metadata,
   (${searchWords.map((_, i) => 
     `CASE WHEN LOWER(content) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END`
   ).join(' + ')}) as relevance_score
   FROM vector_documents
   WHERE namespace = ?
   AND (${searchWords.map(() => 'LOWER(content) LIKE ?').join(' OR ')}) ${filterClause}
   ORDER BY relevance_score DESC, timestamp DESC
   LIMIT ?`,
  [...searchWords, this.namespace, ...searchPatterns, ...filterParams, limit]
);
```

### Option 3: Use Simpler Text Matching
```typescript
// Count occurrences using LENGTH difference
const results = await this.adapter.query<Document>(
  `SELECT id, content, metadata,
   (LENGTH(content) - LENGTH(REPLACE(LOWER(content), LOWER(?), ''))) as relevance_score
   FROM vector_documents
   WHERE namespace = ?
   AND LOWER(content) LIKE ? ${filterClause}
   ORDER BY relevance_score DESC, timestamp DESC
   LIMIT ?`,
  [query, this.namespace, `%${query}%`, ...filterParams, limit]
);
```

## Testing Strategy

### 1. Fix Implementation
Apply one of the recommended fixes above (Option 1 is most comprehensive).

### 2. Test Locally
```bash
# Run only vector-store tests first
npx vitest run src/tests/memory/vector-store.test.ts

# If successful, run all tests
npx vitest run
```

### 3. Debug SQL Queries
Add logging to see exact SQL and parameters:
```typescript
console.log('SQL:', sql);
console.log('Params:', params);
```

### 4. Test Different Scenarios
- Single word queries
- Multi-word queries
- Queries with filters
- Empty results
- Special characters in queries

## Additional Issues to Address

### 1. TreeRings Database Connection
- Error: `Cannot read properties of undefined (reading 'all')`
- The database adapter isn't properly initialized for TreeRings tests

### 2. Missing setupPrismaTestDb Function
- The Prisma test setup function is not exported or implemented
- Location: `src/tests/utils/prisma-setup.ts` (needs to be created or fixed)

### 3. TestContextManager Issues
- `Cannot read properties of undefined (reading 'set')`
- The context object isn't properly initialized with Maps for different entity types

## Environment Details
- SQLite Version: 3.43.2
- Database: In-memory SQLite for tests
- Framework: Vitest
- Node.js: (check with `node --version`)
- TypeScript: Strict mode enabled

## Next Steps for the Developer

1. **Immediate Fix**: Apply Option 1 fix to the VectorStore search method
2. **Run Tests**: Execute `npx vitest run src/tests/memory/vector-store.test.ts`
3. **Debug if Needed**: Add console.log statements to see exact SQL/params
4. **Fix Other Tests**: Address TreeRings and Prisma setup issues
5. **Document Changes**: Update this file with the solution that worked

## Resources
- [SQLite LIKE operator documentation](https://www.sqlite.org/lang_expr.html#like)
- [SQLite datatype documentation](https://www.sqlite.org/datatype3.html)
- [Vitest debugging guide](https://vitest.dev/guide/debugging.html)

## Contact for Questions
If you encounter issues not covered here, check:
1. The SQLite parameter binding in test-db-adapter.ts
2. The SQL query construction in vector-store.ts
3. The test data being used in vector-store.test.ts

Good luck! The foundation is solid - this is just a parameter ordering issue that needs to be resolved.
