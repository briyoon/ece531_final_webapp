<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { uploadSchedule } from "$lib/api/user";

    const dispatch = createEventDispatcher();

    let showAddModal = false;
    let showEditModal = false;
    let selectedDay = "";
    let selectedTime = "";
    let newSlotTime = "";
    let newSlotTemperature = 20;

    /** @type {UserDevice} */
    export let deviceDetails;

    $: currentSchedule = deviceDetails?.schedule;
    /**
     * @type {ThermostatSchedule | null}
     */
    let originalSchedule;

    onMount(() => {
        if (
            deviceDetails?.schedule?.schedule == null ||
            deviceDetails?.schedule?.schedule == []
        ) {
            deviceDetails.schedule = {
                schedule: daysOfWeek.map((day) => ({
                    day: day,
                    slots: [],
                })),
            };
            deviceDetails = { ...deviceDetails };
        }
        originalSchedule = structuredClone(deviceDetails?.schedule);
    });

    /**
     * @param {string} day
     * @param {string} time
     */
    async function deleteSlot(day, time) {
        // Delete a time slot for the specified day
        deviceDetails?.schedule?.schedule.map((daySchedule) => {
            if (daySchedule.day === day) {
                daySchedule.slots = daySchedule.slots.filter(
                    (slot) => slot.time !== time,
                );
            }
            return daySchedule;
        });
        deviceDetails = { ...deviceDetails };
    }

    const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    /**
     * @param {string} day
     */
    function getScheduleForDay(day) {
        if (deviceDetails?.schedule?.schedule) {
            let daySchedule = deviceDetails?.schedule?.schedule.find(
                (x) => x.day === day,
            );
            return daySchedule?.slots.length == 0 ? null : daySchedule;
        }
        return null;
    }

    /**
     * @param {number} temperature
     */
    function getTemperatureColor(temperature) {
        const minTemp = 0;
        const midTemp = 20;
        const maxTemp = 40;

        if (temperature <= minTemp) {
            return "#0000FF"; // Blue
        } else if (temperature >= maxTemp) {
            return "#FF0000"; // Red
        } else if (temperature < midTemp) {
            // Gradient from blue to green for temperatures between 0 and 20
            const ratio = (temperature - minTemp) / (midTemp - minTemp);
            const red = 0;
            const green = Math.round(ratio * 255);
            const blue = Math.round((1 - ratio) * 255);

            const redHex = red.toString(16).padStart(2, "0");
            const greenHex = green.toString(16).padStart(2, "0");
            const blueHex = blue.toString(16).padStart(2, "0");

            return `#${redHex}${greenHex}${blueHex}`;
        } else {
            // Gradient from green to red for temperatures between 20 and 40
            const ratio = (temperature - midTemp) / (maxTemp - midTemp);
            const red = Math.round(ratio * 255);
            const green = Math.round((1 - ratio) * 255);
            const blue = 0;

            const redHex = red.toString(16).padStart(2, "0");
            const greenHex = green.toString(16).padStart(2, "0");
            const blueHex = blue.toString(16).padStart(2, "0");

            return `#${redHex}${greenHex}${blueHex}`;
        }
    }

    /**
     * @param {string} day
     */
    function openAddModal(day) {
        selectedDay = day;
        newSlotTime = "";
        newSlotTemperature = 20;
        showAddModal = true;
    }

    function closeAddModal() {
        showAddModal = false;
    }

    /**
     * @param {string} day
     * @param {string} time
     */
    function openEditModal(day, time) {
        selectedDay = day;
        selectedTime = time;
        const slot = getSlotByDayAndTime(day, time);
        newSlotTime = slot.time;
        newSlotTemperature = slot.temperature;
        showEditModal = true;
    }

    function closeEditModal() {
        showEditModal = false;
    }

    /**
     * @param {string} day
     * @param {string} time
     */
    function getSlotByDayAndTime(day, time) {
        const daySchedule = getScheduleForDay(day);
        return daySchedule?.slots.find((slot) => slot.time === time);
    }

    async function handleAddSlot() {
        const newSlot = {
            time: newSlotTime,
            temperature: newSlotTemperature,
        };
        deviceDetails?.schedule?.schedule.map((daySchedule) => {
            if (daySchedule.day === selectedDay) {
                daySchedule.slots.push(newSlot);
            }
            return daySchedule;
        });
        deviceDetails = { ...deviceDetails };
        closeAddModal();
        dispatch("slotAdded");
    }

    async function handleUpdateSlot() {
        deviceDetails?.schedule?.schedule.map((daySchedule) => {
            if (daySchedule.day === selectedDay) {
                const slotIndex = daySchedule.slots.findIndex(
                    (slot) => slot.time === selectedTime,
                );
                if (slotIndex !== -1) {
                    daySchedule.slots[slotIndex] = {
                        time: newSlotTime,
                        temperature: newSlotTemperature,
                    };
                }
            }
            return daySchedule;
        });
        deviceDetails = { ...deviceDetails };
        closeEditModal();
        dispatch("slotUpdated");
    }

    /**
     * @param {string} time
     */
    function validateTimeFormat(time) {
        if (!/^\d{2}:\d{2}$/.test(time)) {
            throw new Error("Invalid time format, should be HH:MM");
        }
        const [hours, minutes] = time.split(":").map(Number);
        if (hours >= 24 || minutes >= 60) {
            throw new Error("Invalid time format, should be HH:MM");
        }
    }

    /**
     * @param {string} day
     */
    function validateDayName(day) {
        const validDays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        if (!validDays.includes(day)) {
            throw new Error("Invalid day name");
        }
    }

    /**
     * @param {any[]} slots
     */
    function checkTimeConflicts(slots) {
        const times = slots.map(
            (/** @type {{ time: any; }} */ slot) => slot.time,
        );
        if (new Set(times).size !== times.length) {
            throw new Error("Time slots conflict within the same day");
        }
    }

    async function updateSchedule() {
        try {
            if (!deviceDetails?.schedule?.schedule) {
                throw new Error("Invalid schedule format");
            }
            const schedule = deviceDetails.schedule.schedule;

            // Validate the entire schedule
            for (const daySchedule of schedule) {
                // Validate day name
                validateDayName(daySchedule.day);

                // Validate slots
                for (const slot of daySchedule.slots) {
                    // Validate time format
                    validateTimeFormat(slot.time);

                    // Validate temperature range
                    if (slot.temperature < 0 || slot.temperature > 40) {
                        throw new Error(
                            `Invalid temperature (${slot.temperature}°C) for ${daySchedule.day} at ${slot.time}. Temperature must be between 0°C and 40°C.`,
                        );
                    }
                }

                // Check for time conflicts within the day
                checkTimeConflicts(daySchedule.slots);
            }

            // If all validations pass, proceed with upload
            await uploadSchedule(
                deviceDetails.device_id,
                deviceDetails.schedule,
            );
            originalSchedule = deviceDetails?.schedule;
            alert("Schedule uploaded successfully");
        } catch (err) {
            alert("Failed to upload schedule: " + err.message);
        }
    }
