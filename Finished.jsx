/**
 * Photoshop Batch Image Processor
 * Follows Apple Design Guidelines for professional UI/UX
 * 
 * @version 2.0
 * @requires Adobe Photoshop 2024 or later
 * @platform macOS
 */

//----------------------
// Configuration
//----------------------
var CONFIG = {
    dimensions: {
        width: 880,
        height: 880
    },
    outputQuality: 12,
    layerNames: {
        photo: "FOTO",
        text: "TEXT"
    },
    supportedFormats: /\.(jpg|jpeg|png|tif|tiff|gif)$/i,
    templateName: "SAA2-new.psd",
    ui: {
        colors: {
            success: [0, 122, 255],   // Apple Blue
            warning: [255, 149, 0],   // Apple Orange
            error: [255, 59, 48],     // Apple Red
            info: [88, 86, 214]       // Apple Purple
        },
        messages: {
            welcome: "Welcome to Batch Image Processor\nThis tool will help you process multiple images using a template.",
            selectFolder: "Please select a folder containing your images",
            processing: "Processing images... This may take a moment",
            complete: "Processing complete! Your images are ready.",
            error: "Something went wrong. Please try again."
        }
    }
};

//----------------------
// UI Manager
//----------------------
var UIManager = {
    // Helper function to repeat a string
    repeat: function(str, count) {
        var result = '';
        for (var i = 0; i < count; i++) {
            result += str;
        }
        return result;
    },

    showProgressBar: function(current, total) {
        var progress = Math.round((current / total) * 100);
        var width = 50; // Progress bar width in characters
        var filled = Math.round((width * progress) / 100);
        var empty = width - filled;
        
        var bar = "[" + this.repeat("=", filled) + this.repeat(" ", empty) + "]";
        $.writeln(bar + " " + progress + "% (" + current + "/" + total + ")");
    },

    showAlert: function(message, type) {
        var color = CONFIG.ui.colors[type || "info"];
        alert(message);
    },

    showWelcome: function() {
        this.showAlert(CONFIG.ui.messages.welcome, "info");
    },

    showSuccess: function(message) {
        this.showAlert(message || CONFIG.ui.messages.complete, "success");
    },

    showError: function(message) {
        this.showAlert(message || CONFIG.ui.messages.error, "error");
    }
};

//----------------------
// Path Management
//----------------------
var PathManager = {
    sourceFolderPath: "",
    outputFolderPath: "",
    scriptFolder: (function() {
        return File($.fileName).parent.fsName;
    })(),

    getTemplatePath: function() {
        return this.scriptFolder + "/" + CONFIG.templateName;
    },

    getUserSourceFolder: function() {
        try {
            app.bringToFront();
            UIManager.showAlert(CONFIG.ui.messages.selectFolder, "info");
            
            var sourceFolder = Folder.selectDialog("Select folder containing images to process");
            
            if (sourceFolder) {
                if (sourceFolder.exists) {
                    this.sourceFolderPath = sourceFolder.fsName;
                    debugLog("Selected source folder: " + sourceFolder.fsName);
                    return sourceFolder;
                } else {
                    UIManager.showError("Selected folder does not exist or is not accessible");
                    return null;
                }
            } else {
                debugLog("No folder selected - user cancelled");
                return null;
            }
        } catch (e) {
            UIManager.showError("Error selecting folder: " + e.message);
            return null;
        }
    },

    getTimestampedOutputFolderPath: function(basePath) {
        var date = new Date();
        var timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) + "_" +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);
        return basePath + "/output_" + timestamp;
    }
};

//----------------------
// Document Management
//----------------------
var DocumentManager = {
    openTemplate: function() {
        try {
            var templateFile = new File(PathManager.getTemplatePath());
            if (!templateFile.exists) {
                UIManager.showError("Template file not found at: " + templateFile.fsName);
                return null;
            }
            
            debugLog("Opening template: " + templateFile.fsName);
            return app.open(templateFile);
        } catch (e) {
            UIManager.showError("Error opening template: " + e.message);
            return null;
        }
    }
};

