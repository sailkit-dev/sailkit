export type {
  LinkSyntax,
  BrokenLinkBehavior,
  BrokenLink,
  RemarkMagicLinksConfig,
  Collection,
  CollectionEntry,
} from './remark-magic-links.js';
export { remarkMagicLinks, default as remarkMagicLinksDefault, createSlugResolver } from './remark-magic-links.js';

export type { BrokenLinkResult, CheckLinksResult } from './check-links.js';
export { checkLinks, formatCheckResults } from './check-links.js';
