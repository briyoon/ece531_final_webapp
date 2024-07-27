<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getUserDevices } from "$lib/api/user";
    import { logout } from "$lib/api/auth";

    /** @type {UserDevice[]} */
    let devices = [];
    let error = "";
    onMount(async () => {
        try {
            devices = await getUserDevices();
        } catch (/** @type {any} */ err) {
            if (err.response && err.response.status === 401) {
                goto("/login");
            } else {
                err = "Failed to fetch devices";
            }
        }
    });

    async function handleLogout() {
        logout();
        goto("/login");
    }
</script>

<div class="flex justify-center py-8">
    <div class="w-full max-w-4xl p-8 bg-gray-800 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-semibold text-white">Your Devices</h1>
            <button
                on:click={handleLogout}
                class="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-700"
            >
                Logout
            </button>
        </div>
        {#if error}
            <p class="text-red-500 mb-4">{error}</p>
        {/if}
        <div class="space-y-4">
            {#each devices as device (device.device_id)}
                <div class="bg-gray-700 rounded-md overflow-hidden">
                    <button
                        on:click={() => {
                            goto(`/devices/${device.device_id}`);
                        }}
                        class="w-full px-4 py-2 text-left text-white font-semibold hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                    >
                        Device ID: {device.device_id}
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
