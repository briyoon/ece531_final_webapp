import { api } from './index';

/**
 * Get all devices for the authenticated user
 * @returns {Promise<UserDevice[]>}
 */
export const getUserDevices = async () => {
  const response = await api.get('/user/device');
  return response.data;
};

/**
 * Get data for a specific device
 * @param {string} deviceId - UUID of the device
 * @returns {Promise<UserDevice>}
 */
export const getUserDevice = async (deviceId) => {
  const response = await api.get(`/user/device/${deviceId}`);
  return response.data;
}

/**
 * Get reports for a specific device
 * @param {string} deviceId - UUID of the device
 * @returns {Promise<ThermostatReport[]>}
 */
export const getDeviceReports = async (deviceId) => {
  const response = await api.get(`/user/device/${deviceId}/reports`);
  return response.data;
};

/**
 * Upload a schedule for a specific device
 * @param {string} deviceId - UUID of the device
 * @param {ThermostatSchedule} schedule - The schedule to upload
 * @returns {Promise<Object>}
 */
export const uploadSchedule = async (deviceId, schedule) => {
  console.log(JSON.stringify(schedule));
  const response = await api.post(`/user/device/${deviceId}/schedule`, JSON.stringify(schedule), {

    "headers": {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

/**
 * Get the schedule for a specific device
 * @param {string} deviceId - UUID of the device
 * @returns {Promise<ThermostatSchedule>}
 */
export const getSchedule = async (deviceId) => {
  const response = await api.get(`/user/device/${deviceId}/schedule`);
  return response.data;
};

export default { getUserDevices, getDeviceReports, uploadSchedule, getSchedule, getUserDevice };