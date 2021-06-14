return {
    node_name: '',
    manifest: {
        timers: ['alive_timer'],
    },
    persist: {},
    config: {},
    unit: 'c',
    temp: 0,
    cond_id: 0,
    info_is_current: false,
    info_expiry_time: 0,
    handler: function(event, response) {
        if ((event.type == 'watch_face_update') || (event.type == 'display_data_updated')) {
            this.draw(response);
            if (event.reason == 'change_complications') {
                this.info_is_current = false;
                stop_timer(this.node_name, 'alive_timer');
            }
            if (this.info_is_current == false) {
                this.refresh_weather_info();
            }
        } else if ((event.type == 'common_update') && (event.weatherInfo)) {
            this.temp = get_common().weatherInfo.temp;
            this.cond_id = get_common().weatherInfo.cond_id;
            this.unit = get_common().weatherInfo.unit;
            this.info_expiry_time = get_common().weatherInfo.alive;
            this.info_is_current = true;
            this.draw(response);
            var reg0 = [0, 0, 0, 0];
            reg0[0] = event.id;
            reg0[1] = 0;
            ux_write_log(this.node_name, 5, reg0);
            stop_req_timeout(this.node_name, event.id);
            start_timer(this.node_name, 'alive_timer', this.get_remaining_msecs());
        } else if ((event.type == 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'alive_timer'))) {
            this.info_is_current = false;
            this.refresh_weather_info();
        } else if ((event.type === 'common_update') && (event.app_status === true) && (get_common().app_status === 'connected') && (this.info_is_current == false)) {
            this.refresh_weather_info();
        } else if ((event.type === 'common_update') && (event.unit_setting_updated)) {
            this.draw(response);
        }
    },
    get_remaining_msecs: function() {
        var remaining_secs = this.info_expiry_time - get_unix_time();
        if (remaining_secs < 10) {
            remaining_secs = 10;
        }
        return remaining_secs * 1000;
    },
    convert_temp_unit: function() {
        var received_temp_unit = get_common().unit_setting.temp;
        if (this.unit !== received_temp_unit) {
            this.temp = unit_convert_temp(this.temp, this.unit, received_temp_unit);
            if (!is_valid_number(this.temp)) {
                this.temp = undefined;
            }
            this.unit = received_temp_unit;
        }
    },
    draw: function(response) {
        var conditions = ['ClearDay', 'ClearNite', 'Cloudy', 'PartCloudyDay', 'PartCloudyNite', 'Rainy', 'Snowy', 'Snowy', 'Stormy', 'Cloudy', 'Windy'];
        if ((typeof(this.cond_id) !== 'number') || (this.cond_id < 0) || (this.cond_id >= conditions.length)) {
            this.cond_id = 0;
        }
        this.convert_temp_unit();
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            icon: 'icWth' + conditions[this.cond_id],
            ci: this.info_is_current ? Math.round(this.temp) + '°' : '– –',
        };
    },
    refresh_weather_info: function() {
        var request = '"weatherInfo":{}';
        req_data(this.node_name, request, 5000, true);
    },
};
