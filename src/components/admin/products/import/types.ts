export type SheetData = { name: string; grid: string[][] };

export type CompanyOption = {
  id: string;
  name: string;
  categories: { id: string; name: string; subCategories: { id: string; name: string }[] }[];
};

export type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

export type ClassificationFieldState = { mode: "fixed" | "mapped" | "none"; fixedValue: string | null };

export type ClassificationState = {
  company: ClassificationFieldState;
  category: ClassificationFieldState;
  subCategory: ClassificationFieldState;
  productFamily: ClassificationFieldState;
  industry: ClassificationFieldState;
  subIndustry: ClassificationFieldState;
};
