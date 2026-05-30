# Deploying your portfolio

Your site is a finished static website (plain HTML/CSS/JS) and the local Git
repository is **already committed and ready to publish**. The only step left is
the one that cannot be done for you for security reasons: **logging into your
GitHub account.** Everything after that is automated.

---

## Fastest way — run the deploy script (recommended)

1. Open the `Portfolio` folder.
2. Right-click **`deploy.ps1`** → **Run with PowerShell**.
   (Or in a terminal: `powershell -ExecutionPolicy Bypass -File deploy.ps1`)
3. When prompted, choose: **GitHub.com → HTTPS → Login with a web browser**,
   then approve in the browser that opens.

That's it. The script will:
- create a public repo called **`portfolio`** on your account,
- push all the files,
- turn on GitHub Pages, and
- print your live URL and open the Pages settings.

Your site will be live in about a minute at:

```
https://<your-username>.github.io/portfolio/
```

(For you that's most likely **https://coderpandu.github.io/portfolio/**.)

---

## Manual way (if you prefer doing it by hand)

```powershell
# 1. Log in once
gh auth login            # GitHub.com -> HTTPS -> Login with a web browser

# 2. From inside the Portfolio folder, create the repo and push
cd "$HOME\Desktop\Portfolio"
gh repo create portfolio --public --source=. --remote=origin --push

# 3. Enable GitHub Pages (main branch, root)
'{"source":{"branch":"main","path":"/"}}' | gh api repos/:owner/portfolio/pages --method POST --input -
```

Then go to **GitHub → your repo → Settings → Pages** to see the live link.

---

## No GitHub CLI? Use the website instead

1. Go to <https://github.com/new>, create a public repo named **`portfolio`**.
2. Follow GitHub's "push an existing repository" commands, e.g.:
   ```powershell
   cd "$HOME\Desktop\Portfolio"
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch → Branch: `main` / `/ (root)` → Save.**

---

## Custom domain: sumitphuyal.com.np

`.com.np` domains are free in Nepal but must be **registered/renewed** and have
their **DNS pointed at GitHub** before you attach them. Do this *after* the site
is live on the github.io URL above.

### Step 1 — Make sure you own the domain (active)
Register or renew **sumitphuyal.com.np** at <https://register.com.np>
(Mercantile Communications). Wait until it's approved and active.

### Step 2 — Point DNS at GitHub
In your register.com.np DNS panel, add these records:

| Type  | Host / Name | Value                      |
|-------|-------------|----------------------------|
| A     | @           | 185.199.108.153            |
| A     | @           | 185.199.109.153            |
| A     | @           | 185.199.110.153            |
| A     | @           | 185.199.111.153            |
| CNAME | www         | <your-username>.github.io  |

### Step 3 — Tell GitHub to use the domain
A ready-to-use file named **`CNAME.ready`** is already in this folder. Activate it:

```powershell
cd "$HOME\Desktop\Portfolio"
Rename-Item CNAME.ready CNAME
git add CNAME
git commit -m "Enable custom domain sumitphuyal.com.np"
git push
```

Then in **Settings → Pages → Custom domain**, enter `sumitphuyal.com.np`,
save, and tick **Enforce HTTPS** once the certificate is issued (can take a few
minutes to an hour).

DNS changes can take anywhere from minutes to 24 hours to fully propagate.
