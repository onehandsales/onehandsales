import { PayloadTooLargeException } from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import { BusinessCardUploadExceptionFilter } from "./business-card.controller";

// 기능 : Nest ArgumentsHost에서 response mock만 꺼낼 수 있는 테스트 대역을 생성합니다.
function createArgumentsHostFake(response: unknown): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: jest.fn(),
      getResponse: () => response,
      getNext: jest.fn(),
    }),
  } as unknown as ArgumentsHost;
}

describe("BusinessCardUploadExceptionFilter", () => {
  it("maps Multer file size errors into IMAGE_TOO_LARGE response", () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status };
    const host = createArgumentsHostFake(response);

    new BusinessCardUploadExceptionFilter().catch(
      new PayloadTooLargeException("File too large"),
      host
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      error: "IMAGE_TOO_LARGE",
      code: "IMAGE_TOO_LARGE",
      message: "10MB 이하 이미지만 올릴 수 있어요.",
      field: "image",
    });
  });
});
