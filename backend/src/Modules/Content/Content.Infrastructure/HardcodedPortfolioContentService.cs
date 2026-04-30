using Content.Application;
using Content.Domain;

namespace Content.Infrastructure;

public sealed class HardcodedPortfolioContentService : IPortfolioContentService
{
    private static readonly PortfolioContent _portfolio = new(
        Hero: new HeroProfile(
            Name: "Amin Dehghani",
            Tagline: "Process Engineering Technician · Backend Developer",
            BioLines:
            [
                "Process Engineering Technician with hands-on experience in high-volume PCBA/SMT manufacturing — equipment setup, line-change configuration, and yield-improvement analysis.",
                "IPC-A-610 & IPC J-STD-001 certified. Fluent across ERSA, Electrovert, Versaflow, and Yamaha platforms. Parallel background as a backend software engineer (.NET, Python, Docker, Kubernetes)."
            ],
            CvUrl: "/pdfs/AminDehghaniCV2026L.pdf",
            LinkedInUrl: "https://www.linkedin.com/in/dehghaniamin",
            ImageUrl: "/images/aboutImage.JPG",
            Highlights:
            [
                "Austin, TX · Dehghani.amin@outlook.com · +1 619-259-1358",
                "IPC-A-610 (Acceptability of Electronic Assemblies) · IPC J-STD-001 (Soldering)",
                "Docker & Kubernetes (2024) · AWS & Azure Systems (2024)",
                "BSc Computer Engineering — GPA 3.6 (2012–2016)",
                "Bilingual: Persian (Native) · English (Full professional proficiency)"
            ]),
        Experience:
        [
            new ExperienceItem(
                Role: "Process Technician / Electronics Manufacturing Technician",
                Company: "SolarEdge | Austin, TX",
                DateRange: "2024 – Present",
                Bullets:
                [
                    "Set up processing equipment including ERSA and Electrovert wave and selective soldering systems — solder parameters, flux application, and conveyor settings tuned per product run.",
                    "Executed line change configurations for new product introductions on Yamaha SMT equipment: feeder setup, component placement verification, process parameter adjustments.",
                    "Monitored, audited, and guided line operators on IPC-A-610 / IPC J-STD-001 standards, soldering quality, and correct process procedures.",
                    "Processed test runs and prepared detailed records of breakdowns, scrap rates, and defect data; generated SPC charts and trend graphs for engineering to drive yield improvements.",
                    "Read and interpreted electronic schematics, assembly drawings, and Gerber files to guide equipment setup, troubleshooting, and root-cause analysis.",
                    "Operated Eagle Eye 3D AOI, Pemtron SPI, and Phoenix Live X-ray for solder defect identification, void detection, and component misalignment verification.",
                    "Performed corrective maintenance — basic troubleshooting, preventive maintenance, and equipment calibration — to minimize downtime and support continuous production flow.",
                    "Followed escalation procedures for process deviations; contributed to CAPA activities and yield-improvement initiatives through SPC trend analysis and RCA."
                ]),
            new ExperienceItem(
                Role: "Software & Systems Engineer / Team Lead",
                Company: "Javanan Sharq | Iran (Multiple Roles)",
                DateRange: "2016 – 2023",
                Bullets:
                [
                    "Led cross-functional teams from project ideation through deployment; mentored junior engineers.",
                    "Built monitoring and automation pipelines using Python, C#, .NET, Docker, and Kubernetes.",
                    "Managed backend systems for DigiKala — Iran's largest e-commerce marketplace ($12B+ valuation).",
                    "Established CI/CD pipelines at Raimo Studio, reducing deployment times by 50%."
                ]),
            new ExperienceItem(
                Role: "Systems & Risk Engineering Adviser",
                Company: "Bushehr Nuclear Power Plant | Iran",
                DateRange: "2017",
                Bullets:
                [
                    "Evaluated operational risks in safety-critical environments and documented mitigation strategies.",
                    "Conducted system integrity assessments and supported technical process documentation."
                ]),
            new ExperienceItem(
                Role: "Hardware Technician / Maintenance Team",
                Company: "Vapayesh Sanaat Fars | Iran",
                DateRange: "2012 – 2016",
                Bullets:
                [
                    "Performed corrective and preventive maintenance on electrical, mechanical, and electromechanical systems.",
                    "Diagnosed failures in control panels, motor drives, and mechanical assemblies; followed escalation procedures for complex repairs.",
                    "Implemented preventive maintenance schedules, reducing equipment downtime by ~30%.",
                    "Documented inspections, breakdown events, and modifications for compliance and long-term reliability."
                ])
        ],
        Skills:
        [
            new SkillCategory(
                Title: "PCBA / SMT Manufacturing",
                Description: "High-volume PCB assembly via wave, selective, and reflow soldering. SMT line operation across ERSA, Electrovert, Versaflow, and Yamaha platforms. Hand soldering and rework to IPC J-STD-001 standards. Process qualification and new-line bring-up."),
            new SkillCategory(
                Title: "Processing Equipment Setup & Line-Change Configuration",
                Description: "Wave / selective solder parameter configuration — pot temperatures, flux application, preheat profiles, conveyor speed. SMT feeder setup, first-off verification, and process parameter adjustments for new product introductions. Reduce changeover time through disciplined NPI procedures."),
            new SkillCategory(
                Title: "Quality, Inspection & SPC",
                Description: "Metrology and defect analysis with Pemtron SPI (solder paste inspection), Eagle Eye 3D AOI, and Phoenix Live X-ray for BGA voids and hidden joint inspection. Visual audits to IPC-A-610. Generate SPC charts and yield trend graphs from line breakdown data and present findings to engineering for CAPA and RCA."),
            new SkillCategory(
                Title: "Schematic / PCB-Level Debug",
                Description: "Read and interpret electronic schematics, assembly drawings, and Gerber files to guide equipment setup, troubleshoot defects, and perform root-cause analysis. Correlate AOI, SPI, X-ray, and ICT findings to drive corrective actions at the process and component level."),
            new SkillCategory(
                Title: "Corrective & Preventive Maintenance",
                Description: "Equipment troubleshooting at the electrical, mechanical, and pneumatic level. Preventive maintenance scheduling, equipment calibration, and tool-health monitoring. Disciplined escalation procedures for process deviations and equipment failures."),
            new SkillCategory(
                Title: "Backend Software Engineering",
                Description: "Python, C#, SQL. Designed REST / gRPC APIs and schema migrations. Built monitoring and automation for DigiKala (Iran's largest e-commerce, $12B+ valuation). Strong .NET and ASP.NET background including modular-monolith architectures."),
            new SkillCategory(
                Title: "DevOps & Cloud",
                Description: "Docker, Kubernetes, Azure Pipelines, AWS fundamentals. Containerized multi-service backends and orchestrated releases. Established CI/CD pipelines that cut deployment time by 50% at Raimo Studio."),
            new SkillCategory(
                Title: "Leadership & Cross-Functional Collaboration",
                Description: "Guided line operators on IPC standards, soldering quality, and process procedures. Led cross-functional teams at Javanan Sharq from ideation through deployment; mentored junior engineers."),
            new SkillCategory(
                Title: "Certifications",
                Description: "IPC-A-610 (Acceptability of Electronic Assemblies) · IPC J-STD-001 (Soldering) · Docker & Kubernetes (2024) · AWS & Azure Systems (2024)"),
            new SkillCategory(
                Title: "Languages",
                Description: "Bilingual — Persian (Native speaker) · English (Full professional proficiency). Comfortable working across English-speaking and Farsi-speaking teams; translate technical specifications between both."),
            new SkillCategory(
                Title: "Education",
                Description: "Bachelor of Science in Computer Engineering — GPA 3.6 (2012 – 2016).")
        ],
        Awards:
        [
            new Award(
                Title: "Best Game Design Studio — Tehran Game Convention 2018",
                Description: "Awarded for creating \"Moshio\" and \"Azaran\" at 2-29 Studio — recognized for excellence in game design and technical execution."),
            new Award(
                Title: "Shiraz Honorable Citizen 2016 — Award from the Mayor of Shiraz",
                Description: "Recognized for developing MAAN, the online platform that modernized real-estate transactions in the city.")
        ]);

    public PortfolioContent GetPortfolio() => _portfolio;
}
