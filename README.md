# Skatteministeriet nyheder RSS

This project fetches news from `https://skm.dk/api/indexSearch` and exposes them as standard RSS 2.0 and Atom feeds, suitable for any feed reader.

## Local development

Using [`pnpm`](https://pnpm.io/):

```bash
pnpm i
pnpm build
pnpm start
```

This generates `public/rss.xml` and `public/atom.xml`, which you can open directly or serve over HTTP and subscribe to in an RSS reader.

You can optionally pass the base URL as a CLI argument instead of using the `FEED_BASE_URL` environment variable:

```bash
pnpm start your-github-username
```

You can also use `npm` if you prefer, replacing `pnpm` with `npm` in the commands above.

## GitHub Actions / GitHub Pages

The workflow in `.github/workflows/generate-feeds.yml` runs on a schedule and publishes the feeds via GitHub Pages.

For this repository on GitHub under the `carlreid` user, the published feeds are:

- `https://carlreid.github.io/skatteministeriet-nyheder-rss/rss.xml`
- `https://carlreid.github.io/skatteministeriet-nyheder-rss/atom.xml`

If you fork this project, your feeds will be available at:

- `https://<your-user>.github.io/skatteministeriet-nyheder-rss/rss.xml`
- `https://<your-user>.github.io/skatteministeriet-nyheder-rss/atom.xml`

In your own GitHub Actions workflow you can either:

- Pass the base URL as a CLI argument, e.g. `node dist/index.js https://<your-user>.github.io/skatteministeriet-nyheder-rss`, or
- Set the `FEED_BASE_URL` environment variable in the workflow to the base URL where the feeds are hosted.
