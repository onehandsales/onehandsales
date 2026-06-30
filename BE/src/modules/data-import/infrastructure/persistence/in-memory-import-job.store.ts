import type {
  ImportJobStore,
  SaveImportJobInput,
  StoredImportJob,
  UpdateImportJobInput,
} from "@/modules/data-import/application/ports/import-job.store";

// 역할 : InMemoryImportJobStore 확정 전 임시 불러오기 job을 서버 메모리에 보관합니다.
export class InMemoryImportJobStore implements ImportJobStore {
  private readonly jobs = new Map<string, StoredImportJob>();

  // 기능 : 임시 불러오기 job을 저장합니다.
  async save(input: SaveImportJobInput): Promise<void> {
    this.jobs.set(this.getKey(input.job.userId, input.job.id), input.job);
  }

  // 기능 : 현재 사용자 소유 임시 불러오기 job을 조회합니다.
  async findById(input: {
    readonly userId: string;
    readonly importJobId: string;
  }): Promise<StoredImportJob | null> {
    return this.jobs.get(this.getKey(input.userId, input.importJobId)) ?? null;
  }

  // 기능 : 임시 불러오기 job 상태를 교체 저장합니다.
  async update(input: UpdateImportJobInput): Promise<void> {
    this.jobs.set(this.getKey(input.job.userId, input.job.id), input.job);
  }

  // 기능 : 확정 완료된 임시 불러오기 job을 제거합니다.
  async delete(input: {
    readonly userId: string;
    readonly importJobId: string;
  }): Promise<void> {
    this.jobs.delete(this.getKey(input.userId, input.importJobId));
  }

  private getKey(userId: string, importJobId: string): string {
    return `${userId}:${importJobId}`;
  }
}
