/**
 * Bat Algorithm Family
 * 
 * Re-exports the refactored BatAlgorithm using the new framework.
 */

export { BatAlgorithm, createDefaultBatConfig } from './standard';
export type { BatConfig, BatMetadata } from './standard';

// TODO: Refactor these variants to use new framework:
// - ChaoticLevyBatAlgorithm
// - SelfAdaptiveBatAlgorithm
// - AdaptiveBatAlgorithm
// - BatDEHybrid
// - BatPSOHybrid
// - BatSAHybrid
// - BatHarmonyHybrid
// - BatABCHybrid