</script>

{#key currentSchedule}
    <div class="mb-8">
        <div class="flex flex-row gap-8">
            <h2 class="text-xl font-semibold text-white mb-2">
                Weekly Calendar
            </h2>

            <button
                class="rounded-lg px-2 bg-bronze font-semibold"
                on:click={() => updateSchedule()}>Upload schedule</button
            >
        </div>
        <div class="grid grid-cols-7 gap-2">
            {#each daysOfWeek as day}
                {@const daySchedule = getScheduleForDay(day)}
                <div class="bg-gray-700 rounded-md p-4">
                    <div
                        class="flex flex-col justify-between items-center mb-4"
                    >
                        <h3 class="text-lg font-semibold text-white">
                            {day}
                        </h3>
                        <button
                            class="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                            on:click={() => openAddModal(day)}
                        >
                            Add Slot
                        </button>
                    </div>
                    {#if daySchedule}
                        <div class="space-y-2">
                            {#each daySchedule.slots as slot}
                                <div
                                    class="flex justify-between items-center bg-gray-600 rounded-md px-2 py-1"
                                >
                                    <div
                                        class="flex flex-col items-center justify-center"
                                    >
                                        <span class="text-white"
                                            >{slot.time}</span
                                        >
                                        <span class="text-[#00ff00] ml-2"
                                            >{slot.temperature}°C</span
                                        >
                                    </div>
                                    <div
                                        class="flex flex-col justify-center items-center"
                                    >
                                        <button
                                            class="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none mr-2"
                                            on:click={() =>
                                                openEditModal(day, slot.time)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            class="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                                            on:click={() =>
                                                deleteSlot(day, slot.time)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-gray-400">No schedule for this day</p>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/key}

{#if showAddModal}
    <div class="fixed z-10 inset-0 overflow-y-auto">
        <div
            class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
                class="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true">&#8203;</span
            >
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Add Slot
                    </h3>
                    <div class="mt-4">
                        <label
                            for="newSlotTime"
                            class="block text-sm font-medium text-gray-700"
                            >Time</label
                        >
                        <input
                            type="text"
                            id="newSlotTime"
                            bind:value={newSlotTime}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div class="mt-4">
                        <label
                            for="newSlotTemperature"
                            class="block text-sm font-medium text-gray-700"
                            >Temperature (°C)</label
                        >
                        <input
                            type="number"
                            id="newSlotTemperature"
                            bind:value={newSlotTemperature}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                </div>
                <div
                    class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
                >
                    <button
                        type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleAddSlot}>Save</button
                    >
                    <button
                        type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={closeAddModal}>Cancel</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}

{#if showEditModal}
    <div class="fixed z-10 inset-0 overflow-y-auto">
        <div
            class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
                class="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true">&#8203;</span
            >
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Edit Slot
                    </h3>
                    <div class="mt-4">
                        <label
                            for="editSlotTime"
                            class="block text-sm font-medium text-gray-700"
                            >Time</label
                        >
                        <input
                            type="text"
                            id="editSlotTime"
                            bind:value={newSlotTime}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div class="mt-4">
                        <label
                            for="editSlotTemperature"
                            class="block text-sm font-medium text-gray-700"
                            >Temperature (°C)</label
                        >
                        <input
                            type="number"
                            id="editSlotTemperature"
                            bind:value={newSlotTemperature}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                </div>
                <div
                    class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
                >
                    <button
                        type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleUpdateSlot}>Update</button
                    >
                    <button
                        type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={closeEditModal}>Cancel</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}
