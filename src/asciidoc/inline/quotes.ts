import { QSubEntry } from './types'

const cgWord = 'A-Za-z0-9_'
const ccWord = `[${cgWord}]`
const ccAny = '[\\s\\S]'
const QuoteAttributeListRxt = '\\[([^\\[\\]]+)\\]'

export const QUOTE_SUBS: {
  nonCompat: QSubEntry[]
  compat: QSubEntry[]
} = {
  nonCompat: [
    {
      type: 'strong',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?\\*\\*(${ccAny}+?)\\*\\*`,
        'm'
      ),
    },
    {
      type: 'strong',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?\\*(\\S|\\S${ccAny}*?\\S)\\*(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'double',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?"\`(\\S|\\S${ccAny}*?\\S)\`"(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'single',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:\`}])(?:${QuoteAttributeListRxt})?'\`(\\S|\\S${ccAny}*?\\S)\`'(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'monospaced',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?\`\`(${ccAny}+?)\`\``,
        'm'
      ),
    },
    {
      type: 'monospaced',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:"'\`}])(?:${QuoteAttributeListRxt})?\`(\\S|\\S${ccAny}*?\\S)\`(?!["'\`${cgWord}])`,
        'm'
      ),
    },
    {
      type: 'emphasis',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?__(${ccAny}+?)__`,
        'm'
      ),
    },
    {
      type: 'emphasis',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?_(\\S|\\S${ccAny}*?\\S)_(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'mark',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?##(${ccAny}+?)##`,
        'm'
      ),
    },
    {
      type: 'mark',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord}&;:}])(?:${QuoteAttributeListRxt})?#(\\S|\\S${ccAny}*?\\S)#(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'superscript',
      scope: 'unconstrained',
      rx: /\\?(?:\[([^\[\]]+)\])?\^(\S+?)\^/,
    },
    {
      type: 'subscript',
      scope: 'unconstrained',
      rx: /\\?(?:\[([^\[\]]+)\])?~(\S+?)~/,
    },
  ],

  compat: [
    {
      type: 'strong',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?\\*\\*(${ccAny}+?)\\*\\*`,
        'm'
      ),
    },
    {
      type: 'strong',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?\\*(\\S|\\S${ccAny}*?\\S)\\*(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'double',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?\`\`(\\S|\\S${ccAny}*?\\S)''(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'emphasis',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?'(\\S|\\S${ccAny}*?\\S)'(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'monospaced',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?\\+\\+(${ccAny}+?)\\+\\+`,
        'm'
      ),
    },
    {
      type: 'monospaced',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?\\+(\\S|\\S${ccAny}*?\\S)\\+(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'single',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?\`(\\S|\\S${ccAny}*?\\S)'(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'emphasis',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?__(${ccAny}+?)__`,
        'm'
      ),
    },
    {
      type: 'emphasis',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord};:}])(?:${QuoteAttributeListRxt})?_(\\S|\\S${ccAny}*?\\S)_(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'mark',
      scope: 'unconstrained',
      rx: new RegExp(
        `\\\\?(?:${QuoteAttributeListRxt})?##(${ccAny}+?)##`,
        'm'
      ),
    },
    {
      type: 'mark',
      scope: 'constrained',
      rx: new RegExp(
        `(^|[^${cgWord}&;:}])(?:${QuoteAttributeListRxt})?#(\\S|\\S${ccAny}*?\\S)#(?!${ccWord})`,
        'm'
      ),
    },
    {
      type: 'superscript',
      scope: 'unconstrained',
      rx: /\\?(?:\[([^\[\]]+)\])?\^(\S+?)\^/,
    },
    {
      type: 'subscript',
      scope: 'unconstrained',
      rx: /\\?(?:\[([^\[\]]+)\])?~(\S+?)~/,
    },
  ],
}