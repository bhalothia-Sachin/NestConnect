const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const app = express();

const secret = '5e9a1b744550937a25190b5fbe4ccf5223ebde1a594c80f90d62662b8b92374a';

// Capture raw body for HMAC validation
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.rawBody);
  const digest = `sha256=${hmac.digest('hex')}`;

  console.log(`Signature from GitHub: ${signature}`);
  console.log(`Signature we computed: ${digest}`);

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/git-webhook', (req, res) => {
  if (!verifySignature(req)) {
    console.log('Invalid signature!');
    return res.status(401).send('Unauthorized');
  }

  console.log('Valid webhook received. Pulling latest code...');
  exec('git pull && pm2 restart NestConnect', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${stderr}`);
      return res.status(500).send('Update failed');
    }
    console.log(`Success: ${stdout}`);
    res.send('Update successful');
  });
});

app.listen(4740, () => console.log('Webhook server running on port 4747'));

