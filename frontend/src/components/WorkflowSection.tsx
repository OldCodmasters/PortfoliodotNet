"use client";

import {
  Fragment,
  useEffect,
  useState,
  type SVGProps,
  type ReactElement,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import type {
  Machine,
  MachineShape,
  Stage,
  SubStage,
  Track,
  TrackId,
} from "../data/workflow/types";
import { SOFTWARE_STAGES } from "../data/workflow/software-stages";
import { HARDWARE_STAGES } from "../data/workflow/hardware-stages";
import { WorkLifeCinema } from "./worklife/WorkLifeCinema";

/* --------------------------- process-track data --------------------------- */

const PROCESS_STAGES: Stage[] = [
  {
    key: "warehouse",
    label: "Warehouse",
    desc: "Receive, verify, kit.",
    overview:
      "Incoming goods are inspected against BOM, bar-coded into MES, and kitted into job trolleys. Moisture-sensitive devices are logged into floor-life tracking and baked to J-STD-033 before the line ever sees them.",
    Icon: WarehouseIcon,
  },
  {
    key: "smt",
    label: "SMT",
    desc: "Print → place → reflow → verify.",
    overview:
      "Surface-mount runs as a tight metrology loop: paste is printed, 3D-measured, every SMD placed to ±30 µm, reflowed through a profiled thermal curve, then imaged post-reflow by AOI and X-ray before any board leaves the cell. Every deposit, every placement and every joint is traced back to its feeder slot, nozzle or oven zone — drift at one station becomes an SPC alarm upstream.",
    Icon: SmtIcon,
    subStages: [
      {
        id: "kit",
        label: "Kit Prep · Feeder Setup",
        detail:
          "Job trolleys arrive from the warehouse with reels, trays and sticks already verified against the CAD BOM. Smart feeders are barcode-checked onto the mounter carts; MSL parts leave the dry cabinet with their floor-life timer armed. The programme, feeder map, nozzle assignment and Gerber pad data push from MES to the line controller. Any expired exposure time triggers a bake before the part ever reaches a head.",
        standards: ["J-STD-033", "IPC-1782", "IPC-A-610"],
      },
      {
        id: "print",
        label: "Paste Print · SPI",
        detail:
          "A laser-cut stainless stencil is aligned to PCB fiducials; servo squeegees deposit SAC305 at a programmed speed, pressure and separation rate. Every board is then scanned in 3D — per-pad height, area, volume and XY offset streamed to SPC. Boards outside limits are rejected at the SPI gate; sustained drift triggers an under-stencil clean and, if still drifting, a stencil pull.",
        standards: ["IPC-7525", "IPC-7527", "IPC-7530"],
        machines: [
          {
            brand: "DEK",
            model: "Horizon iX",
            shape: "printer",
            function: "Automatic stencil printer",
            how: "ProFlow closed-loop squeegee head with Hawkeye vision aligns to fiducials sub-25 µm; auto paste-dispense plus under-stencil-clean cycles keep deposit volume inside ±10 %.",
            standards: ["IPC-7525", "IPC-7527"],
          },
          {
            brand: "Koh Young",
            model: "aSPIre 3",
            shape: "inspection",
            function: "3D solder-paste inspection",
            how: "Dual-projection Moiré structured light reconstructs every deposit in 3D and streams volume / height / area / offset to SPC on a per-pad basis.",
            standards: ["IPC-7527", "IPC-7530"],
          },
        ],
      },
      {
        id: "place",
        label: "Pick-and-Place",
        detail:
          "Parts are picked from smart feeders, laser- or linescan-centered under the head, and placed to within ±30 µm at nominal (±50 µm at 3σ). 01005 chips through 55 mm BGAs run on the same beam; nozzle changeover is automatic between part families. Placement quality, pickup rate and feeder health stream to MES — a pickup failure is blamed on a specific feeder slot within seconds.",
        standards: ["IPC-9850", "IPC-7351", "IPC-A-610"],
        machines: [
          {
            brand: "Yamaha",
            model: "YRM20",
            shape: "placer",
            function: "Modular mounter (focus)",
            how: "Dual-lane, two-beam modular head platform with interchangeable HM/H heads — high-speed chip shooting and fine-pitch placement on the same module at up to 115 000 CPH.",
            standards: ["IPC-9850", "IPC-7351"],
          },
          {
            brand: "Fuji",
            model: "NXT III",
            shape: "placer",
            function: "Modular head platform",
            how: "Head-unit architecture swaps H01/H04/H08/H24 heads to balance speed vs fine-pitch; Vision-On-The-Fly laser centering on every nozzle.",
            standards: ["IPC-9850", "IPC-7351"],
          },
          {
            brand: "Yamaha",
            model: "YSM20R",
            shape: "placer",
            function: "High-speed chip shooter",
            how: "Twin linear-motor rotary-head mounter for 01005 – 0402 chip components at 95 000 CPH with in-head laser centering.",
            standards: ["IPC-9850"],
          },
        ],
      },
      {
        id: "reflow",
        label: "Reflow",
        detail:
          "Boards enter a multi-zone convection tunnel, N₂-blanketed. Top and bottom blower zones drive a profiled curve — preheat, soak, reflow (TAL above liquidus), cool — dialed per BOM so the hottest BGA ball and the smallest 01005 termination both land inside J-STD-020 without overshoot. Every new product is thermocouple-profiled; process monitors then lock the curve in production, and any profile excursion stops the line.",
        standards: ["J-STD-020", "IPC-7530", "IPC-A-610"],
        machines: [
          {
            brand: "Heller",
            model: "1809 Mk5",
            shape: "oven",
            function: "Convection reflow oven (focus)",
            how: "Nine top + nine bottom heated zones with independent blower control and an N₂-capable tunnel; heater architecture holds ΔT across heavy-copper assemblies below 3 °C.",
            standards: ["J-STD-020", "IPC-7530"],
          },
          {
            brand: "Rehm",
            model: "VisionXP+",
            shape: "oven",
            function: "Convection reflow oven",
            how: "Ten-zone convection with residue-management pyrolysis keeps the hot zone clean on high-flux products; vacuum option eliminates BGA voids.",
            standards: ["J-STD-020", "IPC-7530"],
          },
        ],
      },
      {
        id: "aoi",
        label: "Post-Reflow AOI",
        detail:
          "Every joint is imaged in 3D — fillet shape, component offset, lifted-lead, tombstone, polarity, missing / wrong part, bridging. Defects route to a verification station; the verified-reject rate drives first-pass-yield SPC back at print and place. AOI closes the loop on the whole SMT cell, not just the oven.",
        standards: ["IPC-A-610", "IPC-7912", "IPC-9252"],
        machines: [
          {
            brand: "Koh Young",
            model: "Zenith Alpha UHS",
            shape: "inspection",
            function: "3D post-reflow AOI (focus)",
            how: "Eight-projection Moiré 3D plus colour top / side cameras inspect every joint and component against CAD; shared component library with aSPIre SPI closes the SPC loop end-to-end.",
            standards: ["IPC-A-610", "IPC-7912"],
          },
          {
            brand: "Omron",
            model: "VT-S10",
            shape: "inspection",
            function: "3D AOI",
            how: "Multi-colour LED illumination plus 3D reconstruction highlights lifted-lead and tombstone defects that 2D AOI misses; inline sub-ten-second cycle.",
            standards: ["IPC-A-610"],
          },
        ],
      },
      {
        id: "axi",
        label: "X-ray · AXI",
        detail:
          "Hidden joints — BGA balls, QFN thermal pads, press-fit power modules — are validated by 3D X-ray. Each ball is measured for diameter, voiding %, shape, head-in-pillow and bridging. Sampled per the MSA plan on general builds, 100 % on safety-critical product. Planar-CT slice reconstruction resolves each BGA ball individually so voiding and HiP get caught before ICT, not after.",
        standards: ["IPC-7095", "IPC-A-610", "IPC-9252"],
        machines: [
          {
            brand: "ViTrox",
            model: "V810i",
            shape: "xray",
            function: "Inline 3D AXI (focus)",
            how: "Planar-CT 3D reconstruction at inline cycle time; per-ball measurement of void %, bridging and head-in-pillow with CAD-programmed slice planes.",
            standards: ["IPC-7095", "IPC-A-610"],
          },
          {
            brand: "Nordson DAGE",
            model: "Quadra 7",
            shape: "xray",
            function: "Off-line microfocus X-ray",
            how: "Manual-load microfocus tube with oblique viewing for rework verification and failure analysis; sub-µm feature recognition on BGA slices.",
            standards: ["IPC-7095"],
          },
        ],
      },
      {
        id: "router",
        label: "Depanelization · Routing",
        detail:
          "Panelised boards are singulated on a CNC router — vacuum-clamped, a high-speed spindle follows a toolpath that cuts breakouts in multiple stepped passes to keep laminate stress below its micro-crack threshold. Dust extraction plus ionised air protect reflowed joints from ESD and debris. Each routed board is scanned into MES by its own barcode and handed off to PTH.",
        standards: ["IPC-2581", "IPC-7711", "IPC-A-610"],
        machines: [
          {
            brand: "GETech",
            model: "CNC Depanel Router",
            shape: "router",
            function: "PCB depaneling router (focus)",
            how: "60 000 rpm spindle on a granite gantry with vision-guided toolpaths; stepped passes cut tab-routed boards with sub-0.05 mm kerf drift and integrated dust extraction.",
            standards: ["IPC-2581", "IPC-7711"],
          },
          {
            brand: "ASM",
            model: "Genesis",
            shape: "router",
            function: "Depanel router",
            how: "Dual-table depaneler with auto-tool-change and laser tool-length check; supports tab-route and V-score routing in the same program.",
            standards: ["IPC-2581"],
          },
        ],
      },
    ],
  },
  {
    key: "pth",
    label: "PTH",
    desc: "Form → insert → selective → wave → wash → rework.",
    overview:
      "Leaded components — connectors, transformers, relays, high-current modules — go into plated through-holes. The cell runs lead-forming, operator-assisted stuffing, selective or full-nitrogen wave soldering, an optional aqueous wash and a dedicated rework bay. Every pot chemistry, wave profile and nozzle dwell is logged per board so a joint defect traces back to its pot shift.",
    Icon: PthIcon,
    subStages: [
      {
        id: "form",
        label: "Lead Prep · Forming",
        detail:
          "Axial and radial through-hole parts are cut-and-formed on programmable lead benders — pitch, standoff, body position and crop length all to drawing. Stress-sensitive bodies (tantalums, MLCCs, glass-body diodes, crystals) form on soft-jaw dies that protect the lead-body interface. Formed parts return to job kits bar-coded per line item.",
        standards: ["IPC-A-610", "IPC-7711"],
        machines: [
          {
            brand: "Olamef",
            model: "TP/6-D",
            shape: "selective",
            function: "Axial / radial lead former",
            how: "Cam-driven forming dies cut and bend leads to programmable pitch, standoff and crop; bandoliered axial parts run continuously through the head.",
            standards: ["IPC-A-610"],
          },
          {
            brand: "Hepco",
            model: "GP/1",
            shape: "selective",
            function: "Manual lead former",
            how: "Bench former with interchangeable dies for axial, radial and PTH standoff geometries — engineering builds and low-volume rework.",
            standards: ["IPC-A-610"],
          },
        ],
      },
      {
        id: "insert",
        label: "Insertion · Operator Stuffing",
        detail:
          "Formed leaded parts go into the plated holes at ESD-safe assist stations. A CAD-programmed laser light-show illuminates the next pad and bin, reach-sensors verify each pick, and the insertion sequence is optimised tall-to-short to keep the board level on the fixture. Leads are pre-clinched or left straight depending on the wave-solder profile and board thickness.",
        standards: ["IPC-A-610", "IPC-7711"],
        machines: [
          {
            brand: "Circuitronics",
            model: "LightGuide",
            shape: "probe",
            function: "Light-directed assembly",
            how: "Laser projector paints the active pad and bin for each step, with reach-sensor confirmation of every pick against the kitted carrier.",
            standards: ["IPC-A-610"],
          },
        ],
      },
      {
        id: "selective",
        label: "Selective Soldering",
        detail:
          "Low- / high-mix boards are soldered selectively: spray flux at programmed wet-time, IR + convection preheat to activate flux and drive off flash boil, then mini-wave nozzles dip precise pin arrays in N₂-blanketed SAC305. Nozzle dwell, drag and z-height are tuned per joint to meet the hole-fill and fillet spec without thermally shocking nearby SMT. Every board carries a solderability coupon for shift-level validation.",
        standards: ["J-STD-001", "IPC-A-610", "IPC-7711"],
        machines: [
          {
            brand: "Ersa",
            model: "Versaflow 4/55",
            shape: "selective",
            function: "Selective soldering (focus)",
            how: "Dual tool-change heads run spray-flux → IR preheat → dip-solder under N₂ with optical fiducial alignment and vision-based dip-height verification per board.",
            standards: ["J-STD-001", "IPC-A-610"],
          },
          {
            brand: "Pillarhouse",
            model: "Jade Pro XL",
            shape: "selective",
            function: "Selective soldering",
            how: "Servo-driven XYZ with interchangeable micro-nozzles; closed-loop solder level sensor and local N₂ shroud maintain a clean meniscus on each joint.",
            standards: ["J-STD-001"],
          },
        ],
      },
      {
        id: "wave",
        label: "Wave Soldering",
        detail:
          "Volume PTH and mixed-tech panels run a full nitrogen wave — foam / spray flux → multi-zone IR + bottom-convection preheat → chip-wave (turbulent) to wet fine pins, then smooth laminar wave to form fillets and shed bridges. Pot temperature, conveyor speed, wave height and N₂ flow are logged per board. Dross is skimmed on schedule and pot chemistry is sampled for Pb / Cu / Ag.",
        standards: ["J-STD-001", "J-STD-004", "IPC-A-610"],
        machines: [
          {
            brand: "Ersa",
            model: "POWERFLOW N2",
            shape: "wave",
            function: "Nitrogen wave solder (focus)",
            how: "Inerted tunnel with chip + smooth waves, servo pot-height and spray-flux dosing; residual-flux monitor gates board entry.",
            standards: ["J-STD-001", "J-STD-004"],
          },
          {
            brand: "Kurtz Ersa",
            model: "ECOWAVE",
            shape: "wave",
            function: "Lead-free wave",
            how: "Short-flame preheat and reduced-volume pot for lead-free alloys; automated flux density feedback keeps SAC wetting stable shift-over-shift.",
            standards: ["J-STD-001"],
          },
        ],
      },
      {
        id: "wash",
        label: "Flux Wash · DI Rinse",
        detail:
          "No-clean residues are left on most product. Cleaned product (medical / space / high-impedance RF) runs an inline aqueous washer — wash, DI rinse, blow-off, hot-air dry — with conductivity and TOC monitoring on the rinse loop. Post-wash coupons are ion-chromatographed to IPC-5704 limits to prove cleanliness before conformal coat.",
        standards: ["IPC-5704", "IPC-CH-65", "IPC-A-610"],
        machines: [
          {
            brand: "Aqueous Technologies",
            model: "Trident Zero-Discharge",
            shape: "dispenser",
            function: "Inline aqueous washer",
            how: "Multi-stage closed-loop washer with conductivity / resistivity monitors on every rinse bath; zero-discharge filtration keeps DI water in loop.",
            standards: ["IPC-5704", "IPC-CH-65"],
          },
        ],
      },
      {
        id: "rework",
        label: "Rework · Touch-up",
        detail:
          "AOI-flagged and inspection-flagged defects route to the rework bay. A top-side IR + convection head with bottom-side preheat lifts and replaces BGAs, QFPs and large QFNs under closed-loop thermocouple control; hand-solder stations handle PTH touch-up against a calibrated tip-profile recipe. Every reworked joint is re-inspected and re-stamped in MES with its operator and fixture.",
        standards: ["IPC-7711", "IPC-7721", "IPC-A-610"],
        machines: [
          {
            brand: "Ersa",
            model: "HR 550",
            shape: "rework",
            function: "BGA / SMD rework (focus)",
            how: "Closed-loop IR + convection top and bottom heat with thermocouple feedback, vision alignment and automated pick-and-replace of BGAs up to 55 mm.",
            standards: ["IPC-7711", "IPC-7721"],
          },
          {
            brand: "JBC",
            model: "JTSE-2Q",
            shape: "rework",
            function: "Hand-solder station",
            how: "Cartridge-tip soldering with per-tip temperature and sleep control; ESD-safe stands preserve tip life and keep the station on a calibrated profile.",
            standards: ["J-STD-001", "IPC-A-610"],
          },
        ],
      },
    ],
  },
  {
    key: "ict",
    label: "ICT + Test",
    desc: "ICT → flying probe → BScan → FCT → burn-in → final AOI.",
    overview:
      "A board that leaves assembly has to earn its serial number. The test cell sweeps every unit through in-circuit probing, JTAG boundary scan, functional exercise against real firmware, optional thermal burn-in and a final cosmetic AOI — with every parametric logged to MES per serial so the build history is auditable down to the nozzle that placed a part.",
    Icon: IctIcon,
    subStages: [
      {
        id: "ict",
        label: "In-Circuit Test",
        detail:
          "Boards land on a bed-of-nails wired to a Keysight i3070 or TRi cell. TestJet and VTEP fly the unpowered board for open-pin detection on connectors; analog vectors measure R / L / C in-circuit; digital vectors clock through logic and memory. Node access is kept above 95 % on new products — coverage gaps become DFT feedback for the next layout turn.",
        standards: ["IPC-9261", "IEEE 1149.1", "IPC-D-859"],
        machines: [
          {
            brand: "Keysight",
            model: "i3070 Series 5i",
            shape: "ict",
            function: "In-circuit tester (focus)",
            how: "Bed-of-nails with TestJet / VTEP for open-pin detection on unpowered parts; analog-digital vectors validate R/L/C and logic in-circuit with per-pin SPC.",
            standards: ["IPC-9261", "IEEE 1149.1"],
          },
          {
            brand: "TRi",
            model: "TR-518FE",
            shape: "ict",
            function: "High-mix ICT",
            how: "Pin-matrix architecture with universal fixture frames — cuts NPI fixture cost and holds >95 % node access on high-mix / low-volume jobs.",
            standards: ["IPC-9261"],
          },
          {
            brand: "Teradyne",
            model: "TestStation LH",
            shape: "ict",
            function: "Mixed-signal ICT",
            how: "Combinational / MDA testing with analog stim-measure per pin for high node-count power and RF product.",
            standards: ["IPC-9261"],
          },
        ],
      },
      {
        id: "flying",
        label: "Flying Probe",
        detail:
          "NPI, prototypes and low-volume jobs run fixtureless on a four- to eight-probe flying-probe cell. Vision guides each probe to the pad centroid; a test plan generated from the CAD netlist exercises nodes without a fixture. We use it to debug ICT coverage gaps before a bed-of-nails is cut, and as a production gate for jobs where fixture amortisation is impossible.",
        standards: ["IPC-9261", "IPC-2221"],
        machines: [
          {
            brand: "Takaya",
            model: "APT-1400FE",
            shape: "probe",
            function: "Flying-probe tester (focus)",
            how: "Four independent top-side probes with optional bottom probes; vision-centred pad contact and CAD-driven test-plan generation.",
            standards: ["IPC-9261"],
          },
          {
            brand: "SPEA",
            model: "4060",
            shape: "probe",
            function: "Dual-side flying probe",
            how: "8-probe head split 4 top / 4 bottom with on-probe digital channels for in-circuit boundary scan on fine-pitch nodes.",
            standards: ["IPC-9261"],
          },
        ],
      },
      {
        id: "bscan",
        label: "Boundary Scan · JTAG",
        detail:
          "Parts on nodes ICT can't reach — BGAs, fine-pitch QFNs under shields, dense inner layers — are tested through IEEE-1149.1 boundary scan. A harness clocks vectors into the JTAG chain, validating net continuity and programming flash / CPLD / FPGA images in-line. ICT coverage plus scan coverage defines our total test-access score per board.",
        standards: ["IEEE 1149.1", "IEEE 1149.6", "IPC-9261"],
        machines: [
          {
            brand: "JTAG Technologies",
            model: "ProVision + DataBlaster",
            shape: "fct",
            function: "Boundary-scan controller (focus)",
            how: "CAD-imported netlist auto-generates interconnect vectors; DataBlaster stimulator programs flash / FPGA images over JTAG at production speed.",
            standards: ["IEEE 1149.1", "IEEE 1149.6"],
          },
          {
            brand: "XJTAG",
            model: "XJLink2",
            shape: "fct",
            function: "JTAG chain controller",
            how: "USB JTAG pod with CAD-aware fault diagnosis — points to the failing pin-pair, not just the failing vector.",
            standards: ["IEEE 1149.1"],
          },
        ],
      },
      {
        id: "fct",
        label: "Functional Test",
        detail:
          "A board that passes ICT and JTAG still has to do its job: the functional cell powers the UUT on rails, exercises its real firmware, and validates I/O against a golden reference. Python / LabVIEW sequencers on a NI PXI platform or custom harness drive the real interfaces (I²C, SPI, CAN, RS-485, analog) and log every parametric to MES. This is the gate where a design bug hides, not a process bug.",
        standards: ["ISO 9001", "Customer-spec", "IPC-A-610"],
        machines: [
          {
            brand: "In-house",
            model: "FCT Harness",
            shape: "fct",
            function: "Custom functional fixture (focus)",
            how: "Per-product pogo-pin fixture plus DUT-interface PCB with Python / LabVIEW runner; parametric pass/fail streamed to MES with serial-level traceability.",
            standards: ["ISO 9001"],
          },
          {
            brand: "National Instruments",
            model: "PXIe-1085",
            shape: "fct",
            function: "PXI test platform",
            how: "Modular PXIe chassis housing DMM, scope, source-meter and digital IO; TestStand sequences run test steps with per-result limits and live SPC.",
            standards: ["ISO 9001"],
          },
        ],
      },
      {
        id: "burn",
        label: "Burn-in · Environmental",
        detail:
          "Power, thermal and automotive product is screened for infant-mortality failures in a thermal chamber: units on powered shelves cycle through the customer's thermal profile (typically −40 → +85 °C, up to +125 °C for AEC-Q100 stress screens) while FCT runs in-chamber. Burn-in failures correlate to weak solder voids or marginal silicon — both caught before shipment.",
        standards: ["JESD22-A104", "AEC-Q100", "IPC-9592"],
        machines: [
          {
            brand: "ESPEC",
            model: "Platinous SH-662",
            shape: "oven",
            function: "Thermal-cycle chamber",
            how: "−70 to +180 °C range with programmable ramp; powered shelves let the DUT run firmware under the full thermal envelope.",
            standards: ["JESD22-A104"],
          },
          {
            brand: "Weiss Technik",
            model: "ClimeEvent",
            shape: "oven",
            function: "Temperature + humidity chamber",
            how: "Wet-bulb / dry-bulb control for 85/85 and HAST screens on critical dielectric and sealed product.",
            standards: ["JESD22-A101"],
          },
        ],
      },
      {
        id: "fai",
        label: "Final AOI · Cosmetic",
        detail:
          "Immediately before conformal coat, every board is imaged top and bottom one last time: bridges from rework, missed parts, mechanical damage from fixture contact, missing labels / barcodes and residual contamination are flagged here. Serial numbers are read and bound to the test-pass record in MES so the unit is traceable to its full process history.",
        standards: ["IPC-A-610", "IPC-9252"],
        machines: [
          {
            brand: "Saki",
            model: "BF-X3",
            shape: "inspection",
            function: "3D final AOI (focus)",
            how: "Multi-angle 3D plus colour cameras close the cosmetic loop before coating; SMEMA-handshake inline with optional rework diversion.",
            standards: ["IPC-A-610"],
          },
          {
            brand: "Mek",
            model: "iSpector S1",
            shape: "inspection",
            function: "Bench AOI",
            how: "Table-top inspection with CAD overlay for low-volume and post-rework re-inspection.",
            standards: ["IPC-A-610"],
          },
        ],
      },
    ],
  },
  {
    key: "coat",
    label: "Conformal Coat",
    desc: "Mask → plasma → coat → cure → verify coverage.",
    overview:
      "A thin protective film of acrylic, polyurethane or silicone is laid down over the assembly to block moisture, dust, fungus and condensation. The cell masks every keep-out, plasma-activates the surface, selectively dispenses coat to CAD-bounded zones, cures under UV / thermal / moisture profile per chemistry, then UV-fluorescence-inspects every board for pinholes, runs and missed zones before pack-out.",
    Icon: CoatIcon,
    subStages: [
      {
        id: "mask",
        label: "Masking · Pre-coat Prep",
        detail:
          "Connectors, test points, LEDs, pots and labelled keep-outs get masked before coat. Latex boots on D-sub shells, peelable latex paint on test pads, polyimide tape on fine-pitch connectors; every masked feature is logged against a per-product keep-out drawing. A dry cabinet holds masked units at ≤ 10 % RH to keep moisture from getting trapped under the film.",
        standards: ["IPC-CC-830", "IPC-A-610", "J-STD-033"],
        machines: [
          {
            brand: "Techspray",
            model: "Wondermask W",
            shape: "dispenser",
            function: "Peelable latex mask",
            how: "Water-based peelable mask — brushes on wet, cures at room temp, peels clean post-cure with no chemical residue.",
            standards: ["IPC-CC-830"],
          },
          {
            brand: "3M",
            model: "Kapton 5413",
            shape: "dispenser",
            function: "Polyimide masking tape",
            how: "Silicone-adhesive polyimide tape — 260 °C-tolerant — for fine-pitch connector masking that survives UV and thermal cure.",
            standards: ["IPC-CC-830"],
          },
        ],
      },
      {
        id: "plasma",
        label: "Plasma Activation",
        detail:
          "Before coat, boards pass through a plasma chamber: low-pressure O₂ or Ar plasma strips organic contamination off pads and connectors and raises surface energy on laminate and solder mask so the coating wets properly. Contact-angle coupons are run per shift — if wetting drops below spec the chamber is serviced before any product is coated.",
        standards: ["IPC-CC-830", "ASTM D2578"],
        machines: [
          {
            brand: "Nordson MARCH",
            model: "PX-500",
            shape: "oven",
            function: "Plasma surface treatment (focus)",
            how: "Low-pressure RF plasma chamber with O₂ / Ar / N₂ process gases, closed-loop pressure and RF-power control and a per-product recipe.",
            standards: ["IPC-CC-830"],
          },
        ],
      },
      {
        id: "dispense",
        label: "Selective Coating",
        detail:
          "Acrylic (AR), polyurethane (UR) or silicone (SR) coat is applied selectively by atomising, film-coat and needle valves — CAD-imported keep-outs bound every stroke. Wet-film thickness is gauged on coupons per shift; programmable z-height tracking follows board warpage so film stays uniform at the edges, not just the centre. A nitrogen blanket suppresses oxygen inhibition on UV-cure chemistries.",
        standards: ["IPC-CC-830", "IPC-HDBK-830", "IPC-A-610"],
        machines: [
          {
            brand: "Nordson Asymtek",
            model: "Select Coat SL-940E",
            shape: "dispenser",
            function: "Selective conformal coater (focus)",
            how: "Gantry coater with interchangeable film-coat / atomiser / needle valves; CAD-to-recipe link, vision fiducial alignment and laser height-follow compensate board warpage.",
            standards: ["IPC-CC-830", "IPC-A-610"],
          },
          {
            brand: "PVA",
            model: "PVA 650",
            shape: "dispenser",
            function: "Bench-top dispense",
            how: "Compact gantry with swappable valves for film, bead and dot coating — engineering builds and low-volume runs.",
            standards: ["IPC-CC-830"],
          },
        ],
      },
      {
        id: "cure",
        label: "Cure · UV / Thermal",
        detail:
          "UV-cure coatings cure in seconds under 365 nm LED arrays; moisture-cure urethanes cure in a controlled-humidity tunnel for hours; thermal-cure silicones run a programmed oven ramp. Cure state is verified with pencil-hardness or solvent-rub coupons per shift — an under-cured film fails contact angle and wear on the next product turn.",
        standards: ["IPC-CC-830", "ASTM D3363"],
        machines: [
          {
            brand: "Dymax",
            model: "BlueWave QX4",
            shape: "lamp",
            function: "UV LED spot-cure (focus)",
            how: "High-intensity 365 nm LED wand for point-cure on UV-cure acrylics and adhesives; closed-loop radiometric feedback on the cure log.",
            standards: ["IPC-CC-830"],
          },
          {
            brand: "Heraeus Noblelight",
            model: "UV Cure Tunnel",
            shape: "lamp",
            function: "Inline UV / IR oven",
            how: "Conveyorised UV plus IR cure with optional inert atmosphere; time-at-temp tuned per material TDS.",
            standards: ["IPC-CC-830"],
          },
          {
            brand: "Despatch",
            model: "LCC-227",
            shape: "oven",
            function: "Bench cure oven",
            how: "Forced-convection oven for thermal-cure silicones and polyurethanes with programmable ramp-soak and data-logged recipe.",
            standards: ["IPC-CC-830"],
          },
        ],
      },
      {
        id: "verify",
        label: "Coverage Inspection",
        detail:
          "UV tracers in the coat make a fluorescence-black-light inspection possible: every keep-out is verified clear, every coverage zone verified solid, no runs, no pulls, no pinholes. Operator or AOI flags misses back to selective coat where the recipe is edited and the unit is re-processed. Accepted units are serialised into the coated-inventory bin for pack-out.",
        standards: ["IPC-CC-830", "IPC-A-610"],
        machines: [
          {
            brand: "Mycronic",
            model: "MY600 Coating-Inspect",
            shape: "inspection",
            function: "UV-fluorescence inspection (focus)",
            how: "UV-LED flood plus colour camera highlights coating fluorescence against bare laminate; CAD-compared coverage map per board.",
            standards: ["IPC-CC-830"],
          },
          {
            brand: "Nordson Asymtek",
            model: "ACCEL CC-200",
            shape: "inspection",
            function: "Inline coat AOI",
            how: "Camera + UV-LED ring inspects the coated board at line speed with CAD-driven coverage maps and per-zone pass/fail.",
            standards: ["IPC-CC-830"],
          },
        ],
      },
    ],
  },
];

/* ---------------------------- tracks (top-level) -------------------------- */

const TRACKS: Track[] = [
  {
    id: "process",
    label: "Process Technician",
    subtitle: "PCBA / SMT manufacturing line",
    intro:
      "How a PCB travels through the line I operate — click any stage to zoom in and see the devices that live on it.",
    stages: PROCESS_STAGES,
  },
  {
    id: "software",
    label: "Software Engineer",
    subtitle: "Backend · .NET / Python · cloud-native",
    intro:
      "The backend loop I ran at Javanan Sharq and Raimo Studio — click any stage to zoom in on how intent becomes a running, observed service.",
    stages: SOFTWARE_STAGES,
  },
  {
    id: "hardware",
    label: "Hardware Maintenance",
    subtitle: "Corrective · preventive · reliability",
    intro:
      "The corrective-and-preventive loop from Vapayesh Sanaat Fars and the maintenance side of the SolarEdge line — click any stage to zoom in on how a machine goes from down to provably back in spec.",
    stages: HARDWARE_STAGES,
  },
];

/* --------------------------- top-level component -------------------------- */

export function WorkflowSection() {
  const [activeTrackId, setActiveTrackId] = useState<TrackId>("process");
  const activeTrack = TRACKS.find((t) => t.id === activeTrackId) ?? TRACKS[0];
  const stages = activeTrack.stages;

  const [focusKey, setFocusKey] = useState<string | null>(null);
  const focusIndex = focusKey ? stages.findIndex((s) => s.key === focusKey) : -1;
  const focusStage = focusIndex >= 0 ? stages[focusIndex] : null;
  const prevStage = focusIndex > 0 ? stages[focusIndex - 1] : null;
  const nextStage =
    focusIndex >= 0 && focusIndex < stages.length - 1
      ? stages[focusIndex + 1]
      : null;

  // While a stage is focused, pause PageShell navigation and remap arrow keys
  // to stage-prev / stage-next so user can carousel through the line.
  useEffect(() => {
    if (!focusKey) return;
    document.body.dataset.modalOpen = "true";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFocusKey(null);
      } else if (e.key === "ArrowLeft" && focusIndex > 0) {
        e.preventDefault();
        setFocusKey(stages[focusIndex - 1].key);
      } else if (e.key === "ArrowRight" && focusIndex < stages.length - 1) {
        e.preventDefault();
        setFocusKey(stages[focusIndex + 1].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.modalOpen;
      window.removeEventListener("keydown", onKey);
    };
  }, [focusKey, focusIndex, stages]);

  // Switching tracks while focused would desync the keyboard handler — just
  // close the overlay on track change.
  const handleTrackChange = (id: TrackId) => {
    setFocusKey(null);
    setActiveTrackId(id);
  };

  return (
    <div className="relative h-full w-full">
      {/* Overview layer: always mounted (kept under the focused overlay)
          so the cinema's belt, spotlight, and slide clock keep their
          state on every back/forth. No datasheet chrome here — this
          section plays as a full-bleed presentation. */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          focusStage ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <WorkLifeCinema
          tracks={TRACKS}
          track={activeTrack}
          onTrackChange={handleTrackChange}
          onExplore={setFocusKey}
        />
      </div>

      {/* Focused overlay — fills the same section slot, no datasheet
          chrome (the focused panel is its own thing with rails). */}
      <AnimatePresence>
        {focusStage && (
          <FocusedLayout
            key={`${activeTrack.id}-${focusStage.key}`}
            stages={stages}
            stage={focusStage}
            index={focusIndex}
            prev={prevStage}
            next={nextStage}
            onFocusChange={setFocusKey}
            onClose={() => setFocusKey(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ focused view ----------------------------- */

function FocusedLayout({
  stages,
  stage,
  index,
  prev,
  next,
  onFocusChange,
  onClose,
}: {
  stages: Stage[];
  stage: Stage;
  index: number;
  prev: Stage | null;
  next: Stage | null;
  onFocusChange: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute inset-0 flex flex-col"
    >
      {/* No in-section top chrome — the page header at the top of the
          viewport is the only thing visible above; the terminal bar at the
          bottom is the only thing visible below. The focused panel fills
          everything in between, flanked only by narrow prev/next rails. */}
      <div className="relative grid flex-1 grid-cols-[2.25rem_1fr_2.25rem] gap-2 overflow-hidden sm:grid-cols-[2.75rem_1fr_2.75rem] sm:gap-3 md:grid-cols-[3rem_1fr_3rem]">
        <NavRail
          stage={prev}
          index={index - 1}
          direction="left"
          onClick={prev ? () => onFocusChange(prev.key) : undefined}
        />

        <ExpandedPanel
          stages={stages}
          stage={stage}
          index={index}
          prev={prev}
          next={next}
          onFocusChange={onFocusChange}
          onClose={onClose}
        />

        <NavRail
          stage={next}
          index={index + 1}
          direction="right"
          onClick={next ? () => onFocusChange(next.key) : undefined}
        />
      </div>
    </motion.div>
  );
}

/* ----------------------------- nav rail strip ---------------------------- */

function NavRail({
  stage,
  index,
  direction,
  onClick,
}: {
  stage: Stage | null;
  index: number;
  direction: "left" | "right";
  onClick?: () => void;
}) {
  // Empty placeholder so the 3-column grid stays balanced when there is no
  // previous (first stage) or next (last stage) to navigate to.
  if (!stage || !onClick) {
    return <div aria-hidden />;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${direction === "left" ? "Previous" : "Next"}: ${stage.label}`}
      aria-label={`${direction === "left" ? "Previous" : "Next"}: ${stage.label}`}
      className="glass specular group relative flex h-full w-full flex-col items-center justify-center gap-3 py-3 opacity-60 transition-all duration-300 hover:bg-white/[0.04] hover:opacity-100"
    >
      <span className="font-mono text-[9px] tracking-wider text-(--color-foreground-subtle)">
        0{index + 1}
      </span>
      <ArrowIcon
        className={`h-5 w-5 text-(--color-foreground-muted) transition-colors group-hover:text-(--color-accent-3) ${
          direction === "left" ? "rotate-180" : ""
        }`}
      />
      <span
        className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-(--color-foreground-muted) transition-colors group-hover:text-white sm:inline"
        style={{ writingMode: "vertical-rl" }}
      >
        {stage.label}
      </span>
      <span className="font-mono text-[8px] uppercase tracking-wider text-(--color-foreground-subtle)">
        {direction === "left" ? "prev" : "next"}
      </span>
    </button>
  );
}

/* -------------------------- expanded stage panel ------------------------- */

function ExpandedPanel({
  stages,
  stage,
  index,
  prev,
  next,
  onFocusChange,
  onClose,
}: {
  stages: Stage[];
  stage: Stage;
  index: number;
  prev: Stage | null;
  next: Stage | null;
  onFocusChange: (key: string) => void;
  onClose: () => void;
}) {
  const hasFlow = Boolean(stage.subStages && stage.subStages.length > 0);
  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden ${
        hasFlow ? "" : "glass glass-solid specular"
      }`}
    >
      {/* Floating close button — keeps the section's top edge clear of any
          standing chrome bar, so above the panel the only thing visible is
          the page header. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close stage detail"
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-(--color-foreground-muted) backdrop-blur-sm transition hover:bg-white/[0.12] hover:text-white sm:right-3 sm:top-3"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>

      <header
        className={
          hasFlow
            ? "flex items-center gap-4 pb-3 pr-10"
            : "flex items-center gap-4 border-b border-white/10 px-6 py-4 pr-12 md:px-7 md:py-5"
        }
      >
        <span className="font-mono text-xs tracking-wider text-(--color-foreground-subtle)">
          0{index + 1}
        </span>
        <div className="text-(--color-accent-3)">
          <stage.Icon width={36} height={36} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold md:text-3xl">
            <span className="accent-gradient-text">{stage.label}</span>
          </h2>
          <p className="truncate text-xs text-(--color-foreground-subtle) md:text-sm">
            {stage.desc}
          </p>
        </div>
        {/* Slim inline breadcrumb — only on wide viewports, so it never
            steals a row from the top edge. */}
        <nav
          aria-label="Stage breadcrumb"
          className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-wider lg:flex"
        >
          {stages.map((s, i) => (
            <Fragment key={s.key}>
              {i > 0 && <span className="text-(--color-foreground-subtle)">›</span>}
              <button
                type="button"
                onClick={() => onFocusChange(s.key)}
                className={
                  s.key === stage.key
                    ? "text-white"
                    : "text-(--color-foreground-subtle) transition hover:text-(--color-foreground-muted)"
                }
              >
                {s.label.toUpperCase()}
              </button>
            </Fragment>
          ))}
        </nav>
      </header>

      <div
        className={
          hasFlow
            ? "no-scrollbar fade-y flex-1 overflow-y-auto pr-1"
            : "no-scrollbar fade-y flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6"
        }
      >
        {hasFlow ? (
          <SubStageFlow stage={stage} prev={prev} next={next} />
        ) : (
          <FlatMachinesLayout stage={stage} />
        )}
      </div>
    </div>
  );
}

/* ----------------------- flat (single-paragraph) view -------------------- */

function FlatMachinesLayout({ stage }: { stage: Stage }) {
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-sm leading-relaxed text-(--color-foreground-muted) md:text-base">
        {stage.overview}
      </p>
      {stage.machines && stage.machines.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-foreground-subtle)">
            Devices on this line
          </h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stage.machines.map((m) => (
              <MachineCard key={`${m.brand}-${m.model}`} machine={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------- vertical sub-stage flow ------------------------- */

function SubStageFlow({
  stage,
  prev,
  next,
}: {
  stage: Stage;
  prev: Stage | null;
  next: Stage | null;
}) {
  return (
    <div className="w-full">
      <p className="mb-5 max-w-3xl text-sm leading-relaxed text-(--color-foreground-muted) md:text-base">
        {stage.overview}
      </p>
      {prev && <FlowBand direction="incoming" stage={prev} />}
      {stage.subStages!.map((ss, i) => (
        <Fragment key={ss.id}>
          <SubStageRow index={i} sub={ss} />
          {i < stage.subStages!.length - 1 && <FlowArrow />}
        </Fragment>
      ))}
      {next && <FlowBand direction="outgoing" stage={next} />}
    </div>
  );
}

function FlowBand({
  direction,
  stage,
}: {
  direction: "incoming" | "outgoing";
  stage: Stage;
}) {
  const incoming = direction === "incoming";
  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--color-foreground-subtle) ${
        incoming ? "mb-3" : "mt-3"
      }`}
    >
      <span className="text-(--color-accent-3)">
        <stage.Icon width={18} height={18} />
      </span>
      <span className="truncate">
        {incoming ? "Incoming from" : "Handoff to"} · {stage.label}
      </span>
      <span className="ml-auto text-(--color-foreground-subtle)">▽</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex flex-col items-center py-1.5" aria-hidden>
      <span className="h-5 w-px bg-white/15" />
      <svg viewBox="0 0 10 10" width={10} height={10} className="text-white/30">
        <path
          d="M1 3 L5 7 L9 3"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SubStageRow({ index, sub }: { index: number; sub: SubStage }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_20rem] lg:gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="glass glass-sm relative flex flex-col gap-2 p-3 sm:gap-2.5 sm:p-4 md:p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-wider text-(--color-foreground-subtle)">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="text-sm font-semibold md:text-base">{sub.label}</h4>
        </div>
        <p className="text-[11.5px] leading-relaxed text-(--color-foreground-muted) sm:text-[12px] md:text-[13px]">
          {sub.detail}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sub.standards.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-(--color-foreground-subtle)"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      {sub.machines && sub.machines.length > 0 && (
        <div className="flex flex-col gap-2">
          {sub.machines.map((m) => (
            <MiniMachineCard key={`${m.brand}-${m.model}`} machine={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniMachineCard({ machine }: { machine: Machine }) {
  const Shape = MACHINE_SHAPES[machine.shape];
  const isFocus = machine.function.includes("(focus)");
  const cleanFunction = machine.function.replace(" (focus)", "");
  return (
    <div
      className={`glass glass-sm relative flex items-start gap-3 p-3 ${
        isFocus ? "ring-1 ring-(--color-accent-3)/40" : ""
      }`}
    >
      <div className="shrink-0 text-(--color-accent-3)">
        <Shape width={30} height={30} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold leading-tight">
          {machine.brand}{" "}
          <span className="font-mono text-[10px] text-(--color-accent)">
            {machine.model}
          </span>
          {isFocus && (
            <span className="ml-1 font-mono text-[9px] uppercase tracking-wider text-(--color-accent-3)">
              · focus
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-(--color-foreground-muted)">
          {cleanFunction}
        </p>
        <p className="mt-1 text-[10px] leading-snug text-(--color-foreground-subtle)">
          {machine.how}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- machine card ---------------------------- */

function MachineCard({ machine }: { machine: Machine }) {
  const Shape = MACHINE_SHAPES[machine.shape];
  return (
    <div className="glass glass-sm relative flex flex-col gap-2.5 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-(--color-accent-3)">
          <Shape width={38} height={38} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{machine.brand}</p>
          <p className="font-mono text-[11px] text-(--color-accent)">{machine.model}</p>
        </div>
      </div>
      <p className="text-xs font-medium text-(--color-foreground)">
        {machine.function}
      </p>
      <p className="text-[11px] leading-relaxed text-(--color-foreground-muted)">
        {machine.how}
      </p>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {machine.standards.map((s) => (
          <span
            key={s}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-(--color-foreground-subtle)"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- minimal shape icons (stages) -------------------- */

function baseProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 40 40",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function WarehouseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 16 L20 6 L35 16" />
      <path d="M7 16 V34 H33 V16" />
      <rect x="14" y="22" width="12" height="10" />
      <line x1="14" y1="27" x2="26" y2="27" />
      <line x1="20" y1="22" x2="20" y2="32" />
    </svg>
  );
}

function SmtIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="12" y="12" width="16" height="16" rx="1.5" />
      <circle cx="15.5" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
      <line x1="15" y1="12" x2="15" y2="8" />
      <line x1="20" y1="12" x2="20" y2="8" />
      <line x1="25" y1="12" x2="25" y2="8" />
      <line x1="15" y1="28" x2="15" y2="32" />
      <line x1="20" y1="28" x2="20" y2="32" />
      <line x1="25" y1="28" x2="25" y2="32" />
      <line x1="12" y1="15" x2="8" y2="15" />
      <line x1="12" y1="20" x2="8" y2="20" />
      <line x1="12" y1="25" x2="8" y2="25" />
      <line x1="28" y1="15" x2="32" y2="15" />
      <line x1="28" y1="20" x2="32" y2="20" />
      <line x1="28" y1="25" x2="32" y2="25" />
    </svg>
  );
}

function PthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <line x1="4" y1="28" x2="36" y2="28" />
      <rect x="10" y="10" width="20" height="11" rx="2" />
      <line x1="14" y1="21" x2="14" y2="32" />
      <line x1="26" y1="21" x2="26" y2="32" />
      <circle cx="14" cy="28" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="26" cy="28" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IctIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="5" y="24" width="30" height="10" rx="1.2" />
      <line x1="12" y1="24" x2="12" y2="12" />
      <line x1="20" y1="24" x2="20" y2="7" />
      <line x1="28" y1="24" x2="28" y2="14" />
      <circle cx="12" cy="11" r="1.4" />
      <circle cx="20" cy="6" r="1.4" />
      <circle cx="28" cy="13" r="1.4" />
      <circle cx="12" cy="29" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="20" cy="29" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="28" cy="29" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CoatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="5" y="26" width="30" height="9" rx="1.2" />
      <path d="M17 7 H23 V14 H17 Z" />
      <line x1="20" y1="14" x2="20" y2="17" />
      <path d="M20 17 L13 25" />
      <path d="M20 17 L27 25" />
      <circle cx="14" cy="23" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="21" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="26" cy="23" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------------------- minimal shape icons (machines) ------------------- */

function PlacerShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* gantry rails */}
      <line x1="6" y1="10" x2="34" y2="10" />
      <line x1="6" y1="10" x2="6" y2="16" />
      <line x1="34" y1="10" x2="34" y2="16" />
      {/* head + nozzle */}
      <rect x="17" y="8" width="6" height="6" />
      <line x1="20" y1="14" x2="20" y2="22" />
      <circle cx="20" cy="24" r="1.4" fill="currentColor" stroke="none" />
      {/* pcb + parts */}
      <rect x="6" y="30" width="28" height="4" rx="0.6" />
      <rect x="10" y="26" width="4" height="4" />
      <rect x="26" y="26" width="4" height="4" />
    </svg>
  );
}

function PrinterShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* squeegee bar */}
      <rect x="5" y="10" width="30" height="3" rx="1" />
      {/* stencil */}
      <rect x="6" y="18" width="28" height="10" />
      <circle cx="12" cy="23" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="23" r="1" fill="currentColor" stroke="none" />
      <circle cx="22" cy="23" r="1" fill="currentColor" stroke="none" />
      <circle cx="27" cy="23" r="1" fill="currentColor" stroke="none" />
      {/* pcb */}
      <rect x="6" y="30" width="28" height="4" rx="0.5" />
    </svg>
  );
}

function OvenShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* tunnel */}
      <rect x="4" y="12" width="32" height="18" rx="1.5" />
      {/* conveyor line */}
      <line x1="4" y1="27" x2="36" y2="27" />
      {/* zones (heat curves) */}
      <path d="M9 22 Q 11 17 13 22" />
      <path d="M17 22 Q 19 17 21 22" />
      <path d="M25 22 Q 27 17 29 22" />
      {/* board */}
      <rect x="14" y="26" width="12" height="2" />
    </svg>
  );
}

function InspectionShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* camera body */}
      <rect x="12" y="6" width="16" height="10" rx="1.5" />
      {/* lens */}
      <circle cx="20" cy="12" r="2.5" />
      <circle cx="20" cy="12" r="0.8" fill="currentColor" stroke="none" />
      {/* focus cone */}
      <line x1="15" y1="16" x2="10" y2="26" strokeDasharray="1.2 2" />
      <line x1="25" y1="16" x2="30" y2="26" strokeDasharray="1.2 2" />
      {/* pcb */}
      <rect x="6" y="28" width="28" height="5" rx="0.5" />
    </svg>
  );
}

function WaveShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* pcb */}
      <rect x="6" y="10" width="28" height="5" rx="0.5" />
      {/* waves */}
      <path d="M4 24 Q 10 18 16 24 T 28 24 T 36 24" />
      <path d="M4 30 Q 10 24 16 30 T 28 30 T 36 30" />
    </svg>
  );
}

function SelectiveShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* nozzle */}
      <path d="M16 6 H24 V14 L20 20 L16 14 Z" />
      {/* droplet */}
      <circle cx="20" cy="24" r="1.6" fill="currentColor" stroke="none" />
      {/* pcb */}
      <rect x="5" y="28" width="30" height="5" rx="0.5" />
      {/* pads */}
      <circle cx="14" cy="30.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="20" cy="30.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="26" cy="30.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ReworkShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* wand body */}
      <rect x="24" y="5" width="6" height="14" rx="1" />
      {/* wand tip */}
      <path d="M24 19 L19 24" />
      {/* hot-air curves */}
      <path d="M9 22 Q 14 20 18 25" />
      <path d="M7 27 Q 13 25 17 28" />
      {/* pcb */}
      <rect x="5" y="30" width="30" height="4" rx="0.5" />
    </svg>
  );
}

function IctMachineShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* pcb */}
      <rect x="7" y="10" width="26" height="6" rx="0.5" />
      {/* pins */}
      <line x1="11" y1="16" x2="11" y2="28" />
      <line x1="15" y1="16" x2="15" y2="30" />
      <line x1="20" y1="16" x2="20" y2="28" />
      <line x1="25" y1="16" x2="25" y2="30" />
      <line x1="29" y1="16" x2="29" y2="28" />
      {/* fixture base */}
      <rect x="5" y="30" width="30" height="4" rx="0.5" />
    </svg>
  );
}

function ProbeShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* arm */}
      <line x1="8" y1="6" x2="20" y2="6" />
      {/* probe shaft */}
      <line x1="20" y1="6" x2="20" y2="22" />
      {/* probe tip */}
      <path d="M17 20 L20 26 L23 20 Z" fill="currentColor" stroke="none" />
      {/* pcb */}
      <rect x="6" y="28" width="28" height="5" rx="0.5" />
      {/* test pad */}
      <circle cx="20" cy="30.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FctShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* tester box */}
      <rect x="5" y="10" width="14" height="14" rx="1" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <rect x="12" y="13" width="5" height="2" />
      <rect x="8" y="18" width="9" height="2" rx="0.5" />
      {/* cable */}
      <path d="M19 16 Q 28 16 28 26 Q 28 32 24 32" />
      {/* dut */}
      <rect x="22" y="30" width="12" height="4" rx="0.5" />
    </svg>
  );
}

function DispenserShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* reservoir */}
      <rect x="16" y="4" width="8" height="11" rx="1" />
      {/* taper */}
      <path d="M17 15 L20 22 L23 15 Z" />
      {/* droplet */}
      <circle cx="20" cy="25" r="1.3" fill="currentColor" stroke="none" />
      {/* pcb */}
      <rect x="5" y="30" width="30" height="4" rx="0.5" />
    </svg>
  );
}

function LampShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* bulb */}
      <path d="M15 8 Q 20 4 25 8 Q 27 14 23 18 H17 Q 13 14 15 8 Z" />
      {/* filament */}
      <path d="M17 13 Q 20 15 23 13" />
      {/* base */}
      <rect x="17" y="18" width="6" height="3" />
      {/* rays */}
      <line x1="20" y1="24" x2="20" y2="30" />
      <line x1="14" y1="22" x2="10" y2="28" />
      <line x1="26" y1="22" x2="30" y2="28" />
    </svg>
  );
}

function RouterShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* spindle body */}
      <rect x="17" y="4" width="6" height="10" rx="1" />
      {/* collet */}
      <rect x="18" y="14" width="4" height="3" />
      {/* cutter flutes */}
      <line x1="19" y1="17" x2="19" y2="25" />
      <line x1="21" y1="17" x2="21" y2="25" />
      {/* cut line across panel */}
      <path d="M5 27 H35" strokeDasharray="1.6 1.6" />
      {/* singulated pcb halves */}
      <rect x="5" y="28" width="12" height="5" rx="0.5" />
      <rect x="23" y="28" width="12" height="5" rx="0.5" />
      {/* dust */}
      <circle cx="14" cy="24" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="26" cy="24" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XrayShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      {/* tube head */}
      <rect x="14" y="4" width="12" height="7" rx="1" />
      {/* x-ray cone */}
      <path d="M20 11 L14 22 L26 22 Z" />
      {/* dashed rays */}
      <line x1="18" y1="14" x2="18" y2="20" strokeDasharray="1 1.5" />
      <line x1="20" y1="13" x2="20" y2="21" strokeDasharray="1 1.5" />
      <line x1="22" y1="14" x2="22" y2="20" strokeDasharray="1 1.5" />
      {/* pcb + bga balls */}
      <rect x="5" y="25" width="30" height="5" rx="0.5" />
      <circle cx="11" cy="27.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="27.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="27.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="24.5" cy="27.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="29" cy="27.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MACHINE_SHAPES: Record<
  MachineShape,
  (props: SVGProps<SVGSVGElement>) => ReactElement
> = {
  placer: PlacerShape,
  printer: PrinterShape,
  oven: OvenShape,
  inspection: InspectionShape,
  wave: WaveShape,
  selective: SelectiveShape,
  rework: ReworkShape,
  ict: IctMachineShape,
  probe: ProbeShape,
  fct: FctShape,
  dispenser: DispenserShape,
  lamp: LampShape,
  router: RouterShape,
  xray: XrayShape,
};

/* ------------------------------- ui icons -------------------------------- */

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12 H18" />
      <path d="M13 6 L19 12 L13 18" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 6 L18 18" />
      <path d="M18 6 L6 18" />
    </svg>
  );
}
