-- AlterTable
ALTER TABLE "ExternalEmailConnection"
  DROP CONSTRAINT "ExternalEmailConnection_encryptedAccessToken_check";

ALTER TABLE "ExternalEmailConnection"
  ALTER COLUMN "encryptedAccessToken" DROP NOT NULL;

ALTER TABLE "ExternalEmailConnection"
  ADD CONSTRAINT "ExternalEmailConnection_encryptedAccessToken_check"
  CHECK ("encryptedAccessToken" IS NULL OR length(trim("encryptedAccessToken")) > 0);

COMMENT ON COLUMN "ExternalEmailConnection"."encryptedAccessToken" IS 'AES-GCM encrypted OAuth access token envelope. Null after user disconnects the connection.';
