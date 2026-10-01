// 역할 : AttributeDefinitionCurrencyDisplayType이 Currency 설정의 표시 방식 범위를 정의합니다.
export type AttributeDefinitionCurrencyDisplayType = "symbol";

// 역할 : AttributeDefinitionCurrencyConfig가 Currency AttributeDefinition 설정 값을 정의합니다.
export interface AttributeDefinitionCurrencyConfig {
  readonly defaultCurrencyCode: string;
  readonly displayType: AttributeDefinitionCurrencyDisplayType;
}

// 역할 : AttributeDefinitionConfig가 AttributeType별 저장 설정 값을 정의합니다.
export interface AttributeDefinitionConfig {
  readonly currency: AttributeDefinitionCurrencyConfig;
}
