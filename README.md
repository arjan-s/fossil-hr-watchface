# fossil-hr-watchface

## Introduction
The Fossil Hybrid HR watches have dynamic watchfaces since firmware version DN1.0.2.20r.v1 (app 4.6.0). These watchfaces are built in [JerryScript 2.1.0](https://jerryscript.net/) and packed together with assets and configuration into one file. [Gadgetbridge](http://gadgetbridge.org/) does not have support for these dynamic watchfaces, which means it's not possible to set/modify watchfaces and complications on modern firmwares.

Gadgetbridge does have the ability to upload the watchface/watchapp files to the watch, but due to licensing of Fossil's code, they cannot be redistributed. Hence the need for this open source watchface. A future version of Gadgetbridge can support dynamic watchfaces as long as they are built from fully open source code.

**Note:** self-built watchfaces are only supported by Gadgetbridge, not by the official Fossil app.

## Credits
- Daniel Dakhno, for his [app SDK](https://github.com/dakhnod/Fossil-HR-SDK), which has provided tools and information necessary to analyze and build watchfaces.
- [Material Design Icons](https://materialdesignicons.com/) for providing an awesome repository of free icons.

## Building the watchface
First make sure you have the binaries `jerryscript` and `jerryscript-snapshot` available, version 2.1.0 (other versions will **not** work). Also, clone the [app SDK](https://github.com/dakhnod/Fossil-HR-SDK), because some of the provided tools are needed.

Pre-process your watchface with a tool like Gimp to 240x240 pixels and 2 bit (4 colors) grayscale. Then use the following command to convert your image to the RAW format used by watchfaces.

    python ../Fossil-HR-SDK/tools/image_compress.py -i watchface.png -o build/files/icons/background.raw -w 240 -h 240 -f raw

The same tool can be used to convert icons to the watch's format. Make sure you start with a **white** icon with transparent background. Then use the following command to convert your icon to the RLE format used by watchfaces.

    python ../Fossil-HR-SDK/tools/image_compress.py -i icon.png -o build/files/icons/icon.rle -w 24 -h 24 -f rle

Then, run the following commands in the checked out repository:

    mkdir -p build/files/code/
    jerry-snapshot generate -f '' open_source_watchface.js -o build/files/code/openSourceWatchface
    jerry-snapshot generate -f '' widget_date.js -o build/files/code/widgetDate
    jerry-snapshot generate -f '' widget_weather.js -o build/files/code/widgetWeather
    jerry-snapshot generate -f '' widget_steps.js -o build/files/code/widgetSteps
    jerry-snapshot generate -f '' widget_hr.js -o build/files/code/widgetHR
    jerry-snapshot generate -f '' widget_battery.js -o build/files/code/widgetBattery
    jerry-snapshot generate -f '' widget_calories.js -o build/files/code/widgetCalories
    jerry-snapshot generate -f '' widget_2nd_tz.js -o build/files/code/widget2ndTZ
    jerry-snapshot generate -f '' widget_activemins.js -o build/files/code/widgetActiveMins
    jerry-snapshot generate -f '' widget_chanceofrain.js -o build/files/code/widgetChanceOfRain
    python ../Fossil-HR-SDK/tools/pack.py -i build -o open_source_watchface.wapp

## Installing the watchface
**Option 1:**

1. Open Gadgetbridge
2. Tap on the "app manager" icon in the connected Fossil HR device card
3. Tap on the round "+" button at the bottom right
4. Select the .wapp file
5. Enjoy the watchface on your watch!

**Option 2:**

1. Share the .wapp file from another app with Gadgetbridge's "Firmware/Apps installer"
2. Click "Install"
3. Enjoy the watchface on your watch!

## Current state and things left to do
- [x] Background image shows correctly
- [x] Hands display correct time
- [x] Display refresh works after leaving menu or notification
- [X] Notification indicator should disappear when dismissed on phone
- [X] Physical buttons functionality
- [X] Layout JSON support
- [X] Partial display update
- [X] Wrist flick functionality
- [X] Configurability of regular and custom functionality through config JSON
- [X] Suspend hands and display updating when off wrist to conserve battery power
- [X] Complications/widgets
    - [X] Date / day of week
    - [X] Weather
    - [X] Heart rate
    - [X] Steps count
    - [X] Battery
    - [X] Calories
    - [X] Active minutes
    - [X] 2nd timezone
    - [X] Chance of rain
    - [ ] Custom widget (with text from Gadgetbridge)
- [ ] Goal rings
- [ ] Custom images
- [ ] Custom text

## Ideas for future exploration
- [ ] Timed backgrounds
- [ ] Navigation instructions on watchface (from OsmAnd?)
- [ ] Multiple configs (thus, watchfaces) switchable with physical button

## Bonus
Use `reversed_watchface.js` with background image `reversed_watchface.raw` for a fully reversed analog clock! Even the hands are running in reverse! No worries: notifications and menus are still displayed correctly.
