// 기능 : React 19 hook 테스트에서 act 환경 플래그를 명시합니다.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
