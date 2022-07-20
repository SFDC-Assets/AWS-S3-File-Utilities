#!/bin/zsh
#
#  Creates a new package version.
#
#  Copyright (c) 2022, salesforce.com, inc.
#  All rights reserved.
#  SPDX-License-Identifier: BSD-3-Clause
#  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
#
#  Contact: john.meyer@salesforce.com

readonly devHubOrgAlias=$(jq --raw-output .defaultdevhubusername < .sfdx/sfdx-config.json) || {
    echo "Make sure that \"jq\" is installed and that \"defaultdevhubusername\" is defined in .sfdx/sfdx-config.json." >&2
    exit 1
}

sfdx force:package:version:create \
    --installationkeybypass \
    --wait 10 \
    --package "AWS S3 File Utilities" \
    --path "force-app" \
    --codecoverage \
    --targetdevhubusername "$devHubOrgAlias"