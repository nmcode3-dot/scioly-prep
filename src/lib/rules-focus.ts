/**
 * Season-specific RULES FOCUS for Science Olympiad events.
 *
 * Many Science Olympiad events (Anatomy, Dynamic Planet, Astronomy, Chemistry
 * Lab, etc.) ROTATE their topic each season. Injecting the correct focus into
 * the AI prompt ensures generated questions match the official rules for that
 * season rather than asking generic questions.
 *
 * Keyed by season + event name. Lookups fall back to a generic focus when no
 * specific entry exists.
 *
 * Sources: official soinc.org season slates & rules-manual descriptions.
 * Always verify against the current official rules manual before tournaments.
 */

export type SeasonKey = "2025" | "2026" | "2027";

interface RuleFocus {
  /** The rotating topic / system focus for this event this season. */
  focus: string;
  /** Detailed guidance the AI uses to write accurate questions. */
  detail: string;
  /** Sample sub-topics to sample from (keeps questions varied). */
  topics: string[];
}

/** focus map: `${season}|${eventName}` -> RuleFocus */
const FOCUS: Record<string, RuleFocus> = {
  // ───────────────────────── ANATOMY & PHYSIOLOGY ─────────────────────────
  "2026|Anatomy & Physiology": {
    focus: "Nervous system, Sense Organs (special senses), and Endocrine system",
    detail:
      "This season's Anatomy & Physiology focuses on the human Nervous system (neurons, action potentials, brain/lobes, spinal cord, autonomic vs somatic), the Sense Organs / special senses (eye & vision, ear & hearing/balance, taste, smell), and the Endocrine system (glands, hormones, feedback loops, hypothalamus-pituitary axis).",
    topics: [
      "Neuron structure & action potentials",
      "Brain lobes & functions",
      "The eye & visual pathway",
      "Ear: hearing & vestibular sense",
      "Taste & smell chemoreception",
      "Endocrine glands & hormones",
      "Negative feedback & homeostasis",
      "Synapses & neurotransmitters",
    ],
  },
  "2025|Anatomy & Physiology": {
    focus: "Skeletal, Muscular, and Integumentary systems",
    detail:
      "This season's Anatomy & Physiology focuses on the human Skeletal system (bones, joints, axial vs appendicular), the Muscular system (muscle types, sliding filament theory, major muscles), and the Integumentary system (skin layers, appendages, thermoregulation).",
    topics: [
      "Bone structure & types",
      "Axial vs appendicular skeleton",
      "Joints & articulations",
      "Muscle types & sliding filament theory",
      "Major skeletal muscles",
      "Skin layers (epidermis, dermis, hypodermis)",
      "Thermoregulation & skin appendages",
      "Muscle contraction physiology",
    ],
  },
  "2027|Anatomy & Physiology": {
    focus: "Respiratory, Digestive, and Immune/Lymphatic systems (projected)",
    detail:
      "This projected season focuses on the human Respiratory system (airways, gas exchange, breathing mechanics), Digestive system (GI tract, enzymes, absorption), and Immune/Lymphatic systems (innate & adaptive immunity, lymph organs). Verify against official 2027 rules.",
    topics: [
      "Respiratory anatomy & gas exchange",
      "Breathing mechanics & control",
      "GI tract organs & enzymes",
      "Digestion & absorption",
      "Innate vs adaptive immunity",
      "Lymphatic system & lymph organs",
      "Antibodies & immune response",
    ],
  },

  // ───────────────────────── DYNAMIC PLANET ─────────────────────────
  "2026|Dynamic Planet": {
    focus: "Oceanography — physical and geological oceanography",
    detail:
      "This season's Dynamic Planet focuses on physical and geological OCEANOGRAPHY: ocean basin formation, seafloor spreading & plate tectonics, ocean currents (surface & thermohaline), waves & tides, seawater properties (salinity, density, temperature), coastal processes, and ocean circulation's role in climate.",
    topics: [
      "Ocean basin & seafloor features",
      "Plate tectonics & seafloor spreading",
      "Surface currents & gyres",
      "Thermohaline circulation",
      "Waves, tides, & tsunamis",
      "Seawater salinity, density, & temperature",
      "Coastal erosion & deposition",
      "El Niño & ocean-climate interactions",
    ],
  },
  "2025|Dynamic Planet": {
    focus: "Cryosphere — glaciers and Earth's ice",
    detail:
      "This season's Dynamic Planet focuses on the CRYOSPHERE: glacier formation & movement, glacial erosion & deposition (moraines, U-valleys, cirques), mass balance & equilibrium line, ice sheets & sea level, permafrost, and icebergs.",
    topics: [
      "Glacier formation & flow",
      "Glacial erosion landforms",
      "Till, moraines, & drift",
      "Mass balance & equilibrium line",
      "Ice sheets & sea level",
      "Permafrost & the cryosphere",
      "Calving & icebergs",
    ],
  },
  "2027|Dynamic Planet": {
    focus: "Meteorology / climate (projected)",
    detail:
      "This projected season focuses on METEOROLOGY and climate: atmospheric structure, weather systems & fronts, pressure & wind, humidity & phase changes, severe weather, and climate-change interpretation of data. Verify against official 2027 rules.",
    topics: [
      "Atmospheric layers",
      "Pressure systems & fronts",
      "Wind & the Coriolis effect",
      "Humidity & condensation",
      "Severe weather",
      "Climate data interpretation",
    ],
  },

  // ───────────────────────── ASTRONOMY (C) ─────────────────────────
  "2026|Astronomy": {
    focus: "Stellar Evolution: formation, evolution, and death; supernovae & exoplanets",
    detail:
      "This season's Astronomy focuses on STELLAR EVOLUTION — protostar formation, the main sequence, post-main-sequence evolution (red giants, planetary nebulae, white dwarfs, supernovae, neutron stars, black holes), the H-R diagram, Type Ia & Type II supernovae, standard candles (Cepheids), and EXOPLANETS (detection methods, transit/eclipse curves, habitable zone). Use the H-R diagram and image-analysis reasoning.",
    topics: [
      "Protostar & star formation",
      "Main sequence & stellar lifetimes",
      "Red giants & stellar death paths",
      "Supernovae (Type Ia vs Type II)",
      "White dwarfs, neutron stars, black holes",
      "The H-R diagram",
      "Cepheids & standard candles",
      "Exoplanet detection & the habitable zone",
    ],
  },
  "2027|Astronomy": {
    focus: "Stellar evolution & galaxies (projected)",
    detail:
      "This projected season focuses on stellar evolution and GALAXIES: galaxy classification, the Milky Way, active galactic nuclei, Hubble's law & cosmological expansion, dark matter, and deep-sky objects. Verify against official 2027 rules.",
    topics: [
      "Galaxy classification (Hubble tuning fork)",
      "The Milky Way",
      "Active galactic nuclei & quasars",
      "Hubble's law & redshift",
      "Dark matter & cosmology",
      "Stellar evolution & the H-R diagram",
    ],
  },

  // ───────────────────────── DISEASE DETECTIVES ─────────────────────────
  "2026|Disease Detectives": {
    focus: "Environmental health & outbreak investigation",
    detail:
      "This season's Disease Detectives focuses on ENVIRONMENTAL HEALTH and outbreak investigation: study designs (cohort, case-control, cross-sectional), 2x2 tables, attack rates, odds & risk ratios, surveillance, and environmental causes of disease (water/air/food, toxins, vector-borne). Use epidemiologic process skills.",
    topics: [
      "Cohort vs case-control studies",
      "2x2 tables & odds/risk ratios",
      "Attack rates & food-specific analysis",
      "Surveillance & epidemic curves",
      "Environmental causes of disease",
      "Incidence vs prevalence",
      "Outbreak investigation steps",
    ],
  },

  // ───────────────────────── CHEMISTRY LAB ─────────────────────────
  "2026|Chemistry Lab": {
    focus: "Periodicity and Equilibrium",
    detail:
      "This season's Chemistry Lab focuses on PERIODICITY (trends in atomic radius, ionization energy, electronegativity, effective nuclear charge) and EQUILIBRIUM (Le Chatelier's principle, equilibrium constants Kc/Kp, reaction quotient Q, solubility). Includes lab-style calculation problems.",
    topics: [
      "Periodic trends (atomic radius, IE, EN)",
      "Effective nuclear charge",
      "Le Chatelier's principle",
      "Equilibrium constants Kc & Kp",
      "Reaction quotient Q",
      "Solubility & Ksp",
      "Gas laws & stoichiometry (general)",
    ],
  },

  // ───────────────────────── MATERIALS SCIENCE (C) ─────────────────────────
  "2026|Materials Science": {
    focus: "Ceramics — chemical & crystalline structure and behavior",
    detail:
      "This season's Materials Science focuses on CERAMICS: crystal structures, defects, brittle vs ductile fracture, stress-strain behavior, thermal properties, and the four material classes (metals, ceramics, polymers, composites) with emphasis on ceramics. Includes data/labs analysis.",
    topics: [
      "Crystal structures & defects",
      "Stress-strain curves & properties",
      "Brittle vs ductile fracture",
      "The four material classes",
      "Ceramic properties & processing",
      "Thermal & mechanical behavior",
    ],
  },

  // ───────────────────────── ECOLOGY ─────────────────────────
  "2026|Ecology": {
    focus: "Ecosystems, energy flow, nutrient cycles, and population dynamics",
    detail:
      "This season's Ecology focuses on ecosystem structure, food webs & energy flow (10% rule), biogeochemical cycles (carbon, nitrogen, water), population dynamics (logistic growth, carrying capacity), symbiosis, and succession. Includes a rotating biome focus.",
    topics: [
      "Food webs & energy flow",
      "Biogeochemical cycles",
      "Population dynamics & carrying capacity",
      "Symbiosis (mutualism, commensalism, parasitism)",
      "Succession",
      "Trophic levels & the 10% rule",
    ],
  },

  // ───────────────────────── ENTOMOLOGY ─────────────────────────
  "2026|Entomology": {
    focus: "Insect identification (order & family) and biology",
    detail:
      "This season's Entomology focuses on identifying insects and selected immatures to ORDER and FAMILY using the official insect list, constructing/using dichotomous keys, and insect anatomy, metamorphosis (complete vs incomplete), respiration (spiracles), and orders (Coleoptera, Lepidoptera, Diptera, Hymenoptera, etc.).",
    topics: [
      "Insect orders (Coleoptera, Lepidoptera, Diptera, Hymenoptera, etc.)",
      "Complete vs incomplete metamorphosis",
      "Insect morphology & spiracles",
      "Dichotomous keys",
      "Immature insects",
    ],
  },

  // ───────────────────────── REMOTE SENSING ─────────────────────────
  "2026|Remote Sensing": {
    focus: "Climate change processes via remote sensing imagery & data",
    detail:
      "This season's Remote Sensing focuses on using imagery, data, and computational skills to study CLIMATE CHANGE in the Earth system: multispectral bands, satellite sensors, interpreting images/maps for climate processes (ice loss, vegetation, sea surface temp, atmospheric data).",
    topics: [
      "Electromagnetic spectrum & bands",
      "Satellite sensors & image interpretation",
      "Climate change indicators",
      "Vegetation & NDVI indices",
      "Sea ice & sea surface temperature",
    ],
  },

  // ───────────────────────── FOSSILS ─────────────────────────
  "2026|Fossils": {
    focus: "Fossil identification, preservation, and the geologic time scale",
    detail:
      "This season's Fossils focuses on identifying specimens from the official fossil list by genus/specimen and geologic period, modes of preservation (permineralization, casts, amber, carbonization), paleoecology, evolution, index fossils, and extinction events. Use the geologic time scale.",
    topics: [
      "Fossil preservation modes",
      "Index fossils & correlation",
      "Geologic time scale & eras",
      "Major extinction events",
      "Notable taxa (trilobites, ammonites, etc.)",
      "Paleoecology",
    ],
  },

  // ───────────────────────── DESIGNER GENES (C) ─────────────────────────
  "2026|Designer Genes": {
    focus: "Classic, evolutionary, and molecular genetics",
    detail:
      "This season's Designer Genes focuses on classical (Mendelian) genetics, molecular genetics (DNA structure, replication, transcription, translation), biotechnology (PCR, gel electrophoresis, CRISPR), gene regulation, and evolutionary/population genetics. Includes pedigree and cross problems.",
    topics: [
      "Mendelian & dihybrid crosses",
      "DNA structure & replication",
      "Transcription & translation",
      "PCR & gel electrophoresis",
      "CRISPR & biotechnology",
      "Pedigrees & sex-linked traits",
      "Population genetics (Hardy-Weinberg)",
    ],
  },
};

