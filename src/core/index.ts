/**
 * Core Framework Index
 * 
 * Re-exports all core components for easy importing.
 * 
 * Usage:
 *   import { BaseContinuous2DOptimizer, rastrigin2D, levyFlight2D } from './core';
 */

// Types
export * from './types';

// Base classes
export { BaseOptimizer, BaseContinuous2DOptimizer } from './base-optimizer';

// Test functions
export * from './test-functions';

// Modifiers
export * from './modifiers';
