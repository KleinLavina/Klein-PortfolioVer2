# Portfolio Setup Guide

## GitHub Contributions Setup

To display real GitHub contribution data, you need to set up a GitHub Personal Access Token.

### Steps:

1. **Create a GitHub Personal Access Token**
   - Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Portfolio GitHub Stats")
   - Select the following scope:
     - ✅ `read:user` (Read user profile data)
   - Click "Generate token"
   - **Copy the token immediately** (you won't be able to see it again!)

2. **Add the token to your .env file**
   - Open the `.env` file in the root directory
   - Replace the empty value with your token:
     ```
     GITHUB_TOKEN=ghp_your_actual_token_here
     ```

3. **Restart the development server**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

4. **Verify it works**
   - Open your portfolio in the browser
   - Navigate to "The Days I Code" section
   - You should see your real GitHub contribution calendar and stats

### Troubleshooting

- **"GitHub token not configured" error**: Make sure you added the token to `.env` and restarted the server
- **"Failed to fetch contributions" error**: Check that your token has the correct permissions
- **Token expired**: Generate a new token and update the `.env` file

### Security Notes

- ✅ The `.env` file is in `.gitignore` - your token won't be committed
- ✅ The token is only used on the backend - never exposed to the frontend
- ✅ The token only has read permissions - it can't modify your GitHub account
