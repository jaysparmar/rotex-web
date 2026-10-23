import Link from "next/link";
import { ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { getFormConfig, FORMS, FORM_FIELDS } from "@/lib/form-config";

export default async function AdminFormsPage() {
  const config = await getFormConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Form Fields</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every enquiry-style form on the site shares the same field set — choose which ones show on each form.
            (Career page application form is separate and not covered here.)
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Form Fields" }]} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FORMS.map((form) => {
          const enabledCount = FORM_FIELDS.filter((f) => config[form.key]?.fields?.[f.key]).length;
          return (
            <Link key={form.key} href={`/admin/forms/${form.key}`}>
              <Card className="h-full transition-colors hover:border-foreground/30">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ListChecks className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{form.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{form.path}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enabledCount} of {FORM_FIELDS.length} fields shown
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
