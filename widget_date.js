return {
    node_name: '',
    day_of_week: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    day: '---',
    date: 0,
    handler: function(event, response) {
        if ((event.type === 'watch_face_update') || (event.type === 'display_data_updated') || (event.type === 'common_update') && (event.date === true) && (this.date != get_common().date)) {
            this.day = this.day_of_week[get_common().day];
            this.date = get_common().date;
            this.draw(response);
        }
    },
    draw: function(response) {
        response.draw = {};
        response.draw[this.node_name] = {
            json_file: 'complication_layout',
            dt: this.date,  // 1st line
            ci: localization_snprintf('%s', this.day),  // 2nd line
        };
    },
};
