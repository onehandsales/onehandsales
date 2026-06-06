import { Module } from "@nestjs/common";
import { ENCRYPTION_PORT } from "@/shared/application/ports/encryption.port";
import { NodeEncryptionAdapter } from "./node-encryption.adapter";

@Module({
  providers: [
    NodeEncryptionAdapter,
    {
      provide: ENCRYPTION_PORT,
      useExisting: NodeEncryptionAdapter,
    },
  ],
  exports: [ENCRYPTION_PORT],
})
export class SecurityInfrastructureModule {}

