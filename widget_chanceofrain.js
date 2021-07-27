return {
    node_name: '',
    manifest: {
        timers: ['alive_timer'],
    },
    config: {
        info: {
            rain: undefined,
            alive: undefined,
        },
    },
    rain_chance: 50,
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
        } else if ((event.type == 'node_config_update') && (event.node_name == this.node_name)) {
            this.rain_chance = this.config.info.rain;
            this.info_expiry_time = this.config.info.alive;
            this.info_is_current = true;
            this.draw(response);
            var reg0 = [0, 0, 0, 0];
            reg0[0] = event.id;
            reg0[1] = 0;
            ux_write_log(this.node_name, 5, reg0);
            start_timer(this.node_name, 'alive_timer', this.get_remaining_secs());
        } else if ((event.type == 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'alive_timer'))) {
            this.info_is_current = false;
            this.refresh_weather_info();
        } else if ((event.type === 'common_update') && (event.app_status === true) && (get_common().app_status === 'connected') && (this.info_is_current == false)) {
            this.refresh_weather_info();
        }
    },
    get_remaining_secs: function() {
        var reg0 = this.info_expiry_time - get_unix_time();
        if (reg0 < 10) {
            reg0 = 10;
        }
        return reg0 * 1000;
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            icon: 'icRainChance',
            ci: this.info_is_current ? this.rain_chance + '%' : '– –',
        };
    },
    refresh_weather_info: function() {
        var request = '"chanceOfRainSSE._.config.info":{}';
        req_data(this.node_name, request, 5000, true);
    }
};
