import api from './auth';

/**
 * @typedef {Object} UserDevice
 * @property {string} device_id - UUID of the device
 * @property {string} user_id - UUID of the user
 * @property {Object|null} schedule - The device's schedule, if any
 */

/**
 * @typedef {Object} ThermostatReport
 * @property {number} temperature_celcius - The temperature in Celsius
 * @property {boolean} heater_on - Whether the heater is on
 * @property {string} timestamp - ISO 8601 timestamp of the report
 */

/**
 * @typedef {Object} TimeSlot
 * @property {string} time - Time in "HH:MM" format
 * @property {number} temperature - Temperature setting (0-40°C)
 */

/**
 * @typedef {Object} DaySchedule
 * @property {string} day - Day of the week (Monday-Sunday)
 * @property {TimeSlot[]} slots - Array of time slots for the day
 */

/**
 * @typedef {Object} ThermostatSchedule
 * @property {DaySchedule[]} schedule - Array of day schedules
 */

/**
 * Get all devices for the authenticated user
 * @returns {Promise<UserDevice[]>} Array of user devices
 */
export const getUserDevices = async () => {
  const response = await api.get('/user/device');
  return response.data;
};

/**
 * Get reports for a specific device
 * @param {string} deviceId - UUID of the device
 * @returns {Promise<ThermostatReport[]>} Array of thermostat reports
 */
export const getDeviceReports = async (deviceId) => {
  const response = await api.get(`/user/device/${deviceId}/reports`);
  return response.data;
};

/**
 * Upload a schedule for a specific device
 * @param {string} deviceId - UUID of the device
 * @param {ThermostatSchedule} schedule - The schedule to upload
 * @returns {Promise<Object>} Response data
 */
export const uploadSchedule = async (deviceId, schedule) => {
  const response = await api.post(`/user/device/${deviceId}/schedule`, schedule);
  return response.data;
};

/**
 * Get the schedule for a specific device
 * @param {string} deviceId - UUID of the device
 * @returns {Promise<ThermostatSchedule>} The device's schedule
 */
export const getSchedule = async (deviceId) => {
  const response = await api.get(`/user/device/${deviceId}/schedule`);
  return response.data;
};