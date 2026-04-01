const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Booking Service Running'));
app.get('/booking', (req, res) => res.json({ status: 'Booking endpoint success' }));

app.listen(port, () => console.log(`Booking service listening on port ${port}`));
