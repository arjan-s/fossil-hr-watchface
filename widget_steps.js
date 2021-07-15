return {
    node_name: '',
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            if (event.reason == 'flick_away') {
                this.ni = true;
            } else if (event.reason == 'flick_away_timeout') {
                this.ni = false;
            }
            this.st = get_common().step_count;
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            icon: 'icSteps',
            ci: int_to_thousand_string(this.st),
        };
        var to_draw = response.draw[this.node_name];
        if (this.config.goal_ring == true) {
            to_draw.goal_ring = true;
            to_draw.fi = Math.min(Math.floor(this.st / get_common().daily_goal.steps * 360), 360);
            if ((to_draw.fi >= 360) && (this.ni)) {
                to_draw.icon = 'icTrophy';
            }
        }
    },
};
