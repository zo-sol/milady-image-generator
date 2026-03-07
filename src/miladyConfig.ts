import path from "path";

export const ASSET_DIR = path.resolve(__dirname, "..", "assets");

export const LAYERS = [
  { name: "Background",      z: 0                      },
  { name: "Skin",            z: 1                      },
  { name: "UnclothedBase",   z: 1,   hidden: true      },
  { name: "Face",            z: 2                      },
  { name: "Eyes",            z: 3                      },
  { name: "Eye Color",       z: 4                      },
  { name: "Mouth",           z: 4                      },
  { name: "Neck",            z: 5                      },
  { name: "Necklaces",       z: 5,   noneChance: 2 / 3 },
  { name: "Shirt",           z: 6                      },
  { name: "Hair",            z: 7                      },
  { name: "Brows",           z: 8                      },
  { name: "Earrings",        z: 9                      },
  { name: "Face Decoration", z: 10,  noneChance: 0.8   },
  { name: "Glasses",         z: 10,  noneChance: 0.75  },
  { name: "Hat",             z: 11,  noneChance: 0.5   },
  { name: "Overlay",         z: 13,  noneChance: 0.9   },
] as const;

export const EXCLUSIONS: Record<string, Record<string, string[]>> = {
  Hat:  { "Strawberry Hat": ["Hair", "Earrings"] },
  Eyes: { "Chinese": ["Brows"] },
};

export const MASKABLE_EYES = ["Classic", "Crying", "Dilated", "Heart", "Sleepy", "Sparkle", "Teary"];

export const BLEND_MODES: Record<string, Record<string, string>> = {
  Overlay: {
    "M1 Blood": "colour-burn",
    "M2 Blood": "colour-burn",
    "M3 Blood": "colour-burn",
    "M4 Blood": "colour-burn",
  },
};

export const Z_OVERRIDES: Record<string, Record<string, number>> = {
  Overlay: { "Banana Sticker": 9 },
};

export const SKIN_WEIGHTS: Record<string, number> = { Pink: 0.8 };
