
import emailjs from 'emailjs-com';

// ⚠️ REPLACE WITH YOUR REAL EMAILJS KEYS
// Get them FREE at https://www.emailjs.com/
// 1. Create Account -> Add Service (Gmail) -> Get SERVICE_ID
// 2. Add Template ("New Score: {{player_name}} - {{score}}") -> Get TEMPLATE_ID
// 3. Account -> API Keys -> Get USER_ID (Public Key)

const SERVICE_ID = 'service_cc3xo6v'; // ✅ DONE
const TEMPLATE_ID = 'template_8cvc3s8'; // ✅ DONE
const PUBLIC_KEY = 'YXL_RcSJGO2e-ay6r'; // ✅ DONE

export const sendScoreEmail = async (playerName, catNames, catSkins, score) => {
    console.log("Sending email...", { playerName, score });

    const templateParams = {
        to_name: "Admin",
        player_name: playerName,
        score: score,
        cat_left: `${catNames.ginger} (${catSkins.ginger})`,
        cat_right: `${catNames.cream} (${catSkins.cream})`,
        message: `Player: ${playerName} | Score: ${score} | Cats: ${catNames.ginger} (${catSkins.ginger}) & ${catNames.cream} (${catSkins.cream})`
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('SUCCESS!', response.status, response.text);
        return { success: true };
    } catch (err) {
        console.error('FAILED...', err);
        return { success: false, error: err };
    }
};
