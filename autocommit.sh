#/bin/bash

# git autocommit script.
# Checks to see if there has been a commit in the last preset timeframe.
# If there hasn't been, it automatically commits changes to source control.

# Usage: autocommit.sh <timeframe>
#
# <timeframe> is any time or date token accepted by the git log --since option.

git pull
git add --all
git commit -a -m "Auto-commit from Team Snoxy"
git push
