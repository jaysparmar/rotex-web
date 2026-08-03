type Tool = { title: string; description: string };

/* All tools point at the same portal for now; each will get its own URL later. */
const TOOL_URL = "https://rotex.ezzystack.com/";

const TOOLS: Tool[] = [
  { title: "Rotex Product Configurator", description: "Configure and customize Rotex products to meet your specifications." },
  { title: "Data Sheet Creator", description: "Generate professional data sheets for your products." },
  { title: "9X Code Finder", description: "Search and find 9X codes quickly and efficiently." },
  { title: "9x Code Request Form", description: "Request new 9X codes for your requirements." },
  { title: "Customer Complaint Form", description: "Submit customer complaints and feedback." },
  { title: "Price Request Form", description: "Request pricing information for products and services." },
  { title: "Customer Dashboard", description: "Access your customer dashboard and analytics." },
  { title: "Competitor Equivalent Model", description: "Find competitor equivalent models for your reference products." },
  { title: "GAD Request Form", description: "Submit GAD (Generate All Data) requests." },
  { title: "String Validator", description: "Validate and verify string formats for product codes." },
];

/* Placeholder artwork until the real tool imagery lands. Figma: an 80×80 mark
   with py-10 on the card's own white background — no fill behind it. */
function ToolImagePlaceholder() {
  return (
    <div className="py-10 flex items-center justify-center">
      <svg width="80" height="74" viewBox="0 0 14 13" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.1516 0.504252L0.125887 5.99991C-0.0419623 6.31211 -0.0419623 6.69606 0.125887 6.99993L3.1516 12.5042C3.32677 12.8083 3.63897 13 3.97467 13L10.0256 13C10.3761 13 10.681 12.8081 10.8484 12.5042L13.8741 6.99993C14.042 6.69606 14.042 6.31195 13.8741 5.99991L10.8484 0.504252C10.6809 0.192218 10.3761 0 10.0256 0L3.97467 0C3.63912 0 3.32692 0.192218 3.1516 0.504252Z"
          fill="#EE3E23"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

export function PartnerToolsGrid() {
  return (
    <>
      {/* Hero — Figma: h-96, px-20 pt-28 pb-20, content bottom-aligned */}
      <section className="bg-stone-900 px-5 lg:px-20 pt-26 lg:pt-28 pb-10 lg:pb-20 lg:h-96 flex flex-col justify-end items-start gap-6">
        <div className="flex flex-col justify-center items-start gap-3 lg:gap-5">
          <h1 className="lg:w-143 text-gradient-hero font-montserrat font-normal text-3xl lg:text-6xl leading-10 lg:leading-14.25">
            Rotex Automation Sales tools
          </h1>
          <p className="lg:w-143 text-white font-montserrat font-normal text-sm lg:text-base leading-5 lg:leading-6">
            Access all your essential sales and customer service tools in one place.
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="bg-white py-14 lg:py-20">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map(({ title, description }) => (
            <div
              key={title}
              className="bg-white rounded-xl outline-1 -outline-offset-1 outline-neutral-200 flex flex-col overflow-hidden"
            >
              <ToolImagePlaceholder />

              <div className="flex-1 p-5 bg-zinc-100 flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-stone-900 font-montserrat font-semibold text-base leading-6">
                    {title}
                  </h2>
                  <p className="text-stone-500 font-montserrat font-medium text-sm leading-5">
                    {description}
                  </p>
                </div>

                {/* External portal — opens in a new tab */}
                <a
                  href={TOOL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit px-5 py-3 bg-white rounded-[45px] inline-flex items-center gap-1.5 text-stone-900 font-montserrat font-medium text-sm leading-5 hover:bg-primary hover:text-white transition-colors duration-150"
                >
                  Open Tool
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M4 2.5 7.5 6 4 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
