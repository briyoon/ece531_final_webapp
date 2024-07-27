<script>
    import { goto } from "$app/navigation";

    function goToDashboard() {
        goto("/dashboard");
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
    <p class="text-xl text-bronze mb-8">Page not found</p>
    <button
        on:click={goToDashboard}
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
    >
        Go to Dashboard
    </button>
</div>
