<script>
    import { goto } from "$app/navigation";
    import { checkAuth, login } from "$lib/api/auth";
    import { onMount } from "svelte";

    let username = "";
    let password = "";
    let error = "";

    let mounted = false;

    onMount(() => {
        if (checkAuth()) {
            goto("/dashboard");
        }
        mounted = true;
    });

    async function handleSubmit() {
        try {
            await login({ username, password });
            goto("/");
        } catch (err) {
            error = "Invalid credentials";
        }
    }
</script>

{#if mounted}
    <div class="flex items-center justify-center min-h-screen">
        <div class="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md">
            <h1 class="text-3xl font-semibold text-center text-bronze mb-6">
                Login
            </h1>
            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                <div>
                    <label for="username" class="block text-gray-400 mb-2"
                        >Email:</label
                    >
                    <input
                        type="text"
                        id="username"
                        bind:value={username}
                        placeholder="Email"
                        required
                        class="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ring-bronze"
                    />
                </div>
                <div>
                    <label for="password" class="block text-gray-400 mb-2"
                        >Password:</label
                    >
                    <input
                        type="password"
                        id="password"
                        bind:value={password}
                        placeholder="Password"
                        required
                        class="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ring-bronze"
                    />
                </div>
                <button
                    type="submit"
                    class="w-full px-4 py-2 bg-bronze text-white font-semibold rounded-md hover:bg-bronze-700 focus:outline-none focus:bg-bronze-700"
                    >Login</button
                >
            </form>
            {#if error}
                <p class="text-red-500 mt-4">{error}</p>
            {/if}
        </div>
    </div>
{/if}
