return {
    node_name: '',
    manifest: {
        timers: ['update_du4', 'update_gc4']
    },
    config: {},
    init: function() {},
    deinit: undefined,
    handler: function(event, response) {
        if (event.is_button_event) {
            this.handle_button_event(event, response);
        }
        if (event.type === 'ui_boot_up_done') {
            response.action = {
                type: 'go_visible',
                class: 'home',
            };
        } else if (event.type === 'system_state_update') {
            this.draw(response, 'gc4');
            var hands = enable_time_telling();
            response.move = {
                h: hands.hour_pos,
                m: hands.minute_pos,
                is_relative: false,
            };
            start_timer(this.node_name, 'update_du4', 15 * 60 * 1000);
            start_timer(this.node_name, 'update_gc4', 60 * 60 * 1000);
        } else if (event.type === 'time_telling_update') {
            var hands = enable_time_telling();
            response.move = {
                h: hands.hour_pos,
                m: hands.minute_pos,
                is_relative: false,
            };
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_du4'))) {
            this.draw(response, 'du4');
            start_timer(this.node_name, 'update_du4', 15 * 60 * 1000);
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_gc4'))) {
            this.draw(response, 'gc4');
            start_timer(this.node_name, 'update_gc4', 60 * 60 * 1000);
        } else if (event.type === 'display_data_updated') {
            this.draw(response, 'gc4');
        }
    },
    draw: function(response, redraw_type) {
        response.draw = {
            node_name: this.node_name,
            package_name: this.package_name,
            background: 'background.raw',
            update_type: redraw_type,
            skip_invert: true,
        };
    },
    handle_button_event: function(event, response) {
        for (var index in this.config.button_assignments) {
            var config = this.config.button_assignments[index];
            if (event.type === config.button_evt) {
                response.action = {
                    type: 'open_app',
                    node_name: config.name,
                    class: 'watch_app',
                }
            }
        }
    },
};
