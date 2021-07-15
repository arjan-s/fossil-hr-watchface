return {
    node_name: '',
    last_bpm: '– –',
    handler: function(event, response) {
        if (event.type == 'watch_face_update') {
            this.draw(response, true);
        } else if (event.type == 'display_data_updated') {
            this.draw(response, true);
        } else if ((event.type == 'common_update') && (event.device_offwrist)) {
            this.draw(response, true);
        }
    },
    draw: function(response, redraw_needed) {
        if ((get_common().device_offwrist == false) && (get_common().U('HRM') === 'ON') && (get_common().hr_bpm > 0)) {
            if (this.last_bpm != get_common().hr_bpm) {
                this.last_bpm = get_common().hr_bpm;
                redraw_needed = true;
            }
        } else {
            this.last_bpm = '– –';
        }
        if (redraw_needed) {
            response.draw = {};
            response.draw[this.node_name] = {
                json_file: 'complication_layout',
                icon: 'icHeart',
                ci: this.last_bpm,
            };
        }
    },
};
