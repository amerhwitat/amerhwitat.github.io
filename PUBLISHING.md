# Portfolio publishing

## Public web

The portfolio is published through GitHub Pages at `https://amerhwitat.github.io/`. GitHub Pages supports static project sites directly from repositories.

## Deep web

"Deep web" is not a separate hosting protocol. A page can be publicly reachable by an exact URL while remaining unindexed or not prominently indexed. The portfolio uses direct repository and project URLs for this layer.

## Dark web

Dark-web publication is intentionally separated from GitHub Pages. A Tor onion service requires a web server under the operator's control and Tor configuration for that server. No private keys, server credentials, or hidden-service secrets are stored in GitHub repositories.

If an operator-controlled Tor server is later provided, this portfolio can be mirrored there without changing the canonical GitHub source.

## Private repositories

Private repositories are not exposed through the public portfolio. `VanG` remains private unless its owner explicitly changes its visibility.

## Security boundary

Public publication does not expose private credentials, wallet keys, recovery phrases, CI secrets, or server credentials. Repository content should be reviewed before any additional mirror is created.
