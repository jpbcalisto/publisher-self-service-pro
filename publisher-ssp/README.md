# Publisher SSP Pro Bundle - Laravel Edition

A modern, responsive web application for publisher onboarding and revenue estimation in the SSP (Supply-Side Platform) ecosystem, now powered by PHP Laravel.

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

- **Backend**: PHP Laravel 11 with Sail (Docker)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Custom CSS with CSS Grid/Flexbox
- **Data**: JSON-based CPM pricing tables
- **Server**: Laravel Sail (Docker-based development environment)
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Search**: Meilisearch

## Prerequisites

- Docker Desktop
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd publisher-ssp
   ```

2. **Start the development server**
   ```bash
   ./start-server.sh
   ```
   
   Or manually:
   ```bash
   bash vendor/bin/sail up -d
   ```

3. **Open your browser**
   - The application will be available at `http://localhost`
   - The main application loads at `http://localhost/publisherssp_pro.html`

4. **Stop the server**
   ```bash
   bash vendor/bin/sail down
   ```

## File Structure

```
publisher-ssp/
├── app/
│   └── Http/Controllers/
│       └── PublisherController.php    # API endpoints
├── public/
│   ├── assets/                        # Image assets
│   ├── publisherssp_pro.html         # Main HTML file
│   ├── publisherssp_pro.css          # Stylesheet
│   ├── publisherssp_pro.js           # Main JavaScript application
│   ├── publisherssp_data.json        # CPM pricing data
│   ├── cpm-editor.html               # CPM editor interface
│   └── format-manager.html           # Format management interface
├── routes/
│   └── web.php                       # Web routes
├── compose.yaml                      # Docker Sail configuration
├── start-server.sh                   # Quick start script
└── README.md                         # This file
```

## API Endpoints

The Laravel backend provides the following API endpoints:

- `GET /list-assets` - List available image assets
- `POST /save-formats` - Save ad format configurations
- `POST /save-cpm` - Save CPM pricing data
- `POST /delete-asset` - Delete image assets
- `POST /create-asset` - Create new image assets
- `POST /upload-image` - Upload new images

## Configuration

### CPM Data
Edit `public/publisherssp_data.json` to customize:
- Available categories
- Supported countries/GEOs
- Ad formats and demo URLs
- CPM pricing by category, GEO, and format

### Styling
Modify `public/publisherssp_pro.css` to customize:
- Color schemes and themes
- Layout and spacing
- Component styling
- Responsive breakpoints

### Laravel Configuration
- Environment variables in `.env`
- Database configuration
- Cache and session settings

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

## Development

### Laravel Sail Commands
```bash
# Start containers
bash vendor/bin/sail up -d

# Stop containers
bash vendor/bin/sail down

# View logs
bash vendor/bin/sail logs

# Access container shell
bash vendor/bin/sail shell

# Run Artisan commands
bash vendor/bin/sail artisan <command>
```

### Adding New Features
1. Create controllers in `app/Http/Controllers/`
2. Add routes in `routes/web.php`
3. Place frontend assets in `public/`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Docker Services

The application includes the following services:
- **Laravel App**: Main PHP application (port 80)
- **MySQL**: Database server (port 3306)
- **Redis**: Cache and session store (port 6379)
- **Meilisearch**: Search engine (port 7700)
- **Mailpit**: Email testing (port 8025)
- **Selenium**: Browser testing (internal)

## License

This project is proprietary software developed for CleverAdvertising.

## Support

For technical support or feature requests, please contact the development team.