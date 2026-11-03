# Public-source hygiene

Only the placeholder `.env.example` belongs in source control. Keep real credentials in local environment files or the deployment platform's secret store. Never put AI keys or Supabase service-role credentials in browser-exposed `VITE_*` settings.

The ignore rules exclude local environments and backup copies, private keys, database files, uploads, logs, host-specific identity and generated output. Git ignores do not remove files already tracked and do not scan source code for embedded secrets. Before pushing, review `git diff --cached` and run a secret scanner such as `gitleaks git . --log-opts=--all --redact`.

Use a GitHub no-reply address for commit author and committer metadata. Use portable paths in setup instructions.

After a history cleanup, collaborators should make a fresh clone and carefully transfer any uncommitted work. Merging an old branch can reintroduce the removed history. Other repositories, forks, previous downloads and hosting-service archives require separate review.

Rewriting branches does not guarantee deletion of old commit URLs or cached objects on GitHub. Follow [GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) for retained references and support requests. Rotate any actual exposed credential even after removing it from history.
