# Security & Secrets

If a secret is accidentally committed to the repository (e.g., `.env`), follow these steps immediately:

1. **Rotate keys**: Update credentials in MongoDB Atlas, Render, Google AI Studio (Gemini) and any other services.
2. **Revoke old keys**: Revoke or delete the compromised keys where possible.
3. **Remove secrets from git history**: Use `git rm --cached .env` and use tools like `git filter-repo` to scrub history; update team members.
4. **Add `.env` to `.gitignore`**: Ensure `.env` is ignored and commit `.env.example` only.
5. **Use secret managers**: Use Render/Render dashboard env vars, GitHub Secrets, or local `.env` not committed.

Actions taken locally:
- Generated a new **JWT_SECRET** and stored it in the local `.env` (not committed). Do **not** share this value publicly.
- Generated a new **NEW_MONGO_PASSWORD** and stored it in local `.env` as a convenience until you rotate the Atlas database user's password.

Next steps to rotate live secrets:
- MongoDB Atlas: Use `scripts/rotate_atlas_password.ps1` with `ATLAS_PUBLIC_KEY` and `ATLAS_PRIVATE_KEY`, pass your `GroupId` (Project ID) and DB username to update the user password, then update `MONGODB_URI` in Render with the new password.
- Render: Use `scripts/update_render_env.ps1` or update via Render dashboard; set `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY` securely.
- Gemini/Google key: Revoke the old key in Google Cloud Console and create a new API key; update it in Render.

If you want me to call provider APIs to rotate secrets, provide the necessary API keys/permissions and confirm. I can then run the rotate scripts for you.
