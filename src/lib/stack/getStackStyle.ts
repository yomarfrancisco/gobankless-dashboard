/**
 * Card Stack Style Calculator
 * 
 * Centralizes the math for computing card positions, sizes, and z-index
 * based on depth (0 = top card, increasing for cards behind).
 */

export type StackStyle = {
  widthPx: number;  // clamp to >= 270 (or current back width) to avoid collapse
  heightPx: number;
  topPx: number;
  leftPx: number;
  zIndex: number;
};

const BASE_WIDTH_PX = 398;
const WIDTH_STEP_PX = 32;
const BASE_HEIGHT_PX = 238;
const HEIGHT_STEP_PX = 25;
const Y_STEP_PX = 50;
const X_STEP_PX = 16;
const MIN_WIDTH_PX = 270; // Prevent cards from collapsing too small

export function getStackStyle(depth: number, total: number): StackStyle {
  const maxDepth = total - 1;
  
  const widthPx = Math.max(MIN_WIDTH_PX, BASE_WIDTH_PX - WIDTH_STEP_PX * depth);
  const heightPx = BASE_HEIGHT_PX - HEIGHT_STEP_PX * depth;
  
  return {
    widthPx,
    heightPx,
    topPx: Y_STEP_PX * depth,
    leftPx: X_STEP_PX * depth,
    zIndex: (maxDepth + 1) - depth,
  };
}

