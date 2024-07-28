<script>
    import { Line } from "svelte-chartjs";
    import { Chart, registerables } from "chart.js";
    import "chartjs-adapter-date-fns"; // Import the date adapter
    import { getDeviceReports } from "$lib/api/user";

    Chart.register(...registerables);

    /** @type {ThermostatReport[]} */
    export let reportData;
    /**
     * @type {string}
     */
    export let deviceId;

    /**
     * @type {ThermostatReport[]}
     */
    let allReports = [];
    let showReportModal = false;

    $: updateChartData(reportData);

    /** @type {import("chart.js").ChartData} */
    let chartData = {
        labels: [],
        datasets: [
            {
                label: "Temperature (°C)",
                data: [],
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
            {
                label: "Heater On",
                data: [],
                borderColor: "rgb(255, 99, 132)",
                stepped: true,
            },
        ],
    };

    /** @type {import("chart.js").ChartOptions} */
    let chartOptions = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "hour",
                    displayFormats: {
                        hour: "MMM d, HH:mm",
                    },
                },
                title: {
                    display: true,
                    text: "Time",
                },
            },
            y: {
                animate: false,
                beginAtZero: true,
                min: 0,
                max: 40,
                title: {
                    display: true,
                    text: "Temperature (°C)",
                },
            },
            y1: {
                type: "linear",
                display: true,
                position: "right",
                min: 0,
                max: 40,
                ticks: {
                    callback: function (value) {
                        if (value === 40) return "On";
                        if (value === 0) return "Off";
                        return "";
                    },
                },
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Heater Status",
                },
            },
        },
    };

    /**
     * @param {ThermostatReport[]} reportData
     */
    function updateChartData(reportData) {
        if (!reportData || reportData.length === 0) {
            // Provide dummy data to render the chart grid
            chartData.labels = [new Date()];
            chartData.datasets = [
                {
                    label: "Temperature (°C)",
                    data: [null],
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                },
                {
                    label: "Heater On",
                    data: [null],
                    borderColor: "rgb(255, 99, 132)",
                    stepped: true,
                },
                {
                    label: "Invisible",
                    data: [20, 20, 20, 20, 20], // Adjust this based on the scale of your y-axis
                    borderColor: "rgba(0,0,0,0)",
                    backgroundColor: "rgba(0,0,0,0)",
                },
            ];
        } else {
            chartData.labels = reportData.map(
                (report) => new Date(report.timestamp),
            );
            chartData.datasets = [
                {
                    label: "Temperature (°C)",
                    data: reportData.map(
                        (report) => report.temperature_celcius,
                    ),
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                },
                {
                    label: "Heater On",
                    data: reportData.map((report) =>
                        report.heater_on ? 40 : 0,
                    ),
                    borderColor: "rgb(255, 99, 132)",
                    stepped: true,
                },
            ];
        }
        chartData = { ...chartData }; // Trigger reactivity
    }

    async function viewReports() {
        allReports = await getDeviceReports(deviceId);
        showReportModal = true;
    }

    function closeReportModal() {
        showReportModal = false;
    }
</script>

<div class="flex flex-row gap-8">
    <h2 class="text-xl font-semibold text-white mb-2">Temperature Graph</h2>
    <button
        class="rounded-lg px-2 bg-bronze font-semibold"
        on:click={() => viewReports()}>View all reports</button
    >
</div>
<div class="w-full h-64" style="position: relative;">
    <Line data={chartData} options={chartOptions} />
</div>

{#if showReportModal}
    <div class="fixed z-10 inset-0 overflow-y-auto bg-gray-600 bg-opacity-50">
        <div
            class="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0"
        >
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full"
                style="height: 90vh;"
            >
                <div
                    class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex flex-col h-full"
                >
                    <h3
                        class="text-lg leading-6 font-medium text-gray-900 mb-4"
                    >
                        Device Reports
                    </h3>
                    <div class="flex-grow overflow-y-auto mb-4">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th
                                        scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Timestamp</th
                                    >
                                    <th
                                        scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Temperature</th
                                    >
                                    <th
                                        scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Heater</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each allReports.reverse() as report}
                                    <tr>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {new Date(
                                                report.timestamp,
                                            ).toLocaleString()}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {report.temperature_celcius}°C
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {report.heater_on ? "On" : "Off"}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <div
                        class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto"
                    >
                        <button
                            type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            on:click={closeReportModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
