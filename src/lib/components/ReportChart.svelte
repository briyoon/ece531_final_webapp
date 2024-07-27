<script>
    import { Line } from "svelte-chartjs";
    import { Chart, registerables } from "chart.js";
    import "chartjs-adapter-date-fns"; // Import the date adapter

    Chart.register(...registerables);

    /** @type {ThermostatReport[]} */
    export let reportData;

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
        if (!reportData) return;
        chartData.labels = reportData.map(
            (report) => new Date(report.timestamp),
        );
        chartData.datasets[0].data = reportData.map(
            (report) => report.temperature_celcius,
        );
        chartData.datasets[1].data = reportData.map((report) =>
            report.heater_on ? 40 : 0,
        );
        chartData = chartData;
    }
</script>

<div>
    <h2 class="text-xl font-semibold text-white mb-2">Temperature Graph</h2>
    <div class="w-full h-64">
        <Line data={chartData} options={chartOptions} />
    </div>
</div>
