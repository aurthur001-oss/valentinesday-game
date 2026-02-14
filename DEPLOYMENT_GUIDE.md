# 🚀 How to Deploy to Vercel

Since the code is now on GitHub at `https://github.com/aurthur001-oss/valentinesday-game`, deploying to Vercel is very easy!

## Step 1: Log in to Vercel
Go to [https://vercel.com/login](https://vercel.com/login) and log in.

## Step 2: Add New Project
1. Click **"Add New..."** -> **"Project"**
2. Under "Import Git Repository", find **`valentinesday-game`**
3. Click **Import**

## Step 3: Configure Project
Vercel should automatically detect that this is a **Vite** project.

- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `vite build`
- **Output Directory:** `dist`

Click **Deploy**!

## Step 4: Add EmailJS Environment Variables (Optional but Recommended)
To keep your keys safe, you can add them as Environment Variables in Vercel settings, but since they are public keys in the code, it works fine without this step for now.

## 🎉 Done!
Your game will be live in about 1 minute.
You'll get a URL like `https://valentinesday-game.vercel.app`.
