# Troubleshooting Guide

## Error: "right-hand side of 'in' should be an object, got undefined"

### Symptoms

You may encounter one of these errors when using the theme management plugin:

```
Runtime TypeError: right-hand side of 'in' should be an object, got undefined

Call Stack:
- tabHasName (node_modules/payload/src/fields/config/types.ts)
- RenderServerComponent (node_modules/@payloadcms/ui/src/elements/RenderServerComponent/index.tsx)
```

### Root Cause

This is a **known Payload CMS issue** ([#12867](https://github.com/payloadcms/payload/discussions/12867)) related to:

1. **Corrupted user preferences** in the database
2. **Stale preferences** referencing fields/tabs that have been modified
3. **Field configuration changes** where old preferences still reference removed fields

The theme management plugin uses complex nested field structures (collapsible fields with groups and tabs), which can trigger this issue when user preferences become out of sync.

## Solutions

### Solution 1: Reset User Preferences (Recommended)

**For the affected user:**

1. Go to your Payload admin panel: `/admin/account`
2. Scroll to the bottom of the page
3. Click the **"Reset Preferences"** button
4. Refresh the page

This will clear your UI preferences and resolve the issue.

### Solution 2: Clear All User Preferences (Database)

**For MongoDB:**

```bash
# Connect to your MongoDB instance
mongosh

# Switch to your database
use your_database_name

# Delete all preferences
db.payload_preferences.deleteMany({})
```

**For PostgreSQL:**

```sql
-- Connect to your database
psql -d your_database_name

-- Delete all preferences
DELETE FROM payload_preferences;
```

**Note:** This will reset preferences for **all users**, not just the affected one.

### Solution 3: Clear Specific User Preferences

**For MongoDB:**

```javascript
// Find preferences for a specific user
db.payload_preferences.find({ user: "USER_ID_HERE" })

// Delete preferences for that user
db.payload_preferences.deleteMany({ user: "USER_ID_HERE" })
```

**For PostgreSQL:**

```sql
-- Delete preferences for a specific user
DELETE FROM payload_preferences 
WHERE user_id = 'USER_ID_HERE';
```

## Prevention

### When Updating Field Configuration

If you modify the theme configuration fields in your project:

1. **Before deploying:** Warn users to reset their preferences
2. **After deploying:** Consider clearing the `payload_preferences` collection/table
3. **Version migrations:** Include a migration to clean up preferences when fields change

### Example Migration (for major field changes)

```typescript
// migrations/YYYY-MM-DD-clear-theme-preferences.ts
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Clear all theme-related preferences
  await payload.db.connection.collection('payload-preferences').deleteMany({})
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // No rollback needed
}
```

## How to Identify the Issue

### Error in Browser Console

Look for:
```
TypeError: right-hand side of 'in' should be an object, got undefined
```

### Error Stack Trace Points To

- `tabHasName` function in Payload's field config
- `RenderServerComponent` in Payload UI
- References to your theme configuration fields

### User-Specific Behavior

- ✅ Works fine for new users
- ❌ Error appears for existing users
- ✅ Error disappears after resetting preferences
- ❌ Error appears after changing any user preference (theme, etc.)

## Related Payload CMS Issues

- [#12867 - Bug with tabs: tabHasName function](https://github.com/payloadcms/payload/discussions/12867)
- [#11369 - Similar issue](https://github.com/payloadcms/payload/discussions/11369)
- [#2508 - Reset preferences discussion](https://github.com/payloadcms/payload/discussions/2508)

## Need Help?

If the above solutions don't work:

1. Check if you're using the latest version of the plugin
2. Verify your Payload CMS version is compatible (v3.x required)
3. Open an issue at [payload-plugins repository](https://github.com/vitakili/payload-plugins/issues)
4. Include:
   - Error message and stack trace
   - Payload CMS version
   - Plugin version
   - Database type (MongoDB/PostgreSQL)
   - Steps to reproduce
