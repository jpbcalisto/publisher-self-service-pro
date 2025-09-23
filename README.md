# Publisher SSP Pro Bundle

A modern, responsive web application for publisher onboarding and revenue estimation in the SSP (Supply-Side Platform) ecosystem.

## Features

### 🚀 Multi-Step Onboarding
- **Step 1**: Publisher contact details
- **Step 2**: Website inventory and targeting configuration
- **Step 3**: Ad format selection with live previews
- **Step 4**: Revenue estimation and proposal generation

### 📊 Real-Time Calculations
- Dynamic CPM calculations based on category, GEO, and ad formats
- Automatic revenue estimation (monthly/yearly)
- Traffic distribution by device type (Desktop/Mobile)
- GEO targeting with percentage-based traffic shares

### 🎯 Advanced Targeting
- Category-based targeting (News, Music, Sports, Finance)
- Multi-GEO support (Brazil, South Africa, Thailand, Romania, Nigeria, Global)
- Desktop vs Mobile traffic distribution
- Frequency capping considerations

### 🔧 User Experience
- Form validation preventing navigation without required data
- Interactive ad format selection with hover previews
- Real-time feedback and error messages
- Responsive design with dark/light theme toggle
- Clean, modern UI with glass morphism effects

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Custom CSS with CSS Grid/Flexbox
- **Data**: JSON-based CPM pricing tables
- **Server**: Python HTTP server for local development

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd publisherssp_pro_bundle
   ```

2. **Start the development server**
   ```bash
   python3 test-server.py
   ```

3. **Open your browser**
   - The application will automatically open at `http://localhost:8080`
   - Or manually navigate to `http://localhost:8080/publisherssp_pro.html`

## File Structure

```
publisherssp_pro_bundle/
├── publisherssp_pro.html          # Main HTML file
├── publisherssp_pro.css           # Stylesheet
├── publisherssp_pro (3).js        # Main JavaScript application
├── publisherssp_data.json         # CPM pricing data
├── test-server.py                 # Local development server
└── README.md                      # This file
```

## Configuration

### CPM Data
Edit `publisherssp_data.json` to customize:
- Available categories
- Supported countries/GEOs
- Ad formats and demo URLs
- CPM pricing by category, GEO, and format

### Styling
Modify `publisherssp_pro.css` to customize:
- Color schemes and themes
- Layout and spacing
- Component styling
- Responsive breakpoints

## Key Features Explained

### Revenue Calculation
- **Formula**: `(Users × 1.5 visits/day × 30 days × CPM) ÷ 1000`
- **Device Split**: Separate calculations for desktop/mobile traffic
- **CPM Lookup**: Dynamic pricing based on category, GEO, and format

### Validation System
- **Step 1→2**: Name and email required
- **Step 2→3**: Complete website data (category, GEO, users, 100% traffic distribution)
- **Step 3→4**: At least one ad format selected

### Preview System
- Hover over "(demo)" links to see iframe previews
- 300×200px preview windows
- Click outside or use × button to close

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

The application uses modern JavaScript features:
- ES6 modules and arrow functions
- Async/await for data loading
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming

## License

This project is proprietary software developed for CleverAdvertising.

## Support

For technical support or feature requests, please contact the development team.