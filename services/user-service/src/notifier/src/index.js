const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Notifier Service Running'));
app.get('/notifier', (req, res) => res.json({ status: 'Notifier endpoint success' }));

app.listen(port, () => console.log(`Notifier service listening on port ${port}`));
