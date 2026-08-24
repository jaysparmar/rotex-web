export type SheetData = { name: string; grid: string[][] };

export type CompanyOption = {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    importReference: string | null;
    subCategories: { id: string; name: string; importReference: string | null }[];
  }[];
};

export type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

export type ClassificationFieldState = { mode: "fixed" | "mapped" | "none"; fixedValue: string | null };

export type MatchBy = "name" | "importReference";

export type ClassificationState = {
  category: ClassificationFieldState;
  subCategory: ClassificationFieldState;
  productFamily: ClassificationFieldState;
  industry: ClassificationFieldState;
  subIndustry: ClassificationFieldState;
  categoryMatchBy: MatchBy;
  subCategoryMatchBy: MatchBy;
};
