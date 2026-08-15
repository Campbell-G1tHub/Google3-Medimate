This is our group repository for Google3 IT Project working on: Medimate for Medical Pantry 

# Development Tips:
- Branches are cheap, merge conflicts are not - separate logical features into individual branches (i.e feat/add-new-auth-method)
- When on a feature branch, frequently **rebase** with main (rather than merge to ensure clean git history). 
Example
```
git switch main
git pull
git switch feat/add-new-auth-method
git rebase origin/main
git push --force-with-lease
```
The force flag is incredibly important as it ensures your commits remain contiguous rather than fragmented and mixed with commits from main.

- Try follow these [standards](https://www.conventionalcommits.org/en/v1.0.0/) standards for commits 
Example
```
git commit -m "feat: add new authentication method"
git commit -m "fix: fix stale closure bug in dashboard"
git commit -m "chore: Removed dead code"
git commit -m "refactor: Simplified backend logic for changing membership"
```

- Formatting is already handled using Biome. Any code committed will be formatted automatically.

