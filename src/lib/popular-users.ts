/** Curated, meaningful profiles worth prerendering + indexing. These power the
 *  "try these" chips, the sitemap, and generateStaticParams for /u/[username].
 *  Arbitrary usernames are deliberately excluded so we never emit thin pages. */
export const POPULAR_USERS = [
  "torvalds",
  "sindresorhus",
  "addyosmani",
  "gaearon",
  "jashkenas",
  "yyx990803",
  "rauchg",
  "tj",
] as const;

export type PopularUser = (typeof POPULAR_USERS)[number];
