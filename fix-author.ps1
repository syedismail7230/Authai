#!/usr/bin/env pwsh

$envFilter = @"
if (`$GIT_COMMITTER_EMAIL -eq 'nationaltravels.dev@gmail.com') {
    `$GIT_COMMITTER_NAME = 'syedismailart'
    `$GIT_COMMITTER_EMAIL = 'syedismailart@gmail.com'
}
if (`$GIT_AUTHOR_EMAIL -eq 'nationaltravels.dev@gmail.com') {
    `$GIT_AUTHOR_NAME = 'syedismailart'
    `$GIT_AUTHOR_EMAIL = 'syedismailart@gmail.com'
}
"@

git filter-branch -f --env-filter $envFilter -- --all
