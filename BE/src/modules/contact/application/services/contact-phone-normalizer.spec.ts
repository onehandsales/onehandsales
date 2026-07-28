import {
  formatContactPhoneDisplay,
  normalizeContactPhoneForCreate,
  normalizeLegacyContactPhone,
} from "@/modules/contact/application/services/contact-phone-normalizer";
import { DomainError } from "@/shared/domain/errors/domain-error";

describe("contact phone normalizer", () => {
  it("normalizes KR national phone to legacy display and E.164", () => {
    const phone = normalizeContactPhoneForCreate({
      phoneCountryCode: "KR",
      phoneNationalNumber: "010-1234-5678",
    });

    expect(phone).toEqual({
      mobile: "010-1234-5678",
      phoneCountryCode: "KR",
      phoneNationalNumber: "01012345678",
      phoneE164: "+821012345678",
    });
  });

  it("normalizes US national phone to legacy display and E.164", () => {
    const phone = normalizeContactPhoneForCreate({
      phoneCountryCode: "US",
      phoneNationalNumber: "(415) 555-1234",
    });

    expect(phone).toEqual({
      mobile: "415-555-1234",
      phoneCountryCode: "US",
      phoneNationalNumber: "4155551234",
      phoneE164: "+14155551234",
    });
  });

  it("keeps legacy KR mobile input compatible", () => {
    expect(normalizeLegacyContactPhone("010-1111-2222")).toMatchObject({
      phoneCountryCode: "KR",
      phoneNationalNumber: "01011112222",
      phoneE164: "+821011112222",
    });
  });

  it("formats stored global fields before legacy mobile fallback", () => {
    expect(
      formatContactPhoneDisplay({
        mobile: "01011112222",
        phoneCountryCode: "KR",
        phoneNationalNumber: "01011112222",
        phoneE164: "+821011112222",
      })
    ).toBe("010-1111-2222");
  });

  it("throws field validation errors for unsupported countries and invalid numbers", () => {
    try {
      normalizeContactPhoneForCreate({
        phoneCountryCode: "JP",
        phoneNationalNumber: "010-1234-5678",
      });
      throw new Error("Expected unsupported country error");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(
        "CONTACT_PHONE_COUNTRY_UNSUPPORTED"
      );
    }

    try {
      normalizeContactPhoneForCreate({
        phoneCountryCode: "US",
        phoneNationalNumber: "111-111-1111",
      });
      throw new Error("Expected invalid phone error");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("CONTACT_PHONE_INVALID");
    }
  });
});
