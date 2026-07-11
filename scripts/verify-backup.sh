#!/bin/bash
# ====================================================================
# Taswerak — Backup verification script
# Tests that PostgreSQL backups work + can be restored
#
# Usage: bash scripts/verify-backup.sh
#
# Prerequisites:
#   - Coolify PostgreSQL resource running
#   - DATABASE_URL env var set
#   - psql + pg_dump installed
# ====================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Taswerak Backup Verification ===${NC}"
echo ""

# Check DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}❌ DATABASE_URL env var not set${NC}"
  exit 1
fi

# Step 1: Create a backup
echo -e "${YELLOW}1. Creating backup...${NC}"
BACKUP_FILE="taswerak-backup-test-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"

# Step 2: Verify backup is not empty
LINES=$(wc -l < "$BACKUP_FILE")
if [ "$LINES" -lt 100 ]; then
  echo -e "${RED}❌ Backup too small ($LINES lines) — likely empty DB${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Backup contains $LINES lines${NC}"

# Step 3: Count tables in backup
TABLES=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
echo -e "${GREEN}✅ Backup contains $TABLES table definitions${NC}"

# Step 4: Test restore to a temp database (if psql available)
if command -v psql &> /dev/null; then
  echo -e "${YELLOW}2. Testing restore to temp database...${NC}"

  # Extract DB name from URL for suffix
  TEMP_DB="taswerak_restore_test_$(date +%s)"

  # Try to create temp DB (may fail if no CREATE DATABASE permission)
  if createdb "$TEMP_DB" 2>/dev/null; then
    echo "   Temp DB created: $TEMP_DB"

    # Restore
    if psql -d "$TEMP_DB" -f "$BACKUP_FILE" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Restore successful${NC}"

      # Verify data
      USER_COUNT=$(psql -d "$TEMP_DB" -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null || echo "0")
      COURSE_COUNT=$(psql -d "$TEMP_DB" -t -c "SELECT COUNT(*) FROM \"Course\";" 2>/dev/null || echo "0")
      echo -e "${GREEN}✅ Restored DB contains: $USER_COUNT users, $COURSE_COUNT courses${NC}"

      # Cleanup
      dropdb "$TEMP_DB" 2>/dev/null || true
      echo "   Temp DB dropped"
    else
      echo -e "${RED}❌ Restore failed${NC}"
      dropdb "$TEMP_DB" 2>/dev/null || true
      exit 1
    fi
  else
    echo -e "${YELLOW}⚠️  Cannot create temp DB (no CREATE DATABASE permission)${NC}"
    echo "   Skipping restore test. Verify manually on a separate server."
  fi
else
  echo -e "${YELLOW}⚠️  psql not installed — skipping restore test${NC}"
fi

# Step 5: Upload backup to external storage (if configured)
if [ -n "${BACKUP_S3_URL:-}" ]; then
  echo -e "${YELLOW}3. Uploading backup to external storage...${NC}"
  if curl -s -X PUT --upload-file "$BACKUP_FILE" "$BACKUP_S3_URL/$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup uploaded to external storage${NC}"
  else
    echo -e "${RED}❌ Upload to external storage failed${NC}"
  fi
fi

# Cleanup local backup (keep last 7 days)
find . -name "taswerak-backup-test-*.sql" -mtime +7 -delete 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Backup verification complete${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Coolify to run this script daily at 3 AM"
echo "2. Set up BACKUP_S3_URL for offsite storage"
echo "3. Test restore quarterly"
