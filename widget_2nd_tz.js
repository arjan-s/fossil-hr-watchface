return {
    node_name: '',
    ht: 1,
    mt: 0,
    manifest: {
        timers: ['mode_switch'],
    },
    config: {
        data: undefined,
    },
    location_name: undefined,
    conf_tz_offset_mins: 0,
    current_tz_offset_mins: 0,
    current_hour: 0,
    current_minute: 0,
    showing: 'offset',
    calculated_hour: 0,
    calculated_mins: 0,
    time_mode_timeout: 15000,
    diff_mins: 0,
    diff_hours: 0,
    init: function() {
        this.location_name = '– –';
        this.conf_tz_offset_mins = get_common().time_zone_local;
        if (typeof(this.config.data) === 'object') {
            if (!is_empty_string(this.config.data.loc)) {
                this.location_name = this.config.data.loc;
            }
            if (is_valid_number(this.config.data.utc)) {
                this.conf_tz_offset_mins = Math.floor(this.config.data.utc);
            }
        }
    },
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            this.showing = 'time';
            start_timer(this.node_name, 'mode_switch', this.time_mode_timeout);
            this.update_time();
            this.draw(response);
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'mode_switch'))) {
            this.showing = 'offset';
            this.update_time();
            this.draw(response);
        } else if ((event.type === 'common_update') && (event.minute === true) && ((this.current_hour !== get_common().hour) || (this.current_minute !== get_common().minute))) {
            if (this.showing === 'time') {
                this.update_time();
                this.draw(response);
            }
        } else if ((event.type === 'common_update') && (event.unit_setting_updated)) {
            this.update_time();
            this.draw(response);
        }
    },
    update_time: function() {
        this.current_tz_offset_mins = get_common().time_zone_local;
        this.current_hour = get_common().hour;
        this.current_minute = get_common().minute;
        var diff_total_mins = this.conf_tz_offset_mins - this.current_tz_offset_mins;
        this.diff_mins = diff_total_mins % 60;
        var mins_plus_diff = this.current_minute + this.diff_mins;
        var add_hour = 0;
        if (mins_plus_diff > 60) {
            add_hour = 1;
        } else if (mins_plus_diff < 0) {
            add_hour = -1;
        } else {
            add_hour = 0;
        }
        this.calculated_mins = mins_plus_diff >= 0 ? mins_plus_diff % 60 : (60 + mins_plus_diff) % 60;
        this.diff_hours = diff_total_mins / 60;
        this.diff_hours = this.diff_hours >= 0 ? Math.floor(this.diff_hours) : Math.ceil(this.diff_hours);
        var hours_total = this.current_hour + this.diff_hours + add_hour;
        this.calculated_hour = hours_total >= 0 ? hours_total % 24 : (24 + hours_total) % 24;
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            dt: undefined,
            ci: this.location_name,
        };
        var to_draw = response.draw[this.node_name];
        if (this.showing == 'offset') {
            var offset_hours = Math.abs(this.diff_hours);
            var offset_mins = (Math.round(Math.abs(this.diff_mins / 60) * 100) / 100).toFixed(2).slice(-2);
            var offset_sign = this.diff_hours >= 0 && this.diff_mins >= 0 ? '+' : '-';
            to_draw.dt = offset_sign + offset_hours + (offset_mins == '00' ? 'h' : '.' + offset_mins + 'h');
        } else if (this.showing == 'time') {
            var clock_mode = get_common().unit_setting.time == '24h' ? '24h' : '12h_short';
            to_draw.dt = format_time_string(this.calculated_hour, this.calculated_mins, clock_mode);
        }
    }
};
