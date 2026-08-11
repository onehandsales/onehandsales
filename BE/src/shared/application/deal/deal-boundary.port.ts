// 역할 : DealLabelRecord 다른 module에서 딜 참조 검증과 activity label에 필요한 최소 딜 정보를 정의합니다.
export interface DealLabelRecord {
  readonly id: string;
  readonly dealName: string;
}

// 역할 : DealOptionRecord 다른 module의 딜 선택 옵션에 필요한 projection을 정의합니다.
export interface DealOptionRecord extends DealLabelRecord {
  readonly createdAt: Date;
}

// 역할 : DealSnapshotRecord 다른 module relation snapshot 생성에 필요한 딜 projection을 정의합니다.
export interface DealSnapshotRecord extends DealLabelRecord {
  readonly dealStatus: string;
  readonly dealCost: number;
  readonly expectedEndDate: Date;
}

// 역할 : CreateDealFollowingActionLogInput 다른 module transaction 안에서 다음 행동 로그를 생성하는 값을 정의합니다.
export interface CreateDealFollowingActionLogInput {
  readonly userId: string;
  readonly dealId: string;
  readonly followingAction: string;
}

// 역할 : DealFollowingActionLogRecord 생성된 딜 다음 행동 로그 record를 정의합니다.
export interface DealFollowingActionLogRecord {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : DealBoundaryPort 다른 module transaction 안에서 필요한 딜 참조/부수 쓰기 최소 계약을 정의합니다.
export interface DealBoundaryPort {
  // 기능 : 현재 사용자의 일정 연결용 딜 옵션 목록을 조회합니다.
  listDealOptions(userId: string): Promise<DealOptionRecord[]>;
  // 기능 : 현재 사용자 소유 딜의 label projection을 조회합니다.
  findDealLabelsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealLabelRecord[]>;
  // 기능 : 현재 사용자 소유 딜의 relation snapshot projection을 조회합니다.
  findDealSnapshotsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealSnapshotRecord[]>;
  // 기능 : 딜 다음 행동 로그를 생성합니다.
  createFollowingActionLog(
    input: CreateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord>;
}
