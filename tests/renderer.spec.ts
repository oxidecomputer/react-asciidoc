import { expect, test } from '@playwright/test'

const blocks = [
  'audio',
  'admonition',
  'coList',
  'dList',
  'document',
  'embedded',
  'example',
  'floatingTitle',
  'image',
  'inlineAnchor',
  'inlineBreak',
  'inlineButton',
  'inlineCallout',
  'inlineFootnote',
  'inlineImage',
  'inlineKbd',
  'inlineMenu',
  'inlineQuoted',
  'listing',
  'literal',
  'oList',
  'open',
  'outline',
  'pageBreak',
  'paragraph',
  'pass',
  'preamble',
  'quote',
  'section',
  'sidebar',
  'stem',
  'table',
  'thematicBreak',
  'toc',
  'uList',
  'verse',
  'video',
]

blocks.forEach((block) => {
  test(`${block}_html`, async ({ page }) => {
    await page.goto(`/?example=${block}&renderer=html`)
    await expect(page).toHaveScreenshot(`${block}.png`, { fullPage: true })
  })

  test(`${block}_react`, async ({ page }) => {
    await page.goto(`/?example=${block}&renderer=react`)
    await expect(page).toHaveScreenshot(`${block}.png`, { fullPage: true })
  })
})

// test(`writersGuide_html`, async ({ page }) => {
//   await page.goto(`/?example=writersGuide&renderer=html`)
//   await expect(page).toHaveScreenshot(`writersGuide.png`, {
//     fullPage: true,
//     timeout: 60000,
//   })
// })
//
// test(`writersGuide_react`, async ({ page }) => {
//   await page.goto(`/?example=writersGuide&renderer=react`)
//   await expect(page).toHaveScreenshot(`writersGuide.png`, {
//     fullPage: true,
//     timeout: 60000,
//   })
// })
