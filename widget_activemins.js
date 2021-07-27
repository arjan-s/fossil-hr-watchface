return {
    node_name: '',
    config: {},
    active_mins: 0,
    flick_away: false,
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            if (event.reason == 'flick_away') {
                this.flick_away = true;
            } else if (event.reason == 'flick_away_timeout') {
                this.flick_away = false;
            }
            this.active_mins = get_common().active_minutes;
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            icon: 'icActiveMins',
            ci: localization_snprintf('%d%s', this.active_mins, 'm'),
        };
        var to_draw = response.draw[this.node_name];
        if (this.config.goal_ring == true) {
            to_draw.goal_ring = true;
            to_draw.fi = Math.min(Math.floor(this.active_mins / get_common().daily_goal.active_minutes * 360), 360);
            if ((to_draw.fi >= 360) && (this.flick_away)) {
                to_draw.icon = 'icTrophy';
            }
        }
    }
};
