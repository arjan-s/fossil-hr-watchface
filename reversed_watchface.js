return {
    node_name: '',
    manifest: {
        timers: ['update_partial', 'update_full']
    },
    config: {},
    init: function() {},
    deinit: undefined,
    timeout_partial_display_update: 15 * 60 * 1000,
    timeout_full_display_update: 60 * 60 * 1000,
    handler: function(event, response) {
        if (event.is_button_event) {
            // Handle physical button presses
            this.handle_button_event(event, response);
        }
        if (event.type === 'ui_boot_up_done') {
            // Called once when the watchface app is started
            response.action = {
                type: 'go_visible',
                class: 'home',
            };
        } else if (event.type === 'system_state_update') {
            this.draw(response, 'gc4');
            var hands = enable_time_telling();
            response.move = {
                h: 360 - hands.hour_pos,
                m: 360 - hands.minute_pos,
                is_relative: false,
            };
            start_timer(this.node_name, 'update_partial', this.timeout_partial_display_update);
            start_timer(this.node_name, 'update_full', this.timeout_full_display_update);
        } else if (event.type === 'time_telling_update') {
            // Called every 20 seconds, i.e. every time the hands need to move
            var hands = enable_time_telling();
            response.move = {
                h: 360 - hands.hour_pos,
                m: 360 - hands.minute_pos,
                is_relative: false,
            };
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_partial'))) {
            // Timer for partial display updates expired
            this.draw(response, 'du4');
            start_timer(this.node_name, 'update_partial', this.timeout_partial_display_update);
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_full'))) {
            // Timer for full display updates expired
            this.draw(response, 'gc4');
            start_timer(this.node_name, 'update_full', this.timeout_full_display_update);
        } else if (event.type === 'display_data_updated') {
            // Something on the display needs to be updated
            this.draw(response, 'gc4');
        }
    },
    draw: function(response, redraw_type) {
        response.draw = {
            node_name: this.node_name,
            package_name: this.package_name,
            layout_function: 'layout_parser_json',
            background: undefined,
            update_type: redraw_type,
            skip_invert: true,
        };
        for (var key in this.config.layout) {
            var layout = this.config.layout[key];
            if ((layout === undefined) || (is_empty_string(layout.name))) {
                continue;
            }
            if (layout.type === 'image') {
                if ((layout.size.w == 240) && (layout.size.h == 240)) {
                    response.draw.background = layout.name;
                }
            }
        }
    },
    handle_button_event: function(event, response) {
        for (var index in this.config.button_assignments) {
            var config = this.config.button_assignments[index];
            if (event.type === config.button_evt) {
                response.action = {
                    type: 'open_app',
                    node_name: config.name,
                    class: 'watch_app',
                };
            }
        }
    },
};
