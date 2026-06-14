// 기능 : DealListScreen은 DealPipelineHomeScreen으로 통합되었습니다.
// 이 컴포넌트는 하위 호환성을 위해 유지합니다.
import { DealPipelineHomeScreen } from "@/features/deal/components/deal-pipeline-home-screen";

export function DealListScreen() {
  return <DealPipelineHomeScreen />;
}
