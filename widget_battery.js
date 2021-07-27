return {
    node_name: '',
    battery_level: 0,
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            this.battery_level = get_common().battery_soc;
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'battery_layout',
            ci: this.battery_level + '%',
            et: (get_common().charge_status == 'done') || (get_common().charge_status == 'charging'),
            it: this.battery_level * 16 / 100,
            nt: undefined,
        };
        var to_draw = response.draw[this.node_name];
        to_draw.nt = to_draw.et ? 1 : 3;
        if (this.config.goal_ring == true) {
            to_draw.goal_ring = true;
            to_draw.fi = Math.min(get_common().battery_soc * 360 / 100, 360);
        }
    }
};
