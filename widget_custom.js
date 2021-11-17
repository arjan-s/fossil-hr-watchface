return {
    node_name: '',
    manifest: {
        timers: ['update_timer'],
    },
    config: {
        upper_text: 'Cust',
        lower_text: 'wgt',
        data: undefined,
    },
    last_upper_text: '-',
    last_lower_text: '-',
    update_timeout: 60,  // blank widget after not receiving an update for this amount of minutes
    init: function() {
        this.config.lower_text += " " + this.node_name.slice(-1);
        if (typeof(this.config.data) === 'object') {
            if (is_valid_number(this.config.data.update_timeout)) {
                this.update_timeout = this.config.data.update_timeout;
            }
        }
    },
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            this.draw(response);
        }
        if ((event.type === 'node_config_update') && (this.config.upper_text != this.last_upper_text || this.config.lower_text != this.last_lower_text)) {
            this.draw(response);
            if (this.update_timeout > 0) {
                start_timer(this.node_name, 'update_timer', this.update_timeout * 60 * 1000);
            }
        }
        if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_timer'))) {
            this.config.upper_text = '– –';
            this.config.lower_text = '– –';
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            dt: this.config.upper_text,  // 1st line
            ci: this.config.lower_text,  // 2nd line
        };
    }
};
