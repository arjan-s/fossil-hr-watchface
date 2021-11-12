return {
    node_name: '',
    config: {
        upper_text: 'Cust',
        lower_text: 'wgt',
    },
    last_upper_text: '-',
    last_lower_text: '-',
    init: function() {
        this.config.lower_text += " " + this.node_name.slice(-1);
    },
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated')) {
            this.draw(response);
        }
        if(event.type === 'node_config_update' && (this.config.upper_text != this.last_upper_text || this.config.lower_text != this.last_lower_text)){
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