//----------------------
// Image Processing
//----------------------
var ImageProcessor = {
    replaceAndResizeImage: function(doc, newImagePath, targetWidth, targetHeight) {
        try {
            debugLog("Starting image replacement for: " + newImagePath);
            var templateDoc = doc;
            
            var existingLayer = doc.artLayers.getByName(CONFIG.layerNames.photo);
            if (existingLayer) {
                debugLog("Removing existing FOTO layer");
                existingLayer.remove();
            }

            var newFile = new File(newImagePath);
            var newDoc = app.open(newFile);
            if (!newDoc) {
                alert("Error: New image document not opened.");
                return;
            }

            var scaleRatio = Math.min(targetWidth / newDoc.width, targetHeight / newDoc.height);
            newDoc.resizeImage(newDoc.width * scaleRatio, newDoc.height * scaleRatio);

            newDoc.selection.selectAll();
            newDoc.selection.copy();
            newDoc.close(SaveOptions.DONOTSAVECHANGES);

            app.activeDocument = templateDoc;
            var pastedLayer = templateDoc.paste();
            pastedLayer.name = CONFIG.layerNames.photo;

            this.centerLayer(pastedLayer, templateDoc);
            debugLog("Image replacement completed successfully");
        } catch (e) {
            debugLog("Error in replaceAndResizeImage: " + e.message);
            throw e;
        } finally {
            app.activeDocument = templateDoc;
        }
    },

    centerLayer: function(layer, doc) {
        var bounds = layer.bounds;
        var width = bounds[2] - bounds[0];
        var height = bounds[3] - bounds[1];
        var xOffset = (doc.width - width) / 2 - bounds[0];
        var yOffset = (doc.height - height) / 2 - bounds[1];
        layer.translate(xOffset, yOffset);
    },

    getRandomColor: function() {
        return {
            red: Math.floor(Math.random() * 256),
            green: Math.floor(Math.random() * 256),
            blue: Math.floor(Math.random() * 256)
        };
    },

    changeTextColor: function(doc, layerName, color) {
        try {
            var textLayer = doc.artLayers.getByName(layerName);
            if (textLayer.kind !== LayerKind.TEXT) {
                throw new Error("Layer '" + layerName + "' is not a text layer.");
            }

            var textColor = new SolidColor();
            textColor.rgb.red = color.red;
            textColor.rgb.green = color.green;
            textColor.rgb.blue = color.blue;

            textLayer.textItem.color = textColor;
            debugLog("Text color changed to RGB(" + color.red + "," + color.green + "," + color.blue + ")");
        } catch (e) {
            alert("Error changing text color: " + e.message);
        }
    },

    saveForInstagram: function(doc, outputFolder, fileName) {
        var outputFile = new File(outputFolder.fsName + "/" + fileName);
        var saveOptions = new JPEGSaveOptions();
        saveOptions.quality = CONFIG.outputQuality;
        doc.saveAs(outputFile, saveOptions, true, Extension.LOWERCASE);
        debugLog("Saved: " + fileName);
    }
};

//----------------------
// Main Process
//----------------------
function main() {
    UIManager.showWelcome();
    debugLog("Script started. Preparing to process images.");

    // Open template first
    var templateDoc = DocumentManager.openTemplate();
    if (!templateDoc) {
        UIManager.showError("Could not open template document. Script will exit.");
        return;
    }

    // Get source folder
    var sourceFolder = PathManager.getUserSourceFolder();
    if (!sourceFolder) {
        templateDoc.close(SaveOptions.DONOTSAVECHANGES);
        UIManager.showError("No source folder selected. Script will exit.");
        return;
    }
    
    PathManager.sourceFolderPath = sourceFolder.fsName;
    PathManager.outputFolderPath = PathManager.getTimestampedOutputFolderPath("/Users/stephenadei/Desktop/test_output");
    
    var outputFolder = new Folder(PathManager.outputFolderPath);

    if (!outputFolder.exists) {
        outputFolder.create();
    }

    var fileList = sourceFolder.getFiles(CONFIG.supportedFormats);
    debugLog(fileList.length + " image(s) found to process.");

    try {
        UIManager.showAlert(CONFIG.ui.messages.processing, "info");
        
        for (var i = 0; i < fileList.length; i++) {
            try {
                UIManager.showProgressBar(i + 1, fileList.length);
                debugLog("Processing image " + (i + 1) + " of " + fileList.length + ": " + fileList[i].name);
                
                ImageProcessor.replaceAndResizeImage(
                    templateDoc, 
                    fileList[i].fsName, 
                    CONFIG.dimensions.width, 
                    CONFIG.dimensions.height
                );
                
                var randomColor = ImageProcessor.getRandomColor();
                ImageProcessor.changeTextColor(templateDoc, CONFIG.layerNames.text, randomColor);

                var outputFileName = fileList[i].name.replace(/\.[^\.]+$/, '') + "_insta.jpg";
                ImageProcessor.saveForInstagram(templateDoc, outputFolder, outputFileName);

                templateDoc.selection.deselect();
                app.refresh();
                
            } catch (e) {
                UIManager.showError("Error processing image " + fileList[i].name + ": " + e.message);
                continue;
            }
        }

        UIManager.showSuccess();
        debugLog("Script completed. All " + fileList.length + " images processed.");
        
    } catch (e) {
        UIManager.showError("Error in main process: " + e.message);
    } finally {
        // Always close the template document
        templateDoc.close(SaveOptions.DONOTSAVECHANGES);
        debugLog("Template document closed");
    }
}

//----------------------
// Utilities
//----------------------
function debugLog(message) {
    $.writeln(message);
}

//----------------------
// Script Execution
//----------------------
app.bringToFront();
main();