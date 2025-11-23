# Smart-Win Official Website

Premium fixed match intelligence platform with AI-powered predictions and verified results.

## 🚀 Live Website

Visit: [Smart-Win Official](https://smartwinofficial.co.uk)

## 📁 Project Structure

```
smart-win-ui/
├── index.html              # Main landing page (root level for deployment)
├── about.html             # About page
├── how-it-works.html      # Process explanation
├── pricing.html           # Pricing & payment methods
├── faq.html              # Frequently asked questions
├── terms.html            # Terms & conditions
├── privacy.html          # Privacy policy
├── refund.html           # Refund policy
├── blog.html             # Blog listing
├── contact.html          # Contact page
├── single.html           # Blog post template
├── public/               # Images and assets
│   ├── Smart_win_logo-transparent.png
│   ├── Ticket 1-4.jpeg (winning proofs)
│   └── 22 November prediction ticket 1-2.jpeg
└── theme/soccer/         # Theme assets
    ├── css/             # Stylesheets
    ├── js/              # JavaScript files
    ├── fonts/           # Icon fonts
    └── images/          # Theme images
```

## 🌟 Features

- **Negotiation-Based Pricing Model**: $100 consultation fee opens direct negotiations
- **Free Prediction Samples**: Available to all users on homepage
- **Custom Match Pricing**: Based on league tier, complexity, risk level, and timing
- **92% Success Rate**: Documented with $2.3M+ verified payouts
- **270+ Active Members**: Growing community of serious bettors
- **Responsive Design**: Works on all devices
- **11 Complete Pages**: Full website with legal pages and FAQ

## 💻 Local Development

1. Clone the repository:
```bash
git clone https://github.com/SyncSphere7/smart-win-ui.git
cd smart-win-ui
```

2. Open with a local server:
```bash
python3 -m http.server 8000
```

3. Visit: `http://localhost:8000`

## 🚀 Deployment

### GitHub Pages
1. Go to repository Settings > Pages
2. Select branch: `main`
3. Select folder: `/ (root)`
4. Save and wait for deployment

### Netlify
1. Connect your GitHub repository
2. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/`
3. Deploy

### Vercel
1. Import your GitHub repository
2. Framework Preset: Other
3. Root Directory: `./`
4. Deploy

## 📝 Content Updates

### Update Prediction Tickets
Replace images in `/public/`:
- `22 November prediction ticket 1.jpeg`
- `22 November prediction ticket 2.jpeg`

### Update Winning Proofs
Replace images in `/public/`:
- `Ticket 1.jpeg` through `Ticket 4.jpeg`

### Update Stats
Edit in `index.html` (lines 107-115):
```html
<h2 class="counter mb-0" data-target="270">0</h2>  <!-- Active Members -->
<h2 class="mb-0">$<span class="counter" data-target="2301007">0</span></h2>  <!-- Total Payouts -->
<h2 class="mb-0"><span class="counter" data-target="92">0</span>%</h2>  <!-- Success Rate -->
```

## 🎨 Theme Customization

### Colors
Primary color: `#ee1e46` (red/pink)
Secondary color: `#222831` (dark gray)

Update in `theme/soccer/css/style.css`

### Logo
Replace: `public/Smart_win_logo-transparent.png`
Recommended size: 200x200px transparent PNG

## 📧 Contact Information

- **Email**: info@smartwinofficial.co.uk
- **Website**: https://smartwinofficial.co.uk
- **Managed by**: [SyncSphere LLC](https://www.syncsphereofficial.com)

## 🔒 Payment Methods

- Cryptocurrency (BTC, ETH, USDT)
- Mobile Money (M-Pesa, Airtel via Pesapal)
- Credit/Debit Cards (Visa, Mastercard via Pesapal)

## 📄 License

Copyright © 2025 Smart-Win Official. All rights reserved.

## 🛠 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework**: Bootstrap 4
- **Libraries**: jQuery, Owl Carousel, AOS
- **Icons**: Flaticon, Icomoon
- **Analytics**: Google Analytics

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues

None currently. Report issues via contact page.

## 🔄 Version History

### v1.0.0 (November 23, 2025)
- Initial release
- 11 complete pages
- Negotiation-based pricing model
- Free prediction samples
- Custom match pricing
- Full footer with logo
- Legal pages (Terms, Privacy, Refund, FAQ)
- Mobile responsive design

---

**Built with ❤️ by SyncSphere LLC**