/** Generic fallback focus for events without a season-specific entry. */
function genericFocus(eventName: string): RuleFocus {
  const info = GENERIC_FOCUS[eventName];
  if (info) return info;
  return {
    focus: "the full scope of this event",
    detail: `Cover the breadth of the ${eventName} event as described in the Science Olympiad rules manual.`,
    topics: ["General"],
  };
}

/** Per-event generic focuses (used when no season entry exists). */
const GENERIC_FOCUS: Record<string, RuleFocus> = {
  "Rocks and Minerals": {
    focus: "mineral & rock identification and geologic significance",
    detail:
      "Identify minerals and rocks from the official list using properties (hardness/Mohs, streak, luster, cleavage) and interpret their formation and geologic significance.",
    topics: ["Mohs hardness", "Streak & luster", "Igneous/sedimentary/metamorphic", "Mineral identification"],
  },
  Optics: {
    focus: "geometric & physical optics and the laser shoot",
    detail:
      "Cover reflection, refraction, lenses & mirrors, total internal reflection, dispersion, wave optics, and the electromagnetic spectrum.",
    topics: ["Reflection & refraction", "Lenses & mirrors", "Snell's law", "Total internal reflection"],
  },
  "Water Quality": {
    focus: "freshwater aquatic environments & macroinvertebrates",
    detail:
      "Cover water parameters (DO, turbidity, pH, BOD), the water cycle, pollution, eutrophication, and aquatic macroinvertebrates as water-quality indicators (EPT taxa).",
    topics: ["Dissolved oxygen & BOD", "Turbidity & pH", "Macroinvertebrates & EPT", "Eutrophication"],
  },
  "Circuit Lab": {
    focus: "electricity, circuits, and magnetism",
    detail:
      "Cover Ohm's & Kirchhoff's laws, series & parallel circuits, capacitors, magnetism, electromagnetism, and power. Include calculation problems.",
    topics: ["Ohm's law", "Series/parallel resistance", "Kirchhoff's laws", "Power & capacitance"],
  },
  Machines: {
    focus: "simple & compound machines and mechanical advantage",
    detail:
      "Cover the six simple machines, mechanical advantage, work, efficiency, and levers. Include calculation problems.",
    topics: ["Simple machines", "Mechanical advantage", "Levers", "Work & efficiency"],
  },
  Heredity: {
    focus: "classical & molecular genetics (Division B)",
    detail:
      "Cover Mendelian inheritance, Punnett squares, probability, pedigrees, meiosis, and an intro to DNA/molecular genetics.",
    topics: ["Punnett squares", "Dihybrid crosses", "Pedigrees", "Meiosis"],
  },
  "Geologic Mapping": {
    focus: "geologic maps, cross-sections, & structure",
    detail:
      "Cover strike & dip, folds & faults, unconformities, principles of stratigraphy, and constructing/reading geologic maps and cross-sections.",
    topics: ["Strike & dip", "Folds & faults", "Unconformities", "Superposition & horizontality"],
  },
  "Microbe Mission": {
    focus: "microbiology — bacteria, viruses, & immunity",
    detail:
      "Cover microbe diversity (bacteria, archaea, viruses, protists, fungi), structure, metabolism, the immune response, disease, and microbial techniques (Gram stain).",
    topics: ["Bacterial structure", "Gram staining", "Viruses & bacteriophages", "Immune response"],
  },
  "Wind Power": {
    focus: "wind energy, turbines, & fluid/power physics",
    detail:
      "Cover wind power physics (P=½ρAv³, the Betz limit), turbine blade design, generators, and alternative energy. Include calculation problems.",
    topics: ["Power equation & Betz limit", "Turbine blades", "Generators", "Energy conversion"],
  },
  SolarSystem: {
    focus: "the Solar System (Division B)",
    detail:
      "Cover planet formation & structure, the Sun, moons, asteroids, comets, dwarf planets, and small bodies.",
    topics: ["Terrestrial vs gas giants", "Planet formation", "Small bodies & comets", "The Sun"],
  },
  "Solar System": {
    focus: "the Solar System (Division B)",
    detail:
      "Cover planet formation & structure, the Sun, moons, asteroids, comets, dwarf planets, and small bodies.",
    topics: ["Terrestrial vs gas giants", "Planet formation", "Small bodies & comets", "The Sun"],
  },
  Codebusters: {
    focus: "cryptanalysis of historical & modern ciphers",
    detail:
      "Cover Caesar, Vigenère, Atbash, affine, Baconian, and Hill ciphers, plus frequency analysis. Include encryption/decryption problems.",
    topics: ["Caesar & Atbash", "Vigenère", "Affine ciphers", "Frequency analysis"],
  },
  Meteorology: {
    focus: "weather & climate (Division B)",
    detail:
      "Cover atmospheric structure, pressure & wind systems, fronts, humidity, severe weather, and climate change via data interpretation.",
    topics: ["Atmospheric layers", "Pressure & fronts", "Humidity", "Coriolis effect"],
  },
};

export function getRuleFocus(
  season: string,
  eventName: string,
): RuleFocus {
  return FOCUS[`${season}|${eventName}`] ?? genericFocus(eventName);
}

/** Build the focus directive text injected into the AI prompt. */
export function buildFocusDirective(
  season: string,
  eventName: string,
  userTopic?: string,
): { directive: string; topics: string[] } {
  const rf = getRuleFocus(season, eventName);
  const parts: string[] = [
    `This is the ${season} season. The official rules focus for "${eventName}" this season is: ${rf.focus}.`,
    `Detail: ${rf.detail}`,
  ];
  if (userTopic && userTopic.trim()) {
    parts.push(
      `Narrow ALL questions to this specific sub-topic requested by the student: "${userTopic.trim()}". It must fall within the season's rules focus.`,
    );
  } else {
    parts.push(
      `Sample varied sub-topics from this list (do not repeat): ${rf.topics.join(", ")}.`,
    );
  }
  return { directive: parts.join("\n"), topics: rf.topics };
}

export const CURRENT_SEASON: SeasonKey = "2026";
