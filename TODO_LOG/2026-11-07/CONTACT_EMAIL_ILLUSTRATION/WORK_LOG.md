# 데모 요청 이메일 일러스트 교체

- 작업 일자: 2026-11-07
- 상태: 완료
- 요청: Request a Demo 첫 단계의 이메일 이미지를 다른 이미지로 바꾸고 배경을 `#FFFFFF`로 맞춘다.
- 관련 규칙: `AGENTS.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- 적용 스킬: `/Users/jaegeunsong/.codex/skills/.system/imagegen/SKILL.md`

## 범위와 진행 기록

- 기존 사용자 변경과 직전 저작권 문구 수정을 보존한다.
- `FE/user-web/src/pages/contact/index.tsx`의 이메일 단계 이미지 경로와 기존 SVG 자산을 확인했다.
- 새 이메일 일러스트를 생성해 프로젝트에 저장하고 첫 단계 이미지에 연결한다.
- 화면 배경, 이미지 배경과 로딩을 브라우저에서 확인한다.

## 검증 결과

- 내장 `image_gen`으로 새 이메일 일러스트를 생성하고 배경 보정 편집을 수행했다. CLI/API fallback은 사용하지 않았다.
- 생성 자산을 `FE/user-web/public/public-site/contact/request-email.png`에 저장하고 이메일 단계 경로를 연결했다.
- 생성 원본의 미세한 회색 배경을 화면에서 순백색으로 맞추기 위해 이메일 단계에만 `bg-white brightness-[1.01]` 표시 보정을 적용했다.
- `fnm exec --using=24.21.0 pnpm run typecheck`: 통과.
- Chrome/Playwright: 홈의 Request a Demo 링크에서 영어 문의 화면 이동, 새 이미지 로딩, 한국어 화면 반영 확인.
- 이미지 실제 렌더링 캡처의 외곽 21,720픽셀 모두 RGBA(255,255,255,255)임을 확인했다.
- 이메일 입력 후 Next를 눌러 다음 단계의 기존 이미지가 유지됨을 확인했다. 실제 문의 제출은 수행하지 않았다.
- 모바일 390px에서 기존 이미지 숨김 정책과 가로 넘침 없음 확인. 페이지 실행 오류 없음.
- `git diff --check`: 통과. 적용 후 화면 캡처를 직접 확인했다.
- 초기 확인에서 미지원 `/en/contact` 경로로 접근해 404를 확인한 뒤 실제 `/en-us/contact`로 수정해 검증했다.
- 픽셀 분석용 Python Pillow가 설치되어 있지 않아 Chrome Canvas를 이용한 읽기 전용 분석으로 확인했다.

## 변경 파일과 보존 범위

- `FE/user-web/public/public-site/contact/request-email.png`
- `FE/user-web/src/pages/contact/index.tsx`
- 이 작업 로그.
- 작업 중 다른 영역의 BE/Object 생성 관련 변경이 추가된 것을 확인했다. 해당 변경과 기존 저작권 문구 수정은 그대로 보존했다.
- ENV, DB, 서버 실행 설정은 수정하지 않았다.

## 완료 현황과 다음 작업

- 요청한 이미지 교체와 화면의 흰 배경 확인 완료.
- 추가 필수 작업 없음. 생성 PNG의 용량은 약 1.3MB이며 파일 자체 재인코딩은 하지 않았다.

## 생성 프롬프트

```text
Use case: stylized-concept. Asset type: production website illustration for the first step of a CRM Request a Demo form, displayed about 430px wide beside a work email input. Create a NEW elegant editorial email illustration: a single blue folded-paper open envelope, with one crisp white message card emerging from it and a small dark charcoal @ symbol centered on the card. Refined contemporary SaaS aesthetic, restrained slightly three-dimensional paper depth, crisp clean edges, simple confident shapes. Envelope blue close to #4880EE, dark charcoal details, white paper. Composition centered in a landscape canvas approximately 4:3, subject filling about 65 percent of the canvas width, generous clean white margins, all elements comfortably inside frame. BACKGROUND MUST BE EXACT SOLID PURE WHITE #FFFFFF (RGB 255,255,255) everywhere outside the envelope and card. No off-white, no grey background, no gradients in the background, no texture, no vignette, no floor, no horizon, no background shadow, no panel, no border. No wings, no people, no decorative floating dots, no logos, no watermark. The only text-like element is the simple @ glyph.
```

## 배경 보정 프롬프트

```text
Edit only the background of this website illustration. Keep the blue open envelope, white message card, @ glyph, object geometry, scale, placement and original 4:3 canvas exactly unchanged. Replace EVERY pixel outside the envelope/card silhouette with solid pure white RGB(255,255,255), hexadecimal #FFFFFF. The original background has off-white noise/grain: remove it completely. Absolutely no texture, no dithering, no grey or cream tint, no gradient, no vignette, no shadow on the background. Output opaque white background, not transparency. Preserve clean antialiased edges of the envelope. This must sit seamlessly on an HTML #FFFFFF page.
```
