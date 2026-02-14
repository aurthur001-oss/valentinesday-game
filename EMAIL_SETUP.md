# 📧 EmailJS HTML Template (Final)

Depending on your email style, you can use this clean version.

**Paste this into the "Source Code" (< >) of your EmailJS Template:**

```html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fce4ec; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  .header { background-color: #ff8ba7; padding: 30px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
  .content { padding: 30px; text-align: center; color: #555; }
  .score-box { background: #fff3e0; border: 2px dashed #ffb74d; padding: 20px; border-radius: 10px; margin: 20px 0; }
  .score-val { font-size: 36px; font-weight: bold; color: #e65100; margin: 10px 0; }
  .details { text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
  .footer { background-color: #fec3cd; padding: 15px; text-align: center; font-size: 12px; color: #880e4f; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Kitty Sync Score ❤️</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px;">A new high score has been submitted!</p>
      
      <div class="score-box">
        <div>PLAYER</div>
        <div style="font-size: 22px; font-weight: bold; color: #333;">{{player_name}}</div>
        <div style="margin-top: 15px;">SCORE</div>
        <div class="score-val">{{score}}</div>
      </div>

      <div class="details">
        <p><strong>🐱 Left Cat:</strong> {{left_cat_info}}</p>
        <p><strong>🐱 Right Cat:</strong> {{right_cat_info}}</p>
      </div>
    </div>
    <div class="footer">
      Sent from your Vercel Game
    </div>
  </div>
</body>
</html>
```
