# 📧 EmailJS Auto-Send Configuration

## How It Works
When a player loses all lives (Game Over), the game **AUTOMATICALLY** sends their score to YOU (the admin) via email. No button click required!

## Setup Steps

### 1. Go to EmailJS Dashboard
https://dashboard.emailjs.com/admin

### 2. Configure Your Template (`template_8cvc3s8`)

#### **Settings Tab - CRITICAL:**
- **To Email:** `youremail@gmail.com` ← **PUT YOUR EMAIL HERE**
- **From Name:** Kitty Sync V2
- **Subject:** New Score from {{player_name}}

#### **Content Tab:**
Use the HTML template from `EMAIL_SETUP.md`

Or use this simple version:
```
Player: {{player_name}}
Score: {{score}}
Left Cat: {{cat_left}}
Right Cat: {{cat_right}}
```

### 3. Test It!
1. Play the game at http://localhost:5173
2. Enter your name and cat names
3. Lose all 3 lives
4. Check your email inbox!

### 4. Troubleshooting

**If you don't receive emails:**
1. Check spam/junk folder
2. Verify "To Email" is set in EmailJS template settings
3. Open browser console (F12) and look for errors
4. Make sure the template variables match:
   - `{{player_name}}`
   - `{{score}}`
   - `{{cat_left}}`
   - `{{cat_right}}`
   - `{{message}}`

## What Gets Sent
- Player name
- Final score
- Left cat name and skin
- Right cat name and skin

## No Player Email Required!
Players don't need to enter their email - scores go directly to you!
