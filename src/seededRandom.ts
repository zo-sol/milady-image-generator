import crypto from "crypto";

// Mulberry32 PRNG - deterministic random from a 32-bit seed
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  static fromAddress(address: string): SeededRandom {
    const hash = crypto.createHash("sha256").update(address).digest();
    return new SeededRandom(hash.readUInt32BE(0));
  }
}
