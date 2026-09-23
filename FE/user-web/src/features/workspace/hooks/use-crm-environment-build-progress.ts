import { useEffect, useState } from "react";

const CRM_ENVIRONMENT_BUILD_DURATION_MS = 2000;

// 기능 : CRM 환경 구축 화면의 진행률 연출 상태를 제공합니다.
export function useCrmEnvironmentBuildProgress(isRunning: boolean) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 1. 연출이 멈춘 상태에서는 진행률과 완료 상태를 초기화한다.
    if (!isRunning) {
      setProgress(0);
      setIsDone(false);
      return;
    }

    // 2. 새 연출 시작 시 진행률과 완료 상태를 처음부터 다시 계산한다.
    setProgress(0);
    setIsDone(false);

    const startedAt = performance.now();
    let frameId = 0;

    // 3. 브라우저 frame에 맞춰 진행률을 100까지 증가시킨다.
    const updateProgress = (currentTime: number) => {
      const elapsedMs = currentTime - startedAt;
      const nextProgress = Math.min(
        100,
        Math.round((elapsedMs / CRM_ENVIRONMENT_BUILD_DURATION_MS) * 100)
      );

      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = requestAnimationFrame(updateProgress);
        return;
      }

      setIsDone(true);
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      // 4. 화면 이탈 또는 재시작 시 예약된 frame을 정리한다.
      cancelAnimationFrame(frameId);
    };
  }, [isRunning]);

  return {
    progress,
    isDone,
  };
}
