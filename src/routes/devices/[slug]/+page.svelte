<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getUserDevice, getDeviceReports } from "$lib/api/user";
    import WeeklySchedule from "$lib/components/WeeklySchedule.svelte";
    import ReportChart from "$lib/components/ReportChart.svelte";

    export let data;

    /** @type {UserDevice} */
    let deviceDetails;
    /** @type {ThermostatReport[]} */
    let reportData;
    let error = "";

    onMount(async () => {
        try {
            // @ts-ignore
            deviceDetails = await getUserDevice(data.deviceId);
            // @ts-ignore
            reportData = await getDeviceReports(data.deviceId);
        } catch (/** @type {any} */ err) {
            error = "Failed to fetch device details";
        }
    });

    function goBack() {
        goto("/dashboard");
    }
</script>

<div class="flex justify-center py-8">
    <div class="w-full max-w-[90%] p-8 bg-gray-800 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-semibold text-white">Device Details</h1>
            <button
                on:click={goBack}
                class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
                Back to Devices
            </button>
        </div>
        {#if error}
            <p class="text-red-500 mb-4">{error}</p>
        {:else if deviceDetails}
            <WeeklySchedule {deviceDetails} />
            <ReportChart {reportData} />
        {/if}
    </div>
</div>
