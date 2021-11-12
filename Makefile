identifier := openSourceWatchface

source_file := app.js
snapshot_file := build/files/code/${identifier}
tools_dir := $(if $(WATCH_SDK_PATH),$(WATCH_SDK_PATH),../../)
package_file := ${identifier}.wapp
package_path := ${package_file}

adb_target := 192.168.0.192:5555
adb_target_dir := /sdcard/q/${package_file}

.PHONY: all build compile pack push connect install clean

all: build push install
build: compile pack

compile:
	mkdir -p build/files/code build/files/config
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
	jerry-snapshot generate -f '' widget_custom.js -o build/files/code/widgetCustom

pack:
	python3 ${tools_dir}tools/pack.py -i build/ -o ${package_path}

push:
	adb push ${package_path} ${adb_target_dir}

connect:
	adb connect ${adb_target}

install:
	adb shell am broadcast \
    -a "nodomain.freeyourgadget.gadgetbridge.Q_UPLOAD_FILE" \
    --es EXTRA_HANDLE APP_CODE \
    --es EXTRA_PATH "${adb_target_dir}" \
	--ez EXTRA_GENERATE_FILE_HEADER false

clean:
	rm -f build/files/code/*
	rm -f *.wapp
