import { writable } from 'svelte/store';
import Cookies from 'js-cookie';
import { fetchEventSource } from '@microsoft/fetch-event-source';

/** @type {import('svelte/store').Writable<ThermostatReport[]>} */
export const reportDataStore = writable([]);
export const connectionStatus = writable('disconnected');

/**
 * @type {AbortController | null}
 */
let abortController = null;
const BASE_URL = "http://localhost:8000";

/**
 * @param {ThermostatReport[]} reports
 * @param {number} minutes
 * @returns {ThermostatReport[]}
 */
function removeOldReports(reports, minutes) {
    const cutoffTime = new Date(Date.now() - minutes * 60000);
    return reports.filter(report => new Date(report.timestamp) > cutoffTime);
}

/**
 * @param {string} deviceId
 */
export async function connectToSSE(deviceId) {
    connectionStatus.set('connecting');
    abortController = new AbortController();
    const token = Cookies.get('jwt');

    fetchEventSource(`${BASE_URL}/api/v1/user/device/${deviceId}/reports/stream`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        },
        signal: abortController.signal,
        async onopen(response) {
            if (response.ok && response.status === 200) {
                connectionStatus.set('connected');
            } else {
                throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
            }
        },
        onmessage(event) {
            if (event.event === 'historical' || event.event === 'update') {
                const report = JSON.parse(event.data);
                reportDataStore.update(data => {
                    const updatedData = [...data, report];
                    return removeOldReports(updatedData, 15);  // Remove reports older than 15 minutes
                });
            }
        },
        onclose() {
            connectionStatus.set('disconnected');
        },
        onerror(err) {
            console.error('SSE error:', err);
            connectionStatus.set('error');
        },
    });
}

export function disconnectSSE() {
    if (abortController) {
        abortController.abort();
        connectionStatus.set('disconnected');
    }
}

// Function to manually clean up old data
export function cleanupOldData() {
    reportDataStore.update(data => removeOldReports(data, 15));
}