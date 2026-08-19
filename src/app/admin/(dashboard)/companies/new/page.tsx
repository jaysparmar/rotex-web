import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CompanyEditForm } from "@/components/admin/companies/company-edit-form";

export default function AdminNewCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Company</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a new company under Rotex.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Companies", href: "/admin/companies" },
            { label: "New" },
          ]}
        />
      </div>

      <CompanyEditForm />
    </div>
  );
}
