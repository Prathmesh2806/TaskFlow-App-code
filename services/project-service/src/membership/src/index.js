const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Membership Service Running'));
app.get('/membership', (req, res) => res.json({ status: 'Membership endpoint success' }));

app.listen(port, () => console.log(`Membership service listening on port ${port}`));
