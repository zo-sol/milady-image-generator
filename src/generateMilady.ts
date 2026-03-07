import sharp, { OverlayOptions } from "sharp";
import * as fs from "fs";
import * as path from "path";
import {
  ASSET_DIR, LAYERS, EXCLUSIONS, MASKABLE_EYES,
  BLEND_MODES, Z_OVERRIDES, SKIN_WEIGHTS,
} from "./miladyConfig";
import { SeededRandom } from "./seededRandom";

function pickRandom(arr: string[], rng: SeededRandom): string {
  return arr[Math.floor(rng.next() * arr.length)];
}

function pickWeighted(items: string[], weights: Record<string, number>, rng: SeededRandom): string {
  const totalExplicit = Object.values(weights).reduce((s, w) => s + w, 0);
  const unweighted = items.filter(i => !(i in weights));
  const eachShare = unweighted.length > 0 ? (1 - totalExplicit) / unweighted.length : 0;

  const roll = rng.next();
  let cumulative = 0;
  for (const item of items) {
    cumulative += weights[item] ?? eachShare;
    if (roll < cumulative) return item;
  }
  return items[items.length - 1];
}

function listItems(category: string): string[] {
  const dir = path.join(ASSET_DIR, category);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".png"))
    .map(f => f.replace(".png", ""));
}

function getZ(category: string, item: string): number {
  return Z_OVERRIDES[category]?.[item] ?? LAYERS.find(l => l.name === category)!.z;
}

function rollTraits(rng: SeededRandom): { category: string; item: string }[] {
  const selected: Record<string, string> = {};

  const selectableLayers = LAYERS.filter(l => !("hidden" in l));

  for (const layer of selectableLayers) {
    const items = listItems(layer.name);
    if (items.length === 0) continue;

    if ("noneChance" in layer && rng.next() < layer.noneChance) {
      continue;
    }

    selected[layer.name] = layer.name === "Skin"
      ? pickWeighted(items, SKIN_WEIGHTS, rng)
      : pickRandom(items, rng);
  }

  if (selected["Eye Color"] && !MASKABLE_EYES.includes(selected["Eyes"])) {
    delete selected["Eye Color"];
  }

  for (const [cat, rules] of Object.entries(EXCLUSIONS)) {
    const item = selected[cat];
    if (item && rules[item]) {
      for (const excluded of rules[item]) {
        delete selected[excluded];
      }
    }
  }

  if (selected["Skin"] && selected["Shirt"]) {
    selected["UnclothedBase"] = selected["Skin"];
  }

  return Object.entries(selected)
    .map(([category, item]) => ({ category, item, z: getZ(category, item) }))
    .sort((a, b) => a.z - b.z)
    .map(({ category, item }) => ({ category, item }));
}

async function composeMilady(traits: { category: string; item: string }[]): Promise<Buffer> {
  if (traits.length === 0) throw new Error("No traits to compose");

  const basePath = path.join(ASSET_DIR, traits[0].category, `${traits[0].item}.png`);
  let pipeline = sharp(basePath);

  if (traits.length > 1) {
    const overlays: OverlayOptions[] = traits.slice(1).map(({ category, item }) => {
      const blend = BLEND_MODES[category]?.[item];
      return {
        input: path.join(ASSET_DIR, category, `${item}.png`),
        top: 0,
        left: 0,
        ...(blend ? { blend: blend as any } : {}),
      };
    });
    pipeline = pipeline.composite(overlays);
  }

  return pipeline.png().toBuffer();
}

export async function generateFromWallet(address: string): Promise<Buffer> {
  return composeMilady(rollTraits(SeededRandom.fromAddress(address)));
}
