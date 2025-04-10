const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    
    const name = $('h1').first().text().trim();
    const price = $('[data-testid="product-price"]').text().trim() || $('[class*=price]').first().text().trim();
    const image = $('meta[property="og:image"]').attr('content');
    
    const sizes = [];
    $('[data-testid="variant-select"] option').each((i, el) => {
      const text = $(el).text().trim();
      if (text && !sizes.includes(text)) sizes.push(text);
    });

    res.json({ name, price, image, sizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
