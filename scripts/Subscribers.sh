#!/bin/zsh
#
#  Lists all of the orgs that have installed packages from this dev hub.
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

sfdx force:data:soql:query \
    --query "SELECT Id, Name, NamespacePrefix, PackageCategory FROM MetadataPackage ORDER BY Id" \
    --targetusername "$devHubOrgAlias"
sfdx force:data:soql:query \
    --query "SELECT MetadataPackageId, count(Id) Installs FROM PackageSubscriber WHERE InstalledStatus = 'i' GROUP BY MetadataPackageId ORDER BY MetadataPackageId" \
    --targetusername "$devHubOrgAlias"