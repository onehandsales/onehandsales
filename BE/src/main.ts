import "reflect-metadata";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { HttpExceptionFilter } from "./shared/presentation/filters/http-exception.filter";

// 기능 : Nest 애플리케이션을 생성하고 전역 파이프, 필터, CORS, 포트를 설정해 서버를 실행합니다.
async function bootstrap() {
  // 1. ConfigModule 생성 전에 local env 파일을 제한적으로 process 환경에 반영한다.
  loadLocalEnvironment();

  // 2. env bootstrap 이후 AppModule을 동적으로 import해 ConfigModule 초기화 순서를 보장한다.
  const { AppModule } = await import("./app.module");

  // 3. Nest 애플리케이션을 생성하고 runtime 설정 접근은 ConfigService로 통일한다.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  // 4. 전역 validation pipe와 exception filter를 등록한다.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. bootstrap 이후 환경 변수 값은 ConfigService로만 읽어 CORS origin을 설정한다.
  app.enableCors({
    origin: [
      configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ],
    credentials: true,
  });

  // 6. 서버 포트도 ConfigService를 통해 읽고 기본값은 local 실행 기준으로 둔다.
  const port = Number(configService.get<string>("PORT") ?? 3000);
  await app.listen(port);
}

void bootstrap();

// 기능 : ConfigModule 생성 전 bootstrap 예외 범위에서 Backend local env 파일을 로드합니다.
function loadLocalEnvironment() {
  // 1. OS나 hosting이 먼저 주입한 환경 변수 key를 보존 대상으로 기록한다.
  const predefinedKeys = new Set(Object.keys(process.env));

  // 2. 기본 .env를 먼저 읽어 공유 환경 계약 값을 채운다.
  loadEnvFile(".env", predefinedKeys, false);

  // 3. .env.local은 기존 주입값을 덮지 않는 로컬 override로만 읽는다.
  loadEnvFile(".env.local", predefinedKeys, true);
}

// 기능 : bootstrap 초기화 중 지정한 env 파일의 유효한 key/value를 process 환경에 반영합니다.
function loadEnvFile(
  fileName: string,
  predefinedKeys: ReadonlySet<string>,
  overrideLoaded: boolean
) {
  // 1. Backend 실행 위치 기준으로 env 파일 경로를 계산한다.
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  // 2. dotenv 형식의 유효한 줄만 해석하고 기존 주입값은 보존한다.
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const parsed = parseEnvLine(line);

    if (!parsed || predefinedKeys.has(parsed.key)) {
      continue;
    }

    if (!overrideLoaded && process.env[parsed.key] !== undefined) {
      continue;
    }

    // 3. ConfigModule 초기화 전 bootstrap 예외 범위에서만 process.env에 값을 주입한다.
    process.env[parsed.key] = parsed.value;
  }
}

// 기능 : dotenv 한 줄을 환경 변수 key/value 또는 무시 대상 null로 해석합니다.
function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const rawValue = trimmed.slice(separatorIndex + 1).trim();

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return null;
  }

  return {
    key,
    value: unquoteEnvValue(rawValue),
  };
}

// 기능 : 따옴표로 감싼 env 값을 실제 환경 변수 값으로 정규화합니다.
function unquoteEnvValue(value: string) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
