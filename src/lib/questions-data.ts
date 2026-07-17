export interface RawQuestion {
  eventName: string;
  division: "B" | "C" | "BC";
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

/**
 * Curated practice question bank written in the style of Science Olympiad
 * invitational tests and official rules manuals. Each question carries a
 * source attribution so students know the provenance of the material.
 */
export const QUESTION_BANK: RawQuestion[] = [
  // ===================== Anatomy & Physiology =====================
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "easy",
    topic: "Nervous System",
    prompt: "The basic structural and functional unit of the nervous system is the:",
    options: ["Neuron", "Nephron", "Alveolus", "Osteon"],
    correctIndex: 0,
    explanation:
      "Neurons are specialized cells that transmit electrical and chemical signals; nephrons, alveoli, and osteons belong to the kidney, lung, and bone respectively.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Nervous System",
    prompt: "Which lobe of the cerebrum is primarily responsible for processing visual information?",
    options: ["Frontal", "Parietal", "Temporal", "Occipital"],
    correctIndex: 3,
    explanation:
      "The occipital lobe, at the back of the brain, houses the primary visual cortex.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Nervous System",
    prompt: "The resting membrane potential of a typical neuron is approximately:",
    options: ["0 mV", "+30 mV", "-70 mV", "+90 mV"],
    correctIndex: 2,
    explanation:
      "A neuron at rest maintains a potential of about -70 mV due to the sodium-potassium pump and leak channels.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Endocrine System",
    prompt: "Which hormone, released by the beta cells of the pancreas, lowers blood glucose?",
    options: ["Glucagon", "Insulin", "Cortisol", "Adrenaline"],
    correctIndex: 1,
    explanation:
      "Insulin lowers blood glucose by promoting cellular uptake, while glucagon raises it.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "hard",
    topic: "Nervous System",
    prompt:
      "During an action potential, the rapid depolarization phase is caused primarily by the:",
    options: [
      "Opening of voltage-gated sodium channels",
      "Opening of voltage-gated potassium channels",
      "Closing of all sodium channels",
      "Activation of the sodium-potassium pump alone",
    ],
    correctIndex: 0,
    explanation:
      "Voltage-gated Na+ channels open first, allowing Na+ to rush in and depolarize the membrane; K+ efflux later repolarizes it.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Special Senses",
    prompt: "Accommodation (focusing on near objects) is accomplished by changing the shape of the:",
    options: ["Cornea", "Lens", "Iris", "Sclera"],
    correctIndex: 1,
    explanation:
      "Ciliary muscles change the shape of the lens to focus light from near or far objects onto the retina.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Special Senses",
    prompt: "Sound vibrations are converted into neural signals in the cochlea by the:",
    options: ["Rods", "Hair cells", "Olfactory receptors", "Pacinian corpuscles"],
    correctIndex: 1,
    explanation:
      "Hair cells in the organ of Corti transduce the movement of cochlear fluid into nerve impulses.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "medium",
    topic: "Endocrine System",
    prompt: "Often called the 'master gland,' this gland controls many other endocrine glands:",
    options: ["Thyroid", "Pituitary", "Adrenal", "Thymus"],
    correctIndex: 1,
    explanation:
      "The pituitary releases trophic hormones that regulate the thyroid, adrenals, gonads, and growth.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "easy",
    topic: "Special Senses",
    prompt: "The chemoreceptors for the sense of taste are clustered in structures called:",
    options: ["Taste buds", "Maculae", "Neuromasts", "Merkel discs"],
    correctIndex: 0,
    explanation:
      "Taste buds, located mostly on papillae of the tongue, contain the receptor cells for gustation.",
  },
  {
    eventName: "Anatomy & Physiology",
    division: "BC",
    difficulty: "hard",
    topic: "Nervous System",
    prompt: "Multiple sclerosis is characterized by the degradation of which structure?",
    options: ["Axon terminals", "Myelin sheath", "Dendritic spines", "Cell nucleus"],
    correctIndex: 1,
    explanation:
      "MS is an autoimmune disease that destroys myelin in the central nervous system, slowing nerve conduction.",
  },

  // ===================== Astronomy =====================
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "easy",
    topic: "H-R Diagram",
    prompt:
      "In a standard Hertzsprung-Russell diagram, stars are plotted with the x-axis showing:",
    options: ["Distance", "Temperature", "Radius", "Age"],
    correctIndex: 1,
    explanation:
      "The x-axis is temperature (or spectral type / color), increasing to the right; the y-axis is luminosity.",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "medium",
    topic: "Stellar Classification",
    prompt: "The Sun is classified as which spectral type?",
    options: ["O", "A", "G", "M"],
    correctIndex: 2,
    explanation: "The Sun is a G2V main-sequence star (a yellow dwarf).",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "medium",
    topic: "Stellar Properties",
    prompt:
      "A star's apparent brightness obeys an inverse-square law with respect to its:",
    options: ["Mass", "Distance", "Temperature", "Radius"],
    correctIndex: 1,
    explanation:
      "Apparent brightness falls off as 1/d², so doubling distance quarters the observed brightness.",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "hard",
    topic: "Stellar Evolution",
    prompt:
      "In stars of about one solar mass, hydrogen fusion occurs primarily through the:",
    options: ["CNO cycle", "Proton-proton chain", "Triple-alpha process", "r-process"],
    correctIndex: 1,
    explanation:
      "The proton-proton chain dominates in Sun-like cores; the CNO cycle dominates in more massive stars.",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "medium",
    topic: "Stellar Remnants",
    prompt:
      "Which stellar remnant is small and dense, supported against collapse by electron degeneracy pressure?",
    options: ["Red giant", "White dwarf", "Neutron star", "Brown dwarf"],
    correctIndex: 1,
    explanation:
      "White dwarfs are supported by electron degeneracy pressure up to the Chandrasekhar limit.",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "hard",
    topic: "Stellar Remnants",
    prompt:
      "The Chandrasekhar limit, about 1.4 solar masses, is the maximum mass of a:",
    options: ["Neutron star", "White dwarf", "Main-sequence star", "Red giant"],
    correctIndex: 1,
    explanation:
      "Above ~1.4 M☉ electron degeneracy cannot support a white dwarf, and it collapses (often into a neutron star).",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "medium",
    topic: "Standard Candles",
    prompt:
      "Cepheid variables are valuable as standard candles because their pulsation period correlates with their:",
    options: ["Luminosity", "Temperature", "Radius", "Metallicity"],
    correctIndex: 0,
    explanation:
      "The period-luminosity relation lets astronomers find a Cepheid's luminosity and thus its distance.",
  },
  {
    eventName: "Astronomy",
    division: "C",
    difficulty: "medium",
    topic: "Cosmology",
    prompt:
      "Light from a galaxy moving away from us is shifted toward longer wavelengths. This is called:",
    options: ["Blueshift", "Redshift", "Parallax", "Aberration"],
    correctIndex: 1,
    explanation:
      "Recession stretches light to longer (redder) wavelengths — cosmological redshift underlies Hubble's law.",
  },

  // ===================== Chemistry Lab =====================
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "easy",
    topic: "Acids & Bases",
    prompt: "The pH of a neutral aqueous solution at 25°C is:",
    options: ["0", "7", "14", "1"],
    correctIndex: 1,
    explanation:
      "At 25°C, neutral water has equal [H+] and [OH-] of 10^-7 M, giving pH 7.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "medium",
    topic: "The Mole",
    prompt: "How many moles are in 36 g of water (molar mass ≈ 18 g/mol)?",
    options: ["0.5", "1", "2", "18"],
    correctIndex: 2,
    explanation: "36 g ÷ 18 g/mol = 2 moles of H2O.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Acids & Bases",
    prompt: "Which of the following is a strong acid?",
    options: ["HCl", "CH3COOH", "NH3", "H2CO3"],
    correctIndex: 0,
    explanation:
      "Hydrochloric acid (HCl) ionizes completely in water; the others are weak acids or a weak base.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "hard",
    topic: "Stoichiometry",
    prompt:
      "For N2 + 3H2 → 2NH3, how many moles of NH3 form from 3 mol of H2 with excess N2?",
    options: ["1", "2", "3", "6"],
    correctIndex: 1,
    explanation:
      "The ratio is 2 NH3 : 3 H2, so 3 mol H2 × (2/3) = 2 mol NH3.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Solutions",
    prompt: "The number of moles of solute per liter of solution is called:",
    options: ["Molality", "Molarity", "Normality", "Mole fraction"],
    correctIndex: 1,
    explanation: "Molarity (M) = moles of solute / liters of solution.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "hard",
    topic: "Titrations",
    prompt:
      "If 25.0 mL of 0.100 M HCl neutralizes 50.0 mL of NaOH solution, the NaOH molarity is:",
    options: ["0.0500 M", "0.100 M", "0.200 M", "0.0250 M"],
    correctIndex: 0,
    explanation:
      "Moles HCl = 0.00250; equal moles NaOH in 0.0500 L gives 0.0500 M.",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "easy",
    topic: "Gas Laws",
    prompt:
      "According to the ideal gas law at constant temperature and moles, pressure and volume are:",
    options: [
      "Directly proportional",
      "Inversely proportional",
      "Unrelated",
      "Always equal",
    ],
    correctIndex: 1,
    explanation:
      "This inverse relationship at constant T and n is Boyle's law (PV = constant).",
  },
  {
    eventName: "Chemistry Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Redox",
    prompt: "Oxidation is defined as the:",
    options: [
      "Gain of electrons",
      "Loss of electrons",
      "Gain of protons",
      "Loss of neutrons",
    ],
    correctIndex: 1,
    explanation:
      "Oxidation is loss of electrons (OIL RIG); reduction is the gain of electrons.",
  },

  // ===================== Codebusters =====================
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "easy",
    topic: "Caesar Cipher",
    prompt:
      "In a Caesar cipher with a shift of 3, the plaintext letter 'A' encrypts to which letter?",
    options: ["C", "D", "E", "B"],
    correctIndex: 1,
    explanation: "Shifting A forward by 3 gives D (A→B→C→D).",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "medium",
    topic: "Vigenère Cipher",
    prompt:
      "A polyalphabetic cipher that shifts each letter by an amount determined by a repeated keyword is the:",
    options: ["Caesar", "Vigenère", "Atbash", "Rail fence"],
    correctIndex: 1,
    explanation:
      "The Vigenère cipher uses a repeating keyword to vary the shift per letter, defeating simple frequency analysis.",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "medium",
    topic: "Atbash Cipher",
    prompt: "In the Atbash cipher (A↔Z, B↔Y), the letter 'C' maps to:",
    options: ["X", "W", "Y", "B"],
    correctIndex: 0,
    explanation: "Atbash reverses the alphabet: A↔Z, B↔Y, C↔X, and so on.",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "hard",
    topic: "Vigenère Cipher",
    prompt: "Vigenère encryption of plaintext P with key letter K uses the formula:",
    options: [
      "(P + K) mod 26",
      "(P − K) mod 26",
      "(P × K) mod 26",
      "P XOR K",
    ],
    correctIndex: 0,
    explanation:
      "Each ciphertext letter is (P + K) mod 26, where letters A–Z map to 0–25.",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "medium",
    topic: "Substitution Ciphers",
    prompt:
      "A substitution cipher that reverses the alphabet (A↔Z) is called the:",
    options: ["Caesar", "Atbash", "Affine", "Baconian"],
    correctIndex: 1,
    explanation: "Atbash is the monoalphabetic substitution that mirrors the alphabet.",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "hard",
    topic: "Cryptanalysis",
    prompt: "Frequency analysis is MOST effective against which cipher?",
    options: [
      "One-time pad",
      "Simple (monoalphabetic) substitution",
      "AES",
      "Vigenère with a long random key",
    ],
    correctIndex: 1,
    explanation:
      "Because each plaintext letter always maps to one ciphertext letter, letter-frequency patterns are preserved.",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "medium",
    topic: "Baconian Cipher",
    prompt: "The Baconian cipher encodes each letter of the alphabet using how many binary symbols?",
    options: ["2", "5", "8", "26"],
    correctIndex: 1,
    explanation:
      "Bacon's cipher uses 5-bit groups (a/b) to represent 26 letters (2^5 = 32 possibilities).",
  },
  {
    eventName: "Codebusters",
    division: "BC",
    difficulty: "hard",
    topic: "Affine Cipher",
    prompt:
      "For the affine cipher E(x) = (ax + b) mod 26 to be invertible, the constant 'a' must be:",
    options: ["Even", "Coprime with 26", "Greater than 26", "Equal to b"],
    correctIndex: 1,
    explanation:
      "'a' must share no common factor with 26 so a multiplicative inverse exists for decryption.",
  },

  // ===================== Disease Detectives =====================
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "easy",
    topic: "Epidemiology Basics",
    prompt: "An epidemic that spreads across countries or worldwide is called a:",
    options: ["Endemic", "Epidemic", "Pandemic", "Outbreak"],
    correctIndex: 2,
    explanation:
      "A pandemic is an epidemic that has spread over multiple countries or continents.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "medium",
    topic: "Measures of Frequency",
    prompt:
      "The number of NEW cases of a disease in a population during a given time period is the:",
    options: ["Prevalence", "Incidence", "Mortality rate", "Morbidity"],
    correctIndex: 1,
    explanation:
      "Incidence counts new cases; prevalence counts all existing cases at a point or period.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "medium",
    topic: "2×2 Tables",
    prompt:
      "In a standard 2×2 epidemiologic table (a,b,c,d), the odds ratio is computed as:",
    options: ["a / b", "(a × d) / (b × c)", "(a + c) / (b + d)", "a / (a + b)"],
    correctIndex: 1,
    explanation:
      "Odds ratio = (odds of exposure among cases)/(odds among controls) = ad/bc.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "hard",
    topic: "Study Design",
    prompt:
      "A study that follows a defined group forward in time to compare outcomes by exposure is a:",
    options: ["Case-control study", "Cohort study", "Cross-sectional study", "Ecological study"],
    correctIndex: 1,
    explanation:
      "Cohort studies follow exposed and unexposed groups forward to measure incidence.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "medium",
    topic: "Outbreak Investigation",
    prompt:
      "The food-specific attack rate for people who ate a suspect food equals:",
    options: [
      "(number ill who ate the food / total who ate the food) × 100",
      "(total ill / total population) × 100",
      "(ill who ate food / ill who did not) × 100",
      "(total who ate food / total population) × 100",
    ],
    correctIndex: 0,
    explanation:
      "Attack rate compares those who became ill after eating the food to all who ate it.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "medium",
    topic: "Epidemiology Basics",
    prompt: "A disease constantly present in a population at a low level is:",
    options: ["Endemic", "Epidemic", "Pandemic", "Sporadic"],
    correctIndex: 0,
    explanation:
      "Endemic describes the baseline, constant presence of a disease in a region.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "hard",
    topic: "Study Design",
    prompt: "In a case-control study, the measure of association typically reported is the:",
    options: ["Relative risk", "Odds ratio", "Attributable risk", "Correlation coefficient"],
    correctIndex: 1,
    explanation:
      "Case-control studies (sampling by outcome) yield an odds ratio, not a true relative risk.",
  },
  {
    eventName: "Disease Detectives",
    division: "BC",
    difficulty: "medium",
    topic: "Causation",
    prompt: "The 'epidemiologic triad' of disease causation consists of an agent, a host, and the:",
    options: ["Vector", "Environment", "Climate", "Pathogen"],
    correctIndex: 1,
    explanation:
      "Agent, host, and environment form the classic model of disease causation.",
  },

  // ===================== Dynamic Planet =====================
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "easy",
    topic: "Glaciers",
    prompt: "A persistent body of dense ice that moves under its own weight is a:",
    options: ["Iceberg", "Glacier", "Fjord", "Moraine"],
    correctIndex: 1,
    explanation:
      "Glaciers form on land from accumulated snow and flow slowly under gravity.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "medium",
    topic: "Glacial Deposits",
    prompt: "Glacial till is best described as:",
    options: [
      "Sorted sediment deposited by meltwater",
      "Unsorted sediment deposited directly by ice",
      "Wind-blown silt",
      "Layered lake sediment",
    ],
    correctIndex: 1,
    explanation:
      "Till is unsorted, unstratified debris dropped directly by moving or melting ice.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "medium",
    topic: "Glacial Erosion",
    prompt: "A U-shaped valley carved by a valley glacier is called a:",
    options: ["V-shaped valley", "Glacial trough", "Hanging valley", "Cirque"],
    correctIndex: 1,
    explanation:
      "Glacial troughs (U-shaped valleys) form when a glacier deepens and widens a river valley.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "hard",
    topic: "Glacier Mass Balance",
    prompt:
      "The line separating the accumulation zone from the ablation zone on a glacier is the:",
    options: ["Tree line", "Equilibrium line altitude", "Ablation zone", "Terminus"],
    correctIndex: 1,
    explanation:
      "At the equilibrium line altitude (ELA), accumulation exactly balances ablation.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "medium",
    topic: "Icebergs",
    prompt: "An iceberg floating in the ocean forms when:",
    options: [
      "Seawater freezes at the surface",
      "A glacier calves into the sea",
      "A submarine volcano erupts",
      "River ice drifts offshore",
    ],
    correctIndex: 1,
    explanation:
      "Icebergs are pieces of freshwater ice that break off (calve) from a glacier or ice shelf.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "easy",
    topic: "Cryosphere",
    prompt: "Ground that remains frozen for two or more consecutive years is called:",
    options: ["Permafrost", "Tundra", "Taiga", "Hardpan"],
    correctIndex: 0,
    explanation: "Permafrost is perennially frozen ground common in polar regions.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "hard",
    topic: "Glacier Mass Balance",
    prompt: "The ratio of a glacier's accumulation-zone area to its total area is the:",
    options: [
      "Mass balance",
      "Accumulation-area ratio",
      "Ablation index",
      "Equilibrium line",
    ],
    correctIndex: 1,
    explanation:
      "The accumulation-area ratio (AAR) is used to estimate whether a glacier is growing or shrinking.",
  },
  {
    eventName: "Dynamic Planet",
    division: "BC",
    difficulty: "medium",
    topic: "Glacial Erosion",
    prompt:
      "A bowl-shaped, amphitheater-like depression carved at the head of a valley glacier is a:",
    options: ["Arête", "Cirque", "Horn", "Tarn"],
    correctIndex: 1,
    explanation:
      "Cirques are armchair-shaped hollows eroded at the source of a glacier.",
  },

  // ===================== Ecology =====================
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "easy",
    topic: "Energy Flow",
    prompt: "Organisms that produce their own food using sunlight are called:",
    options: ["Heterotrophs", "Autotrophs", "Decomposers", "Omnivores"],
    correctIndex: 1,
    explanation:
      "Autotrophs (producers) make organic compounds from inorganic ones via photosynthesis.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "medium",
    topic: "Energy Flow",
    prompt:
      "On average, roughly what percentage of energy is transferred from one trophic level to the next?",
    options: ["1%", "10%", "50%", "90%"],
    correctIndex: 1,
    explanation:
      "The '10% rule' reflects energy lost as heat at each transfer up the food chain.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "medium",
    topic: "Symbiosis",
    prompt: "A close, long-term interaction between two different species is called:",
    options: ["Symbiosis", "Competition", "Predation", "Herbivory"],
    correctIndex: 0,
    explanation:
      "Symbiosis includes mutualism, commensalism, and parasitism.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "hard",
    topic: "Symbiosis",
    prompt:
      "A relationship in which one species benefits and the other is unaffected is:",
    options: ["Mutualism", "Commensalism", "Parasitism", "Competition"],
    correctIndex: 1,
    explanation:
      "In commensalism, one organism benefits (+) and the other is unaffected (0).",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "medium",
    topic: "Biogeochemical Cycles",
    prompt:
      "Which cycle involves photosynthesis, respiration, and combustion as key processes?",
    options: ["Nitrogen", "Carbon", "Phosphorus", "Sulfur"],
    correctIndex: 1,
    explanation:
      "Carbon cycles between CO2, biomass, and fossil fuels via these processes.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "easy",
    topic: "Ecosystems",
    prompt: "Non-living factors such as sunlight, temperature, and water are called:",
    options: ["Biotic factors", "Abiotic factors", "Trophic factors", "Organic factors"],
    correctIndex: 1,
    explanation: "Abiotic factors are the non-living physical and chemical components.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "hard",
    topic: "Populations",
    prompt:
      "In logistic growth, the population growth rate slows as the population approaches the:",
    options: ["Biotic potential", "Carrying capacity", "Doubling time", "Intrinsic rate"],
    correctIndex: 1,
    explanation:
      "As N approaches carrying capacity K, limited resources slow growth to zero.",
  },
  {
    eventName: "Ecology",
    division: "BC",
    difficulty: "medium",
    topic: "Succession",
    prompt: "The gradual, predictable change in species composition of a community over time is:",
    options: ["Succession", "Decomposition", "Predation", "Colonization"],
    correctIndex: 0,
    explanation:
      "Ecological succession (primary or secondary) describes community change over time.",
  },

  // ===================== Entomology =====================
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "easy",
    topic: "Classification",
    prompt: "Insects belong to which phylum?",
    options: ["Annelida", "Arthropoda", "Mollusca", "Chordata"],
    correctIndex: 1,
    explanation:
      "Insects are arthropods — jointed-legged invertebrates with an exoskeleton.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "medium",
    topic: "Morphology",
    prompt: "Adult insects characteristically have how many legs?",
    options: ["4", "6", "8", "10"],
    correctIndex: 1,
    explanation: "Adult insects (class Insecta) have three pairs of legs (six total).",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "medium",
    topic: "Life Cycles",
    prompt:
      "Complete (holometabolous) metamorphosis includes a stage absent in incomplete metamorphosis — the:",
    options: ["Egg", "Nymph", "Pupa", "Adult"],
    correctIndex: 2,
    explanation:
      "Holometabolous insects pass through egg → larva → pupa → adult; the pupa is unique to this cycle.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "hard",
    topic: "Orders",
    prompt: "Butterflies and moths belong to which order?",
    options: ["Coleoptera", "Lepidoptera", "Diptera", "Hymenoptera"],
    correctIndex: 1,
    explanation:
      "Lepidoptera ('scale-wing') includes butterflies and moths, recognized by scaly wings.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "medium",
    topic: "Orders",
    prompt: "Beetles are classified in the order:",
    options: ["Coleoptera", "Hemiptera", "Orthoptera", "Odonata"],
    correctIndex: 0,
    explanation:
      "Coleoptera ('sheath-wing') are beetles, with hardened forewings called elytra.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "easy",
    topic: "Respiration",
    prompt: "Air enters an insect's body through paired external openings called:",
    options: ["Spiracles", "Nostrils", "Gill slits", "Tracheoles"],
    correctIndex: 0,
    explanation:
      "Spiracles open into the tracheal system, delivering air directly to tissues.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "hard",
    topic: "Morphology",
    prompt: "The hardened forewings that protect a beetle's hindwings are called:",
    options: ["Halteres", "Elytra", "Tegmina", "Hemelytra"],
    correctIndex: 1,
    explanation: "Elytra are the tough modified forewings characteristic of beetles.",
  },
  {
    eventName: "Entomology",
    division: "BC",
    difficulty: "medium",
    topic: "Orders",
    prompt: "True flies, which have only one pair of functional wings, belong to the order:",
    options: ["Diptera", "Hymenoptera", "Coleoptera", "Isoptera"],
    correctIndex: 0,
    explanation:
      "Diptera ('two-wing') have one pair of wings; the hindwings are reduced to halteres.",
  },

  // ===================== Fossils =====================
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "easy",
    topic: "Basics",
    prompt: "The preserved remains or traces of ancient organisms are called:",
    options: ["Fossils", "Minerals", "Ores", "Sediments"],
    correctIndex: 0,
    explanation: "Fossils are any preserved evidence of past life.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "medium",
    topic: "Geologic Time",
    prompt: "The geologic era known as the 'Age of Reptiles' is the:",
    options: ["Paleozoic", "Mesozoic", "Cenozoic", "Precambrian"],
    correctIndex: 1,
    explanation:
      "The Mesozoic (Triassic, Jurassic, Cretaceous) was dominated by reptiles, including dinosaurs.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "medium",
    topic: "Preservation",
    prompt:
      "A fossil formed when sediment fills a natural mold and then hardens is a:",
    options: ["Cast", "Mold", "Amber", "Index fossil"],
    correctIndex: 0,
    explanation:
      "A cast is a mold that has been filled in with mineral material, copying the organism's shape.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "hard",
    topic: "Preservation",
    prompt: "Organisms trapped in tree resin that later hardens are preserved as:",
    options: ["Amber", "Tar", "Permineralization", "Carbonization"],
    correctIndex: 0,
    explanation:
      "Amber is fossilized tree resin that can preserve organisms in remarkable detail.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "easy",
    topic: "Notable Taxa",
    prompt: "Trilobites — extinct marine arthropods — lived mainly during the:",
    options: ["Paleozoic", "Mesozoic", "Cenozoic", "Quaternary"],
    correctIndex: 0,
    explanation:
      "Trilobites were diverse Paleozoic arthropods and common index fossils.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "medium",
    topic: "Index Fossils",
    prompt:
      "A species used to correlate and date rock layers because it was widespread but short-lived is a(n):",
    options: ["Trace fossil", "Index fossil", "Living fossil", "Microfossil"],
    correctIndex: 1,
    explanation:
      "Index fossils define narrow time ranges and broad geographic extent, ideal for dating strata.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "hard",
    topic: "Principles",
    prompt:
      "The principle that fossil organisms succeed one another in a definite, recognizable order is:",
    options: ["Superposition", "Fossil succession", "Cross-cutting", "Uniformitarianism"],
    correctIndex: 1,
    explanation:
      "Fossil succession allows geologists to recognize relative ages of rock layers.",
  },
  {
    eventName: "Fossils",
    division: "BC",
    difficulty: "medium",
    topic: "Extinctions",
    prompt: "Non-avian dinosaurs went extinct at the end of which period?",
    options: ["Triassic", "Jurassic", "Cretaceous", "Permian"],
    correctIndex: 2,
    explanation:
      "The Cretaceous-Paleogene extinction (~66 million years ago) wiped out non-avian dinosaurs.",
  },

  // ===================== Microbe Mission =====================
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "easy",
    topic: "Cell Structure",
    prompt: "Bacteria are classified as:",
    options: ["Eukaryotes", "Prokaryotes", "Viruses", "Protists"],
    correctIndex: 1,
    explanation:
      "Bacteria lack a membrane-bound nucleus, making them prokaryotes.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "medium",
    topic: "Techniques",
    prompt: "The Gram stain distinguishes groups of bacteria by differences in their:",
    options: ["Cell membrane", "Cell wall", "Capsule", "Flagella"],
    correctIndex: 1,
    explanation:
      "Gram-positive bacteria have thick peptidoglycan walls that retain crystal violet; gram-negative do not.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "medium",
    topic: "Viruses",
    prompt: "Viruses are considered non-living partly because they:",
    options: [
      "Contain DNA",
      "Require a host cell to reproduce",
      "Are very small",
      "Cause disease",
    ],
    correctIndex: 1,
    explanation:
      "Viruses lack metabolism and can only replicate by hijacking a host cell's machinery.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "hard",
    topic: "Metabolism",
    prompt: "Bacteria that require oxygen to live are called:",
    options: ["Obligate aerobes", "Obligate anaerobes", "Facultative anaerobes", "Aerotolerant"],
    correctIndex: 0,
    explanation:
      "Obligate aerobes need oxygen; facultative anaerobes can grow with or without it.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "medium",
    topic: "Reproduction",
    prompt: "The process by which one bacterium divides into two identical cells is:",
    options: ["Mitosis", "Binary fission", "Meiosis", "Budding"],
    correctIndex: 1,
    explanation:
      "Bacteria reproduce asexually by binary fission, copying DNA and splitting in two.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "easy",
    topic: "Health",
    prompt: "Antibiotics such as penicillin are effective primarily against:",
    options: ["Viruses", "Bacteria", "Fungi", "Prions"],
    correctIndex: 1,
    explanation:
      "Antibiotics target bacterial structures (e.g., cell walls) and do not work on viruses.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "hard",
    topic: "Viruses",
    prompt: "A bacteriophage is a virus that infects:",
    options: ["Humans", "Bacteria", "Plants", "Fungi"],
    correctIndex: 1,
    explanation: "Bacteriophages ('phages') specifically infect and replicate within bacteria.",
  },
  {
    eventName: "Microbe Mission",
    division: "BC",
    difficulty: "medium",
    topic: "Cell Structure",
    prompt: "The genetic material of a typical bacterial cell is found in the:",
    options: ["Nucleus", "Nucleoid", "Mitochondria", "Ribosome"],
    correctIndex: 1,
    explanation:
      "Bacteria have no nucleus; their circular chromosome lies in the nucleoid region.",
  },

  // ===================== Optics =====================
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "easy",
    topic: "Refraction",
    prompt: "The bending of light as it passes from one medium to another is called:",
    options: ["Reflection", "Refraction", "Diffraction", "Dispersion"],
    correctIndex: 1,
    explanation:
      "Refraction occurs because light changes speed (and usually direction) between media.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "medium",
    topic: "Mirrors",
    prompt: "For a plane (flat) mirror, the image formed is:",
    options: [
      "Real and inverted",
      "Virtual and upright",
      "Real and upright",
      "Virtual and inverted",
    ],
    correctIndex: 1,
    explanation:
      "Plane mirrors produce virtual, upright, same-size images located behind the mirror.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "medium",
    topic: "Speed of Light",
    prompt: "The speed of light in a vacuum is approximately:",
    options: ["3 × 10⁸ m/s", "3 × 10⁵ m/s", "3 × 10¹⁰ m/s", "3 × 10³ m/s"],
    correctIndex: 0,
    explanation: "c ≈ 3.00 × 10⁸ m/s (about 300,000 km/s).",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "hard",
    topic: "Lenses",
    prompt:
      "A converging lens has a focal length of 10 cm. An object 30 cm from the lens forms an image at:",
    options: ["15 cm", "20 cm", "30 cm", "7.5 cm"],
    correctIndex: 0,
    explanation:
      "Using 1/f = 1/dₒ + 1/dᵢ: 1/10 − 1/30 = 1/dᵢ, so dᵢ = 15 cm.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "medium",
    topic: "Total Internal Reflection",
    prompt: "Total internal reflection occurs when light traveling in a medium:",
    options: [
      "Goes from low to high index at any angle",
      "Goes from high to low index beyond the critical angle",
      "Passes between any two media",
      "Travels from vacuum into glass",
    ],
    correctIndex: 1,
    explanation:
      "It requires going to a lower-index medium at an angle exceeding the critical angle.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "easy",
    topic: "Dispersion",
    prompt: "A prism separating white light into colors demonstrates:",
    options: ["Reflection", "Dispersion", "Polarization", "Absorption"],
    correctIndex: 1,
    explanation:
      "Dispersion separates colors because refractive index varies slightly with wavelength.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "hard",
    topic: "Refractive Index",
    prompt:
      "The refractive index of a medium equals the ratio of the speed of light in:",
    options: [
      "The medium to that in vacuum",
      "Vacuum to that in the medium",
      "Vacuum to that in water",
      "The medium to that in glass",
    ],
    correctIndex: 1,
    explanation: "n = c / v, so index is the vacuum speed divided by the medium speed.",
  },
  {
    eventName: "Optics",
    division: "BC",
    difficulty: "medium",
    topic: "Lenses",
    prompt: "The unit used to express the power of a lens is the:",
    options: ["Watt", "Diopter", "Lux", "Candela"],
    correctIndex: 1,
    explanation:
      "Lens power in diopters equals 1/focal length (in meters): P = 1/f.",
  },

  // ===================== Rocks and Minerals =====================
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "easy",
    topic: "Mineral Properties",
    prompt: "Which scale measures a mineral's hardness?",
    options: ["Mohs", "Richter", "Beaufort", "pH"],
    correctIndex: 0,
    explanation:
      "The Mohs scale ranks minerals from 1 (talc) to 10 (diamond) by scratch hardness.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "medium",
    topic: "Rock Cycle",
    prompt: "Igneous rocks form by the:",
    options: [
      "Compaction of sediments",
      "Cooling and solidification of magma or lava",
      "Heat and pressure on existing rock",
      "Evaporation of seawater",
    ],
    correctIndex: 1,
    explanation: "Igneous rocks crystallize from molten material.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "medium",
    topic: "Mohs Scale",
    prompt: "On the Mohs scale, which mineral has a hardness of 10?",
    options: ["Quartz", "Diamond", "Talc", "Calcite"],
    correctIndex: 1,
    explanation: "Diamond, hardness 10, is the hardest natural mineral on the Mohs scale.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "hard",
    topic: "Rock Cycle",
    prompt: "A rock altered by heat and pressure without melting is:",
    options: ["Igneous", "Sedimentary", "Metamorphic", "Volcanic"],
    correctIndex: 2,
    explanation:
      "Metamorphic rocks form when existing rocks recrystallize under heat and pressure.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "medium",
    topic: "Mineral Properties",
    prompt: "A mineral's resistance to scratching is its:",
    options: ["Streak", "Hardness", "Luster", "Cleavage"],
    correctIndex: 1,
    explanation:
      "Hardness measures scratch resistance, conventionally on the Mohs scale.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "easy",
    topic: "Mineral Properties",
    prompt: "The color of a mineral in powdered form (on a streak plate) is its:",
    options: ["Streak", "Luster", "Hue", "Tint"],
    correctIndex: 0,
    explanation:
      "Streak is often more reliable than surface color for identifying a mineral.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "hard",
    topic: "Notable Minerals",
    prompt: "Which mineral is the main component of limestone?",
    options: ["Quartz", "Calcite", "Halite", "Gypsum"],
    correctIndex: 1,
    explanation:
      "Calcite (calcium carbonate, CaCO3) is the principal mineral in limestone.",
  },
  {
    eventName: "Rocks and Minerals",
    division: "BC",
    difficulty: "medium",
    topic: "Notable Rocks",
    prompt: "Obsidian is an example of which rock type?",
    options: ["Sedimentary", "Metamorphic", "Igneous", "None of these"],
    correctIndex: 2,
    explanation:
      "Obsidian is a naturally occurring volcanic glass — an extrusive igneous rock.",
  },

  // ===================== Water Quality =====================
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "easy",
    topic: "Dissolved Oxygen",
    prompt: "Healthy water supporting diverse aquatic life typically has:",
    options: [
      "High dissolved oxygen",
      "Low pH",
      "High turbidity",
      "High temperature",
    ],
    correctIndex: 0,
    explanation:
      "Dissolved oxygen is essential for fish and most aquatic organisms; high levels indicate good quality.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "medium",
    topic: "Macroinvertebrates",
    prompt: "Macroinvertebrates that can survive in polluted water are described as:",
    options: ["Sensitive", "Intolerant", "Tolerant", "Specialist"],
    correctIndex: 2,
    explanation:
      "Tolerant species (e.g., some worms and midge larvae) survive pollution, so their dominance signals poor quality.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "medium",
    topic: "Parameters",
    prompt: "Turbidity measures the:",
    options: [
      "Dissolved oxygen content",
      "Cloudiness caused by suspended particles",
      "Acidity of the water",
      "Salt content",
    ],
    correctIndex: 1,
    explanation:
      "Turbidity is the cloudiness of water from suspended matter, which blocks light.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "hard",
    topic: "Macroinvertebrates",
    prompt:
      "A diverse population of EPT taxa (mayflies, stoneflies, caddisflies) indicates:",
    options: [
      "Poor water quality",
      "High pollution",
      "Good water quality",
      "Eutrophication",
    ],
    correctIndex: 2,
    explanation:
      "EPT taxa are pollution-intolerant, so their presence signals clean, well-oxygenated water.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "medium",
    topic: "Pollution",
    prompt: "Eutrophication is caused mainly by excess inputs of:",
    options: [
      "Oxygen",
      "Nutrients such as nitrogen and phosphorus",
      "Acidity",
      "Salt",
    ],
    correctIndex: 1,
    explanation:
      "Excess nutrients fuel algal blooms; their decay depletes oxygen and harms aquatic life.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "easy",
    topic: "The Water Cycle",
    prompt: "The continuous movement of water on, above, and below Earth's surface is the:",
    options: ["Carbon cycle", "Hydrologic cycle", "Nitrogen cycle", "Rock cycle"],
    correctIndex: 1,
    explanation: "The hydrologic (water) cycle describes water's movement through the environment.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "hard",
    topic: "Parameters",
    prompt: "Biochemical oxygen demand (BOD) measures:",
    options: [
      "The dissolved oxygen in the water",
      "The oxygen consumed by bacteria decomposing organic matter",
      "The water temperature",
      "The concentration of nutrients",
    ],
    correctIndex: 1,
    explanation:
      "High BOD means much oxygen is used by decomposers, signaling organic pollution.",
  },
  {
    eventName: "Water Quality",
    division: "BC",
    difficulty: "medium",
    topic: "Parameters",
    prompt: "Which pH range is generally healthy for most aquatic life?",
    options: ["3–4", "6.5–8.5", "9–10", "1–2"],
    correctIndex: 1,
    explanation: "Most aquatic organisms thrive in near-neutral pH, roughly 6.5–8.5.",
  },

  // ===================== Solar System (B) =====================
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "easy",
    topic: "Planets",
    prompt: "The largest planet in our Solar System is:",
    options: ["Saturn", "Jupiter", "Neptune", "Earth"],
    correctIndex: 1,
    explanation: "Jupiter is the largest planet, with a mass over twice that of all others combined.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "medium",
    topic: "Planets",
    prompt: "The four inner planets are rocky and are collectively called:",
    options: ["Gas giants", "Terrestrial planets", "Ice giants", "Dwarf planets"],
    correctIndex: 1,
    explanation:
      "Mercury, Venus, Earth, and Mars are terrestrial (Earth-like, rocky) planets.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "medium",
    topic: "Planets",
    prompt: "Which planet is known as the 'Red Planet'?",
    options: ["Venus", "Mars", "Mercury", "Jupiter"],
    correctIndex: 1,
    explanation: "Mars appears red due to iron oxide (rust) on its surface.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "hard",
    topic: "Planetary Features",
    prompt: "The Great Red Spot is a giant, long-lived storm on which planet?",
    options: ["Saturn", "Jupiter", "Neptune", "Mars"],
    correctIndex: 1,
    explanation:
      "Jupiter's Great Red Spot is an anticyclonic storm larger than Earth.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "medium",
    topic: "Small Bodies",
    prompt: "The main asteroid belt lies between the orbits of:",
    options: [
      "Earth and Mars",
      "Mars and Jupiter",
      "Jupiter and Saturn",
      "Saturn and Uranus",
    ],
    correctIndex: 1,
    explanation: "The asteroid belt occupies the region between Mars and Jupiter.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "easy",
    topic: "Small Bodies",
    prompt: "A comet is composed mainly of:",
    options: [
      "Molten rock",
      "Ice, dust, and rocky particles",
      "Gas only",
      "Solid iron",
    ],
    correctIndex: 1,
    explanation:
      "Comets are 'dirty snowballs' of ice, dust, and rock that vaporize near the Sun.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "hard",
    topic: "Planetary Features",
    prompt: "Which planet has the most prominent and visible ring system?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 1,
    explanation: "Saturn's extensive, bright rings make it the most famous ringed planet.",
  },
  {
    eventName: "Solar System",
    division: "B",
    difficulty: "medium",
    topic: "Dwarf Planets",
    prompt: "Which body was reclassified from a planet to a dwarf planet in 2006?",
    options: ["Ceres", "Pluto", "Eris", "Haumea"],
    correctIndex: 1,
    explanation:
      "Pluto was reclassified as a dwarf planet by the IAU under the new planetary definition.",
  },

  // ===================== Meteorology (B) =====================
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "easy",
    topic: "Atmosphere",
    prompt: "Most of our weather occurs in which layer of the atmosphere?",
    options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"],
    correctIndex: 1,
    explanation:
      "The troposphere, the lowest layer, contains most of the atmosphere's moisture and weather.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "medium",
    topic: "Pressure Systems",
    prompt: "Sinking, dry air is most often associated with:",
    options: [
      "Low pressure and storms",
      "High pressure and clear skies",
      "Low pressure and clear skies",
      "High pressure and heavy rain",
    ],
    correctIndex: 1,
    explanation:
      "High-pressure systems bring descending air, which warms, dries, and clears the sky.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "medium",
    topic: "Fronts",
    prompt:
      "A front along which cold air advances and forces warm air upward is a:",
    options: ["Warm front", "Cold front", "Stationary front", "Occluded front"],
    correctIndex: 1,
    explanation:
      "Cold fronts bring sharp temperature drops and often brief, intense storms.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "hard",
    topic: "Instruments",
    prompt: "Atmospheric pressure is measured with a(n):",
    options: ["Anemometer", "Barometer", "Hygrometer", "Thermometer"],
    correctIndex: 1,
    explanation: "A barometer measures air pressure (mercury or aneroid).",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "medium",
    topic: "Phase Changes",
    prompt: "The process by which water vapor becomes liquid water is:",
    options: ["Evaporation", "Condensation", "Sublimation", "Transpiration"],
    correctIndex: 1,
    explanation:
      "Condensation forms clouds and dew as vapor cools into liquid droplets.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "easy",
    topic: "Instruments",
    prompt: "Wind speed is measured with a(n):",
    options: ["Barometer", "Anemometer", "Thermometer", "Hygrometer"],
    correctIndex: 1,
    explanation: "An anemometer measures wind speed using rotating cups or propellers.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "hard",
    topic: "Humidity",
    prompt:
      "Relative humidity expresses the amount of water vapor in the air as a percentage of the:",
    options: [
      "Total air pressure",
      "Maximum the air can hold at that temperature",
      "Dew point",
      "Saturation vapor pressure at the poles",
    ],
    correctIndex: 1,
    explanation:
      "Relative humidity = (actual vapor pressure / saturation vapor pressure) × 100.",
  },
  {
    eventName: "Meteorology",
    division: "B",
    difficulty: "medium",
    topic: "Global Winds",
    prompt: "The Coriolis effect deflects moving air to the ______ in the Northern Hemisphere.",
    options: ["Left", "Right", "Upward", "Downward"],
    correctIndex: 1,
    explanation:
      "Earth's rotation deflects winds to the right in the Northern Hemisphere and left in the Southern.",
  },

  // ===================== Materials Science (C) =====================
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "easy",
    topic: "Material Classes",
    prompt: "The four main classes of engineering materials are metals, ceramics, polymers, and:",
    options: ["Composites", "Glasses", "Woods", "Elastomers"],
    correctIndex: 0,
    explanation:
      "Composites combine two or more classes (e.g., fiberglass = polymer + glass fiber).",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "medium",
    topic: "Stress & Strain",
    prompt:
      "On a stress-strain curve, the maximum stress the material withstands before fracture is the:",
    options: [
      "Yield strength",
      "Ultimate tensile strength",
      "Elastic modulus",
      "Proportional limit",
    ],
    correctIndex: 1,
    explanation:
      "The peak of the curve is the ultimate tensile strength (UTS).",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "medium",
    topic: "Elasticity",
    prompt:
      "The slope of the linear (elastic) portion of a stress-strain curve represents:",
    options: ["Young's modulus", "Yield strength", "Ductility", "Toughness"],
    correctIndex: 0,
    explanation:
      "Young's modulus (stiffness) is stress/strain in the elastic region.",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "hard",
    topic: "Deformation",
    prompt: "A material that can be drawn into a wire without breaking is described as:",
    options: ["Brittle", "Ductile", "Elastic", "Rigid"],
    correctIndex: 1,
    explanation:
      "Ductility is the ability to deform plastically (e.g., into wire) before fracture.",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "medium",
    topic: "Structure",
    prompt: "In metals, atoms are typically arranged in a:",
    options: [
      "Random disordered pattern",
      "Regular repeating crystal lattice",
      "Long single chain",
      "Layered glassy sheet",
    ],
    correctIndex: 1,
    explanation:
      "Most metals crystallize in ordered lattices (e.g., FCC, BCC, HCP).",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "hard",
    topic: "Polymers",
    prompt: "Polymers are large molecules built from repeating smaller units called:",
    options: ["Monomers", "Crystals", "Isotopes", "Alloys"],
    correctIndex: 0,
    explanation:
      "Many monomers link together (polymerize) to form long polymer chains.",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "medium",
    topic: "Composites",
    prompt:
      "In a composite, the continuous phase that surrounds the reinforcement is called the:",
    options: ["Reinforcement", "Matrix", "Fiber", "Filler"],
    correctIndex: 1,
    explanation:
      "The matrix binds the reinforcement and transfers stress between fibers/particles.",
  },
  {
    eventName: "Materials Science",
    division: "C",
    difficulty: "easy",
    topic: "Material Classes",
    prompt: "Glass and brick are examples of which material class?",
    options: ["Metals", "Ceramics", "Polymers", "Composites"],
    correctIndex: 1,
    explanation:
      "Ceramics are hard, brittle, nonmetallic solids such as glass, brick, and porcelain.",
  },

  // ===================== Circuit Lab =====================
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "easy",
    topic: "Ohm's Law",
    prompt: "Ohm's Law states that voltage V equals:",
    options: ["I + R", "I × R", "I / R", "R / I"],
    correctIndex: 1,
    explanation: "V = IR, where I is current and R is resistance.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Resistors",
    prompt: "Two 10-Ω resistors connected in series have a total resistance of:",
    options: ["5 Ω", "10 Ω", "20 Ω", "100 Ω"],
    correctIndex: 2,
    explanation: "Series resistances add: 10 + 10 = 20 Ω.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Resistors",
    prompt: "Two 10-Ω resistors connected in parallel have a total resistance of:",
    options: ["5 Ω", "10 Ω", "20 Ω", "2.5 Ω"],
    correctIndex: 0,
    explanation:
      "For two equal parallel resistors, R = 10/2 = 5 Ω.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "hard",
    topic: "Ohm's Law",
    prompt: "A 9-V battery drives 3 A through a resistor. The resistance is:",
    options: ["3 Ω", "27 Ω", "0.33 Ω", "6 Ω"],
    correctIndex: 0,
    explanation: "R = V / I = 9 / 3 = 3 Ω.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Series Circuits",
    prompt: "In a series circuit, the current is:",
    options: [
      "The same through every component",
      "Divided among parallel branches",
      "Zero everywhere",
      "Greatest at the battery only",
    ],
    correctIndex: 0,
    explanation:
      "A series circuit has a single path, so current is identical through all components.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "hard",
    topic: "Kirchhoff's Laws",
    prompt: "Kirchhoff's current (junction) law is a statement of the conservation of:",
    options: ["Energy", "Charge", "Mass", "Momentum"],
    correctIndex: 1,
    explanation:
      "The sum of currents into a junction equals the sum out, conserving charge.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "medium",
    topic: "Power",
    prompt: "The SI unit of electrical power is the:",
    options: ["Volt", "Ampere", "Watt", "Ohm"],
    correctIndex: 2,
    explanation: "Power (P = VI) is measured in watts.",
  },
  {
    eventName: "Circuit Lab",
    division: "BC",
    difficulty: "easy",
    topic: "Components",
    prompt: "A device that stores energy in an electric field is a:",
    options: ["Resistor", "Inductor", "Capacitor", "Diode"],
    correctIndex: 2,
    explanation:
      "Capacitors store charge (and energy) between two conductive plates.",
  },

  // ===================== Heredity (B) =====================
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "easy",
    topic: "Genetics Basics",
    prompt: "The genetic makeup of an organism (e.g., Tt) is its:",
    options: ["Phenotype", "Genotype", "Karyotype", "Allele"],
    correctIndex: 1,
    explanation:
      "Genotype is the combination of alleles; phenotype is the observable traits.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "medium",
    topic: "Monohybrid Cross",
    prompt: "In a cross Tt × Tt (tall dominant), the expected tall-to-short ratio is:",
    options: ["1:1", "3:1", "9:3:3:1", "All tall"],
    correctIndex: 1,
    explanation: "A heterozygous monohybrid cross yields a 3:1 dominant-to-recessive ratio.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "medium",
    topic: "Dihybrid Cross",
    prompt: "A dihybrid cross of two double-heterozygotes yields a phenotypic ratio of:",
    options: ["3:1", "1:2:1", "9:3:3:1", "1:1"],
    correctIndex: 2,
    explanation:
      "Independent assortment in a TtRr × TtRr cross produces a 9:3:3:1 ratio.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "hard",
    topic: "Sex Chromosomes",
    prompt: "In humans, biological sex is determined by the:",
    options: [
      "Autosomal pair 1 and 2",
      "X and Y chromosomes",
      "Autosomes 21 and 22",
      "All autosomes together",
    ],
    correctIndex: 1,
    explanation:
      "XX typically yields female development and XY male development.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "medium",
    topic: "Dominance",
    prompt: "An allele whose effect is masked by another allele is:",
    options: ["Dominant", "Recessive", "Codominant", "Sex-linked"],
    correctIndex: 1,
    explanation:
      "A recessive allele is only expressed when two copies are present (homozygous).",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "easy",
    topic: "Cell Division",
    prompt: "The division of a body cell into two identical daughter cells is:",
    options: ["Meiosis", "Mitosis", "Fertilization", "Crossing over"],
    correctIndex: 1,
    explanation:
      "Mitosis produces two genetically identical diploid daughter cells.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "hard",
    topic: "Monohybrid Cross",
    prompt:
      "Crossing RR (red) with rr (white), where red is dominant, produces offspring that are:",
    options: [
      "All red",
      "All white",
      "Half red, half white",
      "Red and white (codominant)",
    ],
    correctIndex: 0,
    explanation: "All offspring are Rr, so all show the dominant red phenotype.",
  },
  {
    eventName: "Heredity",
    division: "B",
    difficulty: "medium",
    topic: "Meiosis",
    prompt:
      "Compared to the parent cell, the cells produced by meiosis have:",
    options: [
      "The same chromosome number",
      "Double the chromosome number",
      "Half the chromosome number",
      "Triple the chromosome number",
    ],
    correctIndex: 2,
    explanation: "Meiosis is a reduction division producing haploid gametes.",
  },

  // ===================== Designer Genes (C) =====================
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "medium",
    topic: "Genome",
    prompt: "The complete set of genetic information in an organism is its:",
    options: ["Genotype", "Genome", "Proteome", "Karyotype"],
    correctIndex: 1,
    explanation: "The genome is all of an organism's hereditary information (DNA).",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "medium",
    topic: "Central Dogma",
    prompt: "During translation, mRNA codons are read to assemble a:",
    options: ["DNA molecule", "Polypeptide (protein)", "Lipid", "Carbohydrate"],
    correctIndex: 1,
    explanation: "Translation at the ribosome links amino acids into a polypeptide.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "hard",
    topic: "Transcription",
    prompt: "The enzyme that synthesizes mRNA from a DNA template is:",
    options: ["DNA polymerase", "RNA polymerase", "Helicase", "Ligase"],
    correctIndex: 1,
    explanation: "RNA polymerase carries out transcription.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "hard",
    topic: "Biotechnology",
    prompt: "Which technique separates DNA fragments by size using an electric field?",
    options: ["PCR", "Gel electrophoresis", "CRISPR", "Sequencing"],
    correctIndex: 1,
    explanation:
      "Gel electrophoresis moves negatively charged DNA through a gel; smaller fragments travel farther.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "medium",
    topic: "Base Pairing",
    prompt: "In DNA, adenine (A) always pairs with:",
    options: ["Guanine", "Cytosine", "Thymine", "Uracil"],
    correctIndex: 2,
    explanation: "A–T and G–C are the complementary base pairs in DNA.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "hard",
    topic: "Mutations",
    prompt: "A point mutation that produces a codon for the same amino acid is:",
    options: ["Missense", "Nonsense", "Silent", "Frameshift"],
    correctIndex: 2,
    explanation:
      "A silent mutation changes the DNA but not the encoded protein, due to codon redundancy.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "medium",
    topic: "Biotechnology",
    prompt: "The technique used to rapidly amplify (copy) a specific DNA segment is:",
    options: ["PCR", "Transcription", "Translation", "Cloning"],
    correctIndex: 0,
    explanation:
      "The polymerase chain reaction (PCR) makes millions of copies of a target DNA sequence.",
  },
  {
    eventName: "Designer Genes",
    division: "C",
    difficulty: "easy",
    topic: "DNA Structure",
    prompt: "The structure of DNA, described by Watson and Crick, is a:",
    options: ["Single strand", "Double helix", "Triple helix", "Closed circle"],
    correctIndex: 1,
    explanation: "DNA is a double helix of two antiparallel strands.",
  },

  // ===================== Geologic Mapping (C) =====================
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "medium",
    topic: "Strike & Dip",
    prompt: "The compass direction of a horizontal line in an inclined rock layer is the:",
    options: ["Dip", "Strike", "Plunge", "Trend"],
    correctIndex: 1,
    explanation: "Strike is the line of intersection of a bedding plane with a horizontal surface.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "medium",
    topic: "Strike & Dip",
    prompt: "The angle a rock layer tilts down from the horizontal is the:",
    options: ["Strike", "Dip", "Contour", "Slope"],
    correctIndex: 1,
    explanation: "Dip is measured perpendicular to strike, downward from horizontal.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "hard",
    topic: "Principles",
    prompt: "The principle of original horizontality states that sedimentary layers are deposited:",
    options: ["Vertically", "Horizontally", "At 45°", "Randomly"],
    correctIndex: 1,
    explanation:
      "Sediments settle from fluids in horizontal layers; tilting happens later.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "medium",
    topic: "Principles",
    prompt:
      "By the principle of superposition, in an undisturbed sequence the oldest layers are:",
    options: ["At the top", "In the middle", "At the bottom", "Randomly placed"],
    correctIndex: 2,
    explanation: "The bottom layer was deposited first and is therefore the oldest.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "hard",
    topic: "Folds",
    prompt: "A fold in which the OLDEST rocks are exposed in the center is a(n):",
    options: ["Syncline", "Anticline", "Monocline", "Basin"],
    correctIndex: 1,
    explanation:
      "Anticlines arch upward, eroding to expose older strata in the core.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "medium",
    topic: "Faults",
    prompt: "A fracture along which rocks on opposite sides have moved is a:",
    options: ["Joint", "Fault", "Fold", "Unconformity"],
    correctIndex: 1,
    explanation: "A fault is a fracture with measurable movement; a joint has none.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "hard",
    topic: "Unconformities",
    prompt: "A surface representing a gap in the geologic record is a(n):",
    options: ["Unconformity", "Fault", "Fold", "Contact"],
    correctIndex: 0,
    explanation:
      "An unconformity marks missing time due to erosion or non-deposition.",
  },
  {
    eventName: "Geologic Mapping",
    division: "C",
    difficulty: "easy",
    topic: "Maps",
    prompt: "A map showing the distribution, type, and age of surface rocks is a:",
    options: ["Topographic map", "Geologic map", "Road map", "Contour map"],
    correctIndex: 1,
    explanation: "Geologic maps use colors and contacts to depict rock units and structures.",
  },

  // ===================== Wind Power (BC) =====================
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "medium",
    topic: "Energy",
    prompt: "A wind turbine converts the ______ energy of moving air into electricity.",
    options: ["Potential", "Kinetic", "Thermal", "Chemical"],
    correctIndex: 1,
    explanation: "Wind is moving air, so turbines harness its kinetic energy.",
  },
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "medium",
    topic: "Power Equation",
    prompt: "Available wind power is proportional to the cube of the wind:",
    options: ["Density", "Speed", "Area", "Temperature"],
    correctIndex: 1,
    explanation: "Because P = ½ρAv³, power scales with speed cubed.",
  },
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "hard",
    topic: "Betz Limit",
    prompt: "The theoretical maximum fraction of wind power any turbine can extract is the:",
    options: ["Betz limit", "Carnot limit", "Doppler limit", "Ohm's law"],
    correctIndex: 0,
    explanation:
      "The Betz limit is about 59.3% — no turbine can capture more of the wind's kinetic energy.",
  },
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "easy",
    topic: "Components",
    prompt: "Which component directly captures the wind to create rotational motion?",
    options: ["Gearbox", "Generator", "Turbine blades (rotor)", "Tower"],
    correctIndex: 2,
    explanation: "The blades (rotor) catch the wind and spin the shaft.",
  },
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "hard",
    topic: "Power Equation",
    prompt: "If wind speed doubles, the power available increases by a factor of:",
    options: ["2", "4", "8", "16"],
    correctIndex: 2,
    explanation: "With v³ dependence, doubling speed multiplies power by 2³ = 8.",
  },
  {
    eventName: "Wind Power",
    division: "BC",
    difficulty: "medium",
    topic: "Energy Conversion",
    prompt: "The generator in a wind turbine converts mechanical energy into:",
    options: ["Thermal energy", "Electrical energy", "Chemical energy", "Nuclear energy"],
    correctIndex: 1,
    explanation:
      "Electromagnetic induction in the generator produces electrical energy from rotation.",
  },

  // ===================== Machines (B) =====================
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "easy",
    topic: "Simple Machines",
    prompt: "A wheel with a grooved rim that holds a rope is a:",
    options: ["Lever", "Pulley", "Wedge", "Screw"],
    correctIndex: 1,
    explanation: "A pulley redirects force and can provide mechanical advantage.",
  },
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "medium",
    topic: "Mechanical Advantage",
    prompt: "Mechanical advantage is defined as:",
    options: [
      "Input force ÷ output force",
      "Output force ÷ input force",
      "Output distance ÷ input distance",
      "Input work ÷ output work",
    ],
    correctIndex: 1,
    explanation: "MA = output force / input force.",
  },
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "medium",
    topic: "Work",
    prompt: "For an ideal (frictionless) machine, work input ______ work output.",
    options: ["Is greater than", "Is less than", "Equals", "Is unrelated to"],
    correctIndex: 2,
    explanation:
      "Conservation of energy means work in equals work out for an ideal machine.",
  },
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "hard",
    topic: "Levers",
    prompt: "A lever with the fulcrum located between the effort and the load is:",
    options: ["First-class", "Second-class", "Third-class", "Fourth-class"],
    correctIndex: 0,
    explanation:
      "A first-class lever (e.g., seesaw) has the fulcrum in the middle.",
  },
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "easy",
    topic: "Simple Machines",
    prompt: "The six simple machines include the lever, pulley, wheel-and-axle, wedge, inclined plane, and:",
    options: ["Gear", "Screw", "Spring", "Ramp"],
    correctIndex: 1,
    explanation: "The screw is an inclined plane wrapped around a cylinder.",
  },
  {
    eventName: "Machines",
    division: "BC",
    difficulty: "medium",
    topic: "Inclined Plane",
    prompt: "An inclined plane reduces the input force needed by increasing the:",
    options: ["Weight", "Distance over which force is applied", "Friction", "Mass"],
    correctIndex: 1,
    explanation:
      "Trading distance for force: a longer, gentler ramp needs less force over more distance.",
  },
];
