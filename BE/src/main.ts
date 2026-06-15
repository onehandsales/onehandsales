import "reflect-metadata";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { HttpExceptionFilter } from "./shared/presentation/filters/http-exception.filter";

// 기능 : Nest 애플리케이션을 생성하고 전역 파이프, 필터, CORS, 포트를 설정해 서버를 실행합니다.
async function bootstrap() {
  loadLocalEnvironment();
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [
      configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ],
    credentials: true,
  });

  const port = Number(configService.get<string>("PORT") ?? 3000);
  await app.listen(port);
}

void bootstrap();

function loadLocalEnvironment() {
  const predefinedKeys = new Set(Object.keys(process.env));

  loadEnvFile(".env", predefinedKeys, false);
  loadEnvFile(".env.local", predefinedKeys, true);
}

function loadEnvFile(
  fileName: string,
  predefinedKeys: ReadonlySet<string>,
  overrideLoaded: boolean
) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const parsed = parseEnvLine(line);

    if (!parsed || predefinedKeys.has(parsed.key)) {
      continue;
    }

    if (!overrideLoaded && process.env[parsed.key] !== undefined) {
      continue;
    }

    process.env[parsed.key] = parsed.value;
  }
}

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

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
