return {
    node_name: '',
    config: {},
    init: function() {},
    deinit: undefined,
    handler: function(event, response) {
        if (event.type === 'ui_boot_up_done') {
            response.action = {
                type: 'go_visible',
                class: 'home',
            };
        } else if (event.type === 'system_state_update') {
            response.draw = {
                node_name: this.node_name,
                package_name: this.package_name,
                background: 'background.raw',
                update_type: 'gc4',
                skip_invert: true,
            };
            var hands = enable_time_telling();
            response.move = {
                h: 360 - hands.hour_pos,
                m: 360 - hands.minute_pos,
                is_relative: false,
            };
        } else if (event.type === 'time_telling_update') {
            var hands = enable_time_telling();
            response.move = {
                h: 360 - hands.hour_pos,
                m: 360 - hands.minute_pos,
                is_relative: false,
            };
        }
    },
};
