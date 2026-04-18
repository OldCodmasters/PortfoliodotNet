using Content.Application;
using Content.Domain;

namespace Content.Infrastructure;

public sealed class HardcodedPortfolioContentService : IPortfolioContentService
{
    private static readonly PortfolioContent _portfolio = new(
        Hero: new HeroProfile(
            Name: "Amin Dehghani",
            Tagline: "Process Engineer · Backend Developer",
            BioLines:
            [
                "Process Engineer / Senior Process Technician with hands-on experience in high-volume electronics manufacturing, process optimization, and equipment qualification.",
                "Wave & Selective Soldering · SPC · Metrology (SPI/AOI) · Software & Systems Engineering"
            ],
            CvUrl: "/pdfs/Amin-DehghaniCV2024.pdf",
            LinkedInUrl: "https://www.linkedin.com/in/dehghaniamin",
            ImageUrl: "/images/aboutImage.JPG",
            Highlights:
            [
                "Manufacturing: Wave/Selective Soldering, SMT, ERSA, Electrovert, Versaflow, Yamaha, SPI, AOI, SPC, IPC",
                "Programming: C#, C++, Python, SQL, JavaScript",
                "Technologies: .NET, ASP Web, Docker, Kubernetes, REST, GraphQL, gRPC, SOAP, LUA, TypeScript",
                "Databases: MySQL, PostgreSQL",
                "DevOps: CI/CD, Azure Systems, Dev.Azure",
                "Languages: Persian (Native), English (Advanced)"
            ]),
        Experience:
        [
            new ExperienceItem(
                Role: "Process Engineer / Process Technician",
                Company: "Flextronics | Austin, TX",
                DateRange: "2024 – Present",
                Bullets:
                [
                    "Promoted from Wave Operator to Process Technician based on technical performance and process ownership.",
                    "Analyze, operate, and optimize ERSA, Electrovert, Versaflow, and Yamaha systems in high-volume PCB manufacturing.",
                    "Perform process monitoring, adjustment, and validation including conveyor calibration, flux control, and thermal profiling.",
                    "Utilize Pemtron SPI and Eagle Eye 3D AOI for defect analysis, metrology, and tool health monitoring.",
                    "Identify yield-impacting issues, perform root-cause analysis, and implement corrective/preventive actions.",
                    "Develop SOPs and support technician training while ensuring IPC and internal quality compliance."
                ]),
            new ExperienceItem(
                Role: "Software Dev / Systems Engineer",
                Company: "Javanan Sharq | Iran",
                DateRange: "2016 – 2023",
                Bullets:
                [
                    "Raimo Studio (2022–2023) – Project Manager & DevOps: Managed Azure pipelines, reduced deployment times by 50%.",
                    "DigiKala Group (2020–2021) – Senior Backend Developer & Team Manager: Managed backend for Iran's largest e-commerce platform ($12B valuation).",
                    "2-29 Studio (2018–2020) – Software Engineer & DevOps: Developed games with .NET Core, C++, Unreal & Unity; 40% increase in user engagement.",
                    "Tarahan Studio (2016–2018) – Web & App Developer: Built Maan (real estate) and Saferan (accounting) using .NET; 40% performance improvement."
                ]),
            new ExperienceItem(
                Role: "Systems & Risk Engineering Adviser",
                Company: "Bushehr Nuclear Power Plant | Iran",
                DateRange: "2017",
                Bullets:
                [
                    "Conducted memory capture analysis and reverse engineering to assess system integrity.",
                    "Evaluated operational risks in safety-critical environments and documented mitigation strategies."
                ]),
            new ExperienceItem(
                Role: "Hardware Technician / Maintenance",
                Company: "Vapayesh Sanaat Fars | Iran",
                DateRange: "2012 – 2016",
                Bullets:
                [
                    "Maintained and repaired electrical, mechanical, and electromechanical elevator systems.",
                    "Implemented preventive maintenance schedules reducing downtime by ~30%."
                ])
        ],
        Skills:
        [
            new SkillCategory(
                Title: "Manufacturing & Process Engineering",
                Description: "High-Volume Electronics Manufacturing (PCB Assembly) · Wave Soldering · Selective Soldering · SMT Processes · ERSA, Electrovert, Versaflow, Yamaha Equipment · Process Qualification & New Line Bring-Up · Yield Optimization & Defect Reduction · Root Cause Analysis (RCA) & CAPA · SPC · Pemtron SPI · Eagle Eye 3D AOI · IPC Standards · SOP Development · Equipment Calibration"),
            new SkillCategory(
                Title: "Automation, Data & Systems",
                Description: "Process Data Analysis & Validation · Automation & Monitoring Support · PLC-Integrated Manufacturing Environments · CI/CD for Industrial & Process Automation · Docker · Kubernetes"),
            new SkillCategory(
                Title: "Software & Technologies",
                Description: "C#, C++, Python, SQL, JavaScript · .NET, ASP Web, GraphQL, REST, gRPC, SOAP, LUA, TypeScript, Proteus Designer · MySQL, PostgreSQL · CI/CD, Azure Systems, Dev.Azure"),
            new SkillCategory(
                Title: "Certifications",
                Description: "Docker & Kubernetes (2024) · AWS & Azure Systems (2024) · REST & GraphQL Advanced (2019) · .NET Core in Gaming (2018) · Machine Learning in R (2018) · Unity & Gaming Pipeline (2019)")
        ],
        Awards:
        [
            new Award(
                Title: "Best Game Design Studio – Tehran Game Convention 2018",
                Description: "Awarded for creating \"Moshio\" and \"Azaran\", recognized for excellence in game design and development."),
            new Award(
                Title: "Shiraz Honorable Citizen of 2016 – Award from the Mayor of Shiraz",
                Description: "Recognized for developing MAAN, enhancing the online platform for real estate transactions.")
        ]);

    public PortfolioContent GetPortfolio() => _portfolio;
}
