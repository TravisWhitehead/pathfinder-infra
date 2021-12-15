#!/usr/bin/env bash
set -euo pipefail

pulumi config set env $ENV
pulumi config set dbUser pathfinder
pulumi config set --secret dbPassword $(pwgen 32 1)
