import {
  type SearchGroupRecord,
  type SearchItemRecord,
  type SearchRepository,
  type SearchRepositoryInput,
} from "@/modules/search/application/ports/search.repository";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type CompanySearchRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: { readonly field: string };
  readonly companyRegion: { readonly region: string };
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

  private joinParts(parts: ReadonlyArray<string | null | undefined>): string | null {
    const normalizedParts = parts
      .map((part) => part?.trim())
      .filter((part): part is string => part !== undefined && part.length > 0);

    return normalizedParts.length > 0 ? normalizedParts.join(" / ") : null;
  }
}
