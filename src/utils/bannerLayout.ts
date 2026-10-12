import { BannerButtonOverlay } from '@/data/siteData'

export interface AdjustedButtonPos {
  id: string
  original: BannerButtonOverlay
  adjustedLeftPercent: number
  adjustedTopPercent: number
  scale: number
}

/**
 * Computes non-overlapping positions and scales for banner hotspot buttons.
 * Guarantees a minimum gap of `minGapPx` (default 10px) between buttons
 * and prioritizes scaling down on smaller screens before repositioning.
 */
export function calculateAdaptiveButtonPositions(
  buttons: BannerButtonOverlay[] | undefined,
  containerWidth: number,
  containerHeight: number,
  measuredSizes?: Map<string, { width: number; height: number }>,
  minGapPx: number = 10,
  paddingEdgePx: number = 8
): AdjustedButtonPos[] {
  if (!buttons || buttons.length === 0) return []

  const isMobile = containerWidth > 0 && containerWidth < 768
  const isNarrowMobile = containerWidth > 0 && containerWidth < 480

  // 1. Calculate base scale factor based on screen width and button count (Priority: Scale down)
  let baseScale = 1.0
  if (isNarrowMobile) {
    baseScale = buttons.length >= 3 ? 0.72 : buttons.length === 2 ? 0.8 : 0.88
  } else if (isMobile) {
    baseScale = buttons.length >= 3 ? 0.82 : 0.92
  }

  // 2. Prepare items with dimensions
  const items = buttons.map((btn) => {
    const origX = (btn.posX / 100) * (containerWidth || 1000)
    const origY = (btn.posY / 100) * (containerHeight || 350)

    let w = 110
    let h = 32
    if (measuredSizes && measuredSizes.has(btn.id)) {
      const ms = measuredSizes.get(btn.id)!
      w = ms.width / (baseScale || 1)
      h = ms.height / (baseScale || 1)
    } else {
      const labelLen = (btn.label || '').length
      const charWidth = btn.size === 'sm' ? 6.5 : btn.size === 'lg' ? 8.5 : 7.5
      const extraPad = btn.size === 'sm' ? 18 : btn.size === 'lg' ? 28 : 22
      const iconExtra = btn.actionType === 'phone' ? 14 : 0
      w = Math.max(60, labelLen * charWidth + extraPad + iconExtra)
      h = btn.size === 'sm' ? 26 : btn.size === 'lg' ? 38 : 32
    }

    return {
      id: btn.id,
      original: btn,
      x: origX,
      y: origY,
      w: w * baseScale,
      h: h * baseScale,
      baseW: w,
      baseH: h,
      scale: baseScale,
    }
  })

  if (items.length <= 1 || !containerWidth || !containerHeight) {
    return items.map((it) => ({
      id: it.id,
      original: it.original,
      adjustedLeftPercent: it.original.posX,
      adjustedTopPercent: it.original.posY,
      scale: it.scale,
    }))
  }

  // 3. Check for collisions & progressively downscale if needed (Priority 1: scale down)
  let currentScale = baseScale
  for (let step = 0; step < 3; step++) {
    let hasOverlap = false
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itA = items[i]
        const itB = items[j]
        const reqDistX = (itA.w + itB.w) / 2 + minGapPx
        const reqDistY = (itA.h + itB.h) / 2 + minGapPx
        const dx = Math.abs(itA.x - itB.x)
        const dy = Math.abs(itA.y - itB.y)

        if (dx < reqDistX && dy < reqDistY) {
          hasOverlap = true
          break
        }
      }
      if (hasOverlap) break
    }

    if (hasOverlap && currentScale > 0.65 && isMobile) {
      currentScale = Math.max(0.65, currentScale - 0.08)
      items.forEach((it) => {
        it.scale = currentScale
        it.w = it.baseW * currentScale
        it.h = it.baseH * currentScale
      })
    } else {
      break
    }
  }

  // 4. Multi-pass repulsive separation (Physics relaxation: minimum gap >= minGapPx)
  const maxIterations = 25
  for (let iter = 0; iter < maxIterations; iter++) {
    let anyCollision = false

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itA = items[i]
        const itB = items[j]

        const reqDistX = (itA.w + itB.w) / 2 + minGapPx
        const reqDistY = (itA.h + itB.h) / 2 + minGapPx

        const dx = itB.x - itA.x
        const dy = itB.y - itA.y

        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        if (absDx < reqDistX && absDy < reqDistY) {
          anyCollision = true
          const overlapX = reqDistX - absDx
          const overlapY = reqDistY - absDy

          // Determine preferred separation axis
          if (overlapX <= overlapY * 1.3 || absDx >= absDy) {
            const pushDir = dx === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dx)
            const shift = overlapX / 2 + 0.5
            itA.x -= pushDir * shift
            itB.x += pushDir * shift
          } else {
            const pushDir = dy === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dy)
            const shift = overlapY / 2 + 0.5
            itA.y -= pushDir * shift
            itB.y += pushDir * shift
          }

          // Bound clamp
          const halfWA = itA.w / 2
          const halfHA = itA.h / 2
          const halfWB = itB.w / 2
          const halfHB = itB.h / 2

          if (itA.x - halfWA < paddingEdgePx) {
            itA.x = paddingEdgePx + halfWA
            itA.y += (itA.y > containerHeight / 2 ? -1 : 1) * 8
          } else if (itA.x + halfWA > containerWidth - paddingEdgePx) {
            itA.x = containerWidth - paddingEdgePx - halfWA
            itA.y += (itA.y > containerHeight / 2 ? -1 : 1) * 8
          }

          if (itB.x - halfWB < paddingEdgePx) {
            itB.x = paddingEdgePx + halfWB
            itB.y += (itB.y > containerHeight / 2 ? -1 : 1) * 8
          } else if (itB.x + halfWB > containerWidth - paddingEdgePx) {
            itB.x = containerWidth - paddingEdgePx - halfWB
            itB.y += (itB.y > containerHeight / 2 ? -1 : 1) * 8
          }

          itA.y = Math.max(paddingEdgePx + halfHA, Math.min(containerHeight - paddingEdgePx - halfHA, itA.y))
          itB.y = Math.max(paddingEdgePx + halfHB, Math.min(containerHeight - paddingEdgePx - halfHB, itB.y))
        }
      }
    }

    if (!anyCollision) break
  }

  // 5. Final boundary clamp for all items
  return items.map((it) => {
    const halfW = it.w / 2
    const halfH = it.h / 2
    const clampedX = Math.max(paddingEdgePx + halfW, Math.min(containerWidth - paddingEdgePx - halfW, it.x))
    const clampedY = Math.max(paddingEdgePx + halfH, Math.min(containerHeight - paddingEdgePx - halfH, it.y))

    const leftPct = (clampedX / containerWidth) * 100
    const topPct = (clampedY / containerHeight) * 100

    return {
      id: it.id,
      original: it.original,
      adjustedLeftPercent: Number(leftPct.toFixed(2)),
      adjustedTopPercent: Number(topPct.toFixed(2)),
      scale: Number(it.scale.toFixed(2)),
    }
  })
}
