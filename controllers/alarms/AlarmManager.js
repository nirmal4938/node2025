const conditionsConfig = require('./conditions.json');
const AlarmCondition = require('./AlarmCondition')
class AlarmManager {
    constructor() {
        this.conditions = [];
    }

    /**
     * Add a condition to the manager
     * @param {AlarmCondition} condition - An instance of AlarmCondition
     */
    addCondition(condition) {
        this.conditions.push(condition);
    }

    /**
     * Evaluate all conditions for incoming data
     * @param {Object} data - The incoming device data
     * @returns {Array} - List of triggered alarms
     */
    evaluateAll(data) {
        const alarms = [];
        // console.log("@@@@@", data)
        let condition = this.conditions.find((cd) => cd.deviceType === data?.device_type)
        const alarm = condition.evaluate(data);
        // for (const condition of this.conditions) {
        if (alarm) {
            alarms.push(alarm);
        }
        // }
        return alarms;
    }
}
const alarmManager = new AlarmManager();
conditionsConfig.forEach(config => {
    const condition = new AlarmCondition(
        config.device_type,
        config.parameter,
        config.thresholds,
        config.alarm_type,
        config.alert_message_template
    );
    alarmManager.addCondition(condition);
});

module.exports = alarmManager

