const { compileTemplate } = require('../../utils/TemplateUtils')
class AlarmCondition {
    /**
     * Creates an instance of AlarmCondition
     * @param {String} deviceType - The type of the device (e.g., 'Pump', 'Water Level Sensor')
     * @param {String} parameter - The parameter to check (e.g., 'value', 'status')
     * @param {Object} thresholds - The thresholds for triggering alarms
     * @param {String} alarmType - The type of alarm (e.g., 'CRITICAL', 'WARNING')
     * @param {String} alertMessageTemplate - Template for the alert message
     */
    constructor(deviceType, parameter, thresholds, alarmType, alertMessageTemplate) {
        this.deviceType = deviceType;
        this.parameter = parameter;
        this.thresholds = thresholds;
        this.alarmType = alarmType;
        this.alertMessageTemplate = alertMessageTemplate;
    }

    /**
     * Evaluate the condition and return an alarm if triggered
     * @param {Object} data - The incoming device data
     * @returns {Object|null} - Alarm object or null if no alarm
     */
    evaluate(data) {
        const value = data[this.parameter];

        // Check thresholds
        if (this.thresholds.upperLimit !== undefined && value > this.thresholds.upperLimit) {
            console.log("evaluated deviceId", data)
            return this.generateAlarm(data, `Exceeds upper limit: ${this.thresholds.upperLimit}`);
        }
        if (this.thresholds.lowerLimit !== undefined && value < this.thresholds.lowerLimit) {
            return this.generateAlarm(data, `Falls below lower limit: ${this.thresholds.lowerLimit}`);
        }
        if (this.thresholds.exact !== undefined && value === this.thresholds.exact) {
            return this.generateAlarm(data, `Matches exact threshold: ${this.thresholds.exact}`);
        }

        return null;
    }

    /**
     * Generate an alarm object
     * @param {Object} data - The incoming device data
     * @param {String} reason - Reason for triggering the alarm
     * @returns {Object} - Alarm object
     */
    generateAlarm(data, reason) {
        console.log("deviceId", data)
        return {
            // ...data,
            device_id: data.device_id,
            device_type: this.deviceType,
            alarm_type: this.alarmType,
            alert_message: compileTemplate(this.alertMessageTemplate, data),
            reason,
            timestamp: new Date(),
            acknowledged: false,
            metadata: data.metadata,
            trigger_condition: 'any'

        };
    }
}
module.exports = AlarmCondition
