import { Injectable } from "@nestjs/common";
import { PermanentDeleteNotAllowedError } from "@/modules/trash/domain/trash.errors";

@Injectable()
export class PermanentlyDeleteTrashItemUseCase {
  execute(): never {
    throw new PermanentDeleteNotAllowedError();
  }
}
