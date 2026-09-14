DO $$
DECLARE
  target_column RECORD;
BEGIN
  FOR target_column IN
    SELECT *
    FROM (
      VALUES
        ('User', 'lastLoginAt'),
        ('User', 'createdAt'),
        ('User', 'updatedAt'),
        ('User', 'deletedAt'),
        ('UserOAuthAccount', 'tokenExpiresAt'),
        ('UserOAuthAccount', 'createdAt'),
        ('UserOAuthAccount', 'updatedAt'),
        ('AuthDevice', 'lastSeenAt'),
        ('AuthDevice', 'replacedAt'),
        ('AuthDevice', 'revokedAt'),
        ('AuthDevice', 'createdAt'),
        ('AuthDevice', 'updatedAt'),
        ('AuthSession', 'lastUsedAt'),
        ('AuthSession', 'expiresAt'),
        ('AuthSession', 'revokedAt'),
        ('AuthSession', 'createdAt'),
        ('AuthSession', 'updatedAt')
    ) AS timestamp_columns(table_name, column_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = target_column.table_name
        AND column_name = target_column.column_name
        AND data_type = 'timestamp without time zone'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN %I TYPE TIMESTAMPTZ(3) USING %I AT TIME ZONE ''UTC''',
        target_column.table_name,
        target_column.column_name,
        target_column.column_name
      );
    END IF;
  END LOOP;
END $$;
