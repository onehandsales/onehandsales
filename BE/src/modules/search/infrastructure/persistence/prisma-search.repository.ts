import {
  type SearchGroupRecord,
  type SearchItemRecord,
  type SearchRepository,
  type SearchRepositoryInput,
} from "@/modules/search/application/ports/search.repository";
import { formatContactPhoneDisplay } from "@/modules/contact/application/services/contact-phone-normalizer";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type CompanySearchRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: { readonly field: string };
  readonly companyRegion: { readonly region: string };
};

type ContactSearchRow = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneCountryCode: string | null;
  readonly phoneNationalNumber: string | null;
  readonly phoneE164: string | null;
  readonly company: { readonly companyName: string };
  readonly contactDepartment: { readonly departmentName: string };
  readonly contactJobGrade: { readonly jobGradeName: string };
};

type ProductSearchRow = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: { readonly categoryName: string };
  readonly productStatus: { readonly statusName: string };
};

type DealSearchRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly dealCompanies: ReadonlyArray<{
    readonly company: { readonly companyName: string };
  }>;
  readonly dealContacts: ReadonlyArray<{
    readonly contact: { readonly username: string };
  }>;
};

export class PrismaSearchRepository implements SearchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async search(input: SearchRepositoryInput): Promise<SearchGroupRecord[]> {
    return Promise.all(
      input.types.map(async (type) => ({
        type,
        items: await this.searchByType(type, input),
      }))
    );
  }

  private searchByType(
    type: SearchTargetType,
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    switch (type) {
      case SearchTargetType.COMPANY:
        return this.searchCompanies(input);
      case SearchTargetType.CONTACT:
        return this.searchContacts(input);
      case SearchTargetType.PRODUCT:
        return this.searchProducts(input);
      case SearchTargetType.DEAL:
        return this.searchDeals(input);
    }
  }

  private async searchCompanies(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const companies = await this.prismaService.company.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { companyName: { contains: input.query } },
          { companyField: { field: { contains: input.query } } },
          { companyRegion: { region: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        companyField: { select: { field: true } },
        companyRegion: { select: { region: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return companies.map((company) => this.toCompanyItem(company));
  }

  private async searchContacts(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const contacts = await this.prismaService.contact.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { username: { contains: input.query } },
          { email: { contains: input.query } },
          { phoneE164: { contains: input.query } },
          { mobile: { contains: input.query } },
          {
            company: {
              deletedAt: null,
              companyName: { contains: input.query },
            },
          },
          {
            contactDepartment: {
              departmentName: { contains: input.query },
            },
          },
          { contactJobGrade: { jobGradeName: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        mobile: true,
        phoneCountryCode: true,
        phoneNationalNumber: true,
        phoneE164: true,
        company: { select: { companyName: true } },
        contactDepartment: { select: { departmentName: true } },
        contactJobGrade: { select: { jobGradeName: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return contacts.map((contact) => this.toContactItem(contact));
  }

  private async searchProducts(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { productName: { contains: input.query } },
          { productCategory: { categoryName: { contains: input.query } } },
          { productStatus: { statusName: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        productName: true,
        productPrice: true,
        productCategory: { select: { categoryName: true } },
        productStatus: { select: { statusName: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return products.map((product) => this.toProductItem(product));
  }

  private async searchDeals(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const deals = await this.prismaService.deal.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { dealName: { contains: input.query } },
          { dealStatus: { contains: input.query } },
          {
            dealCompanies: {
              some: {
                company: {
                  deletedAt: null,
                  companyName: { contains: input.query },
                },
              },
            },
          },
          {
            dealContacts: {
              some: {
                contact: {
                  deletedAt: null,
                  username: { contains: input.query },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        dealStatus: true,
        dealCompanies: {
          select: {
            company: { select: { companyName: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        dealContacts: {
          select: {
            contact: { select: { username: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return deals.map((deal) => this.toDealItem(deal));
  }

  private toCompanyItem(company: CompanySearchRow): SearchItemRecord {
    return {
      title: company.companyName,
      subtitle: this.joinParts([
        company.companyField.field,
        company.companyRegion.region,
      ]),
      targetId: company.id,
      targetPath: `/app/companies/${company.id}`,
    };
  }

  private toContactItem(contact: ContactSearchRow): SearchItemRecord {
    const phoneDisplay = formatContactPhoneDisplay({
      mobile: contact.mobile,
      phoneCountryCode: contact.phoneCountryCode,
      phoneNationalNumber: contact.phoneNationalNumber,
      phoneE164: contact.phoneE164,
    });

    return {
      title: contact.username,
      subtitle: this.joinParts([
        phoneDisplay,
        contact.company.companyName,
        contact.contactDepartment.departmentName,
        contact.contactJobGrade.jobGradeName,
      ]),
      targetId: contact.id,
      targetPath: `/app/contacts/${contact.id}`,
    };
  }

  private toProductItem(product: ProductSearchRow): SearchItemRecord {
    return {
      title: product.productName,
      subtitle: this.joinParts([
        product.productCategory.categoryName,
        product.productStatus.statusName,
        this.formatMoney(product.productPrice),
      ]),
      targetId: product.id,
      targetPath: `/app/products/${product.id}`,
    };
  }

  private toDealItem(deal: DealSearchRow): SearchItemRecord {
    return {
      title: deal.dealName,
      subtitle: this.joinParts([
        this.joinParts(
          deal.dealCompanies.map(
            (dealCompany) => dealCompany.company.companyName
          )
        ),
        this.joinParts(
          deal.dealContacts.map((dealContact) => dealContact.contact.username)
        ),
        deal.dealStatus,
        this.formatMoney(deal.dealCost),
      ]),
      targetId: deal.id,
      targetPath: `/app/deals/${deal.id}`,
    };
  }

  private joinParts(parts: ReadonlyArray<string | null | undefined>): string | null {
    const normalizedParts = parts
      .map((part) => part?.trim())
      .filter((part): part is string => part !== undefined && part.length > 0);

    return normalizedParts.length > 0 ? normalizedParts.join(" · ") : null;
  }

  private formatMoney(value: number): string {
    return `${value.toLocaleString("ko-KR")}원`;
  }
}
