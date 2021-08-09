return {
    node_name: '',
    manifest: {
        timers: ['update_partial', 'update_full', 'hands', 'flick_away']
    },
    config: {},
    complications: {
        draw: {}
    },
    installed_complications: [],
    deinit: undefined,
    timeout_partial_display_update: 15 * 60 * 1000,
    timeout_full_display_update: 60 * 60 * 1000,
    full_refresh_needed: false,
    powersave_display: false,
    powersave_hands: false,
    time_telling_enabled: true,
    wrist_flick_display_timeout: 5000,
    wrist_flick_hands_timeout: 2200,
    wrist_flick_hands_relative: true,
    wrist_flick_move_hour: 360,
    wrist_flick_move_minute: -360,
    init: function() {
        for (var key in this.config.layout) {
            var layout = this.config.layout[key];
            if ((layout === undefined) || (is_empty_string(layout.name))) {
                continue;
            }
            if (layout.type == 'comp') {
                if (is_node_installed(layout.name)) {
                    if (layout.pos != undefined) {
                        layout.pos = this.calculate_position(layout.pos, layout.size);
                    }
                    var node_config = get_node_config(layout.name);
                    if (layout.data != undefined) {
                        node_config.data = layout.data;
                    }
                    this.installed_complications.push(layout.name);
                    init_node(layout.name);
                }
            }
        }
        if (this.config.config != undefined) {
            for (var key in this.config.config) {
                var value = this.config.config[key];
                switch (key) {
                    case "timeout_display_partial":
                        if (typeof value === 'number') {
                            this.timeout_partial_display_update = value;
                        }
                        break;
                    case "timeout_display_full":
                        if (typeof value === 'number') {
                            this.timeout_full_display_update = value;
                        }
                        break;
                    case "wrist_flick_hands_relative":
                        if (typeof value === "boolean") {
                            this.wrist_flick_hands_relative = value;
                        }
                        break;
                    case "wrist_flick_move_hour":
                        if (typeof value === 'number') {
                            this.wrist_flick_move_hour = value;
                        }
                        break;
                    case "wrist_flick_move_minute":
                        if (typeof value === 'number') {
                            this.wrist_flick_move_minute = value;
                        }
                        break;
                    case "wrist_flick_duration":
                        if (typeof value === 'number') {
                            this.wrist_flick_hands_timeout = value;
                        }
                        break;
                    case "powersave_display":
                        if (typeof value === "boolean") {
                            this.powersave_display = value;
                        }
                        break;
                    case "powersave_hands":
                        if (typeof value === "boolean") {
                            this.powersave_hands = value;
                        }
                        break;
                }
            }
        }
    },
    handler: function(event, response) {
        var redraw_needed = false;
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
            // Generic system state updates
            this.update_complications({
                type: 'watch_face_update',
                reason: 'watch_face_visible',
            });
            redraw_needed = true;
            this.full_refresh_needed = true;
            var hands = enable_time_telling();
            response.move = {
                h: hands.hour_pos,
                m: hands.minute_pos,
                is_relative: false,
            };
            start_timer(this.node_name, 'update_partial', this.timeout_partial_display_update);
            start_timer(this.node_name, 'update_full', this.timeout_full_display_update);
        } else if ((event.type === 'time_telling_update') && ((!this.powersave_hands) || (!get_common().device_offwrist))) {
            // Called every 20 seconds, i.e. every time the hands need to move
            var hands = enable_time_telling();
            response.move = {
                h: hands.hour_pos,
                m: hands.minute_pos,
                is_relative: false,
            };
            this.time_telling_enabled = true;
        } else if ((event.type == 'common_update') && (event.device_offwrist)) {
            if (get_common().device_offwrist) {
                disable_time_telling();
                this.time_telling_enabled = false;
            } else {
                var hands = enable_time_telling();
                response.move = {
                    h: hands.hour_pos,
                    m: hands.minute_pos,
                    is_relative: false,
                };
                this.time_telling_enabled = true;
            }
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_partial')) && ((!this.powersave_display) || (!get_common().device_offwrist))) {
            // Timer for partial display updates expired
            redraw_needed = this.update_complications({
                type: 'display_data_updated',
            });
            start_timer(this.node_name, 'update_partial', this.timeout_partial_display_update);
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'update_full')) && ((!this.powersave_display) || (!get_common().device_offwrist))) {
            // Timer for full display updates expired
            redraw_needed = true;
            this.update_complications({
                type: 'display_data_updated',
            });
            this.full_refresh_needed = true;
            start_timer(this.node_name, 'update_full', this.timeout_full_display_update);
        } else if (event.type === 'flick_away') {
            // Called when the user flicks the wrist
            this.update_complications({
                type: 'display_data_updated',
                reason: 'flick_away',
            });
            redraw_needed = true;
            start_timer(this.node_name, 'update_partial', this.timeout_partial_display_update);
            start_timer(this.node_name, 'flick_away', this.wrist_flick_display_timeout);
            if (this.time_telling_enabled) {
                disable_time_telling();
                start_timer(this.node_name, 'hands', this.wrist_flick_hands_timeout);
                response.move = {
                    h: this.wrist_flick_move_hour,
                    m: this.wrist_flick_move_minute,
                    is_relative: this.wrist_flick_hands_relative,
                };
                this.time_telling_enabled = false;
            }
        } else if ((event.type === 'timer_expired') && (is_this_timer_expired(event, this.node_name, 'hands'))) {
            // Timer for reenabling time telling after wrist flick expired
            var hands = enable_time_telling();
            response.move = {
                h: hands.hour_pos,
                m: hands.minute_pos,
                is_relative: false,
            };
            this.time_telling_enabled = true;
        } else if (((event.type === 'display_data_updated') || (this.update_complications(event))) && ((!this.powersave_display) || (!get_common().device_offwrist))) {
            // Something on the display needs to be updated
            redraw_needed = true;
        }
        if (redraw_needed === true) {
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {
            node_name: this.node_name,
            package_name: this.package_name,
            layout_function: 'layout_parser_json',
            background: undefined,
            array: [],
            update_type: this.full_refresh_needed ? 'gc4' : 'du4',
            skip_invert: true,
        };
        this.full_refresh_needed = false;
        var counter = 0;
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
            if (layout.type === 'comp') {
                if (typeof(this.complications.draw[layout.name]) !== 'object' ) {
                    continue;
                }
                response.draw.array[counter] = {
                    size: layout.size,
                    pos: layout.pos,
                    background: layout.bg,
                    $e: layout.color == 'black',
                };
                deep_fill(response.draw.array[counter], this.complications.draw[layout.name]);
                counter++;
            }
        }
    },
    update_complications: function(why) {
        var need_update = {};
        var result = false;
        forward_input(why, this.installed_complications, need_update);
        if (get_common().U('DIAL_INFO') === 'ON') {
            for (var index in need_update) {
                if (typeof(need_update[index].draw) === 'object') {
                    result = true;
                    for (var index2 in need_update[index].draw) {
                        this.complications.draw[index2] = need_update[index].draw[index2];
                    }
                }
            }
        } else {
            this.complications.draw = {};
        }
        return result;
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
    calculate_position: function(pos, size) {
        return {
            Ue: Math.floor(pos.x - size.w / 2),
            Qe: Math.floor(pos.y - size.h / 2),
        };
    },
};
