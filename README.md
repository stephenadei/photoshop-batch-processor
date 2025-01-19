# Photoshop Batch Image Processor

A professional-grade Adobe Photoshop script for batch processing images with Apple-inspired UI/UX design principles.

## Features

- 🖼️ Automatic template handling
- 🎨 Random text color generation
- 📁 Organized output with timestamps
- 📊 Progress tracking
- 🎯 Apple-style UI/UX
- 🚀 Command-line execution support

## Prerequisites

- Adobe Photoshop 2024 or later
- macOS 12.4.0 or later
- Template PSD file with:
  - Layer named "FOTO" for image placement
  - Text layer named "TEXT" for color changes

## Installation

1. Clone this repository:
```bash
git clone https://github.com/stephenadei/photoshop-batch-processor.git
```

2. Ensure all files are in the same directory:
   - `Finished.jsx` (main script)
   - `SAA2-new.psd` (template file)
   - `run_photoshop.sh` (shell script)

3. Make the shell script executable:
```bash
chmod +x run_photoshop.sh
```

## Usage

### Method 1: Terminal
```bash
./run_photoshop.sh
```

### Method 2: Photoshop
1. Open Photoshop
2. Go to File > Scripts > Browse
3. Select Finished.jsx

### After Launch
1. Select source folder with images when prompted
2. Images will be processed automatically
3. Find processed images in Desktop/test_output/output_[timestamp]

## Configuration

Edit the CONFIG object in `Finished.jsx` to customize:
- Image dimensions
- Output quality
- Layer names
- UI colors and messages

```javascript
var CONFIG = {
    dimensions: {
        width: 880,
        height: 880
    },
    outputQuality: 12,
    // ... other settings
};
```

## File Structure

```
.
├── Finished.jsx         # Main Photoshop script
├── SAA2-new.psd        # Template file
├── run_photoshop.sh    # Shell script for CLI execution
└── README.md           # Documentation
```

## Output Structure

```
Desktop/
└── test_output/
    └── output_YYYYMMDD_HHMMSS/
        ├── image1_insta.jpg
        ├── image2_insta.jpg
        └── ...
```

## Error Handling

- Validates template existence
- Checks source folder accessibility
- Provides clear error messages
- Continues processing on individual image failures

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Acknowledgments

- Adobe Photoshop ExtendScript
- Apple Design Guidelines
