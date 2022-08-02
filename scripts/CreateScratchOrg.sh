#!/bin/zsh
#
#  Creates a new scratch org and populates it with sample data.
#
#  Copyright (c) 2022, salesforce.com, inc.
#  All rights reserved.
#  SPDX-License-Identifier: BSD-3-Clause
#  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
#
#  Contact: john.meyer@salesforce.com

readonly orgAlias=$(jq --raw-output .defaultusername < .sfdx/sfdx-config.json) || {
    echo "Make sure that \"jq\" is installed and that \"defaultusername\" is defined in .sfdx/sfdx-config.json." >&2
    exit 1
}
readonly devHubUserName=$(jq --raw-output .defaultdevhubusername < .sfdx/sfdx-config.json) || {
    echo "Make sure that \"jq\" is installed and that \"defaultdevhubusername\" is defined in .sfdx/sfdx-config.json." >&2
    exit 1
}

echo "*** Creating scratch org ..."
sfdx force:org:create \
    --definitionfile config/project-scratch-def.json \
    --type scratch \
    --nonamespace \
    --targetdevhubusername "$devHubUserName" \
    --setdefaultusername \
    --setalias "$orgAlias" \
    --durationdays 30 \
    --loglevel error || exit 1
echo "*** Pushing metadata to scratch org ..."
sfdx force:source:push || exit 1
echo "*** Generating password for your user ..."
sfdx force:user:password:generate --targetusername "$orgAlias" --loglevel error
echo "*** Setting time zone for your user ..."
sfdx force:data:record:update --sobjecttype User --where "Name='User User'" --values "TimeZoneSidKey='America/New_York'" --loglevel error
echo "*** Enabling debug mode for your user  ..."
sfdx force:data:record:update --sobjecttype User --where "Name='User User'" --values "UserPreferencesUserDebugModePref='true'" --loglevel error
echo "*** Creating sample data ..."
sfdx force:apex:execute --apexcodefile "scripts/apex/SampleData.apex" --targetusername "$orgAlias" --loglevel error