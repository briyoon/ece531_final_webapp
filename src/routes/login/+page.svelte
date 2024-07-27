<script>
    import { goto } from "$app/navigation";
    import { login } from "$lib/api/auth";

    let username = "";
    let password = "";
    let error = "";

    async function handleSubmit() {
        try {
            await login({ username, password });
            goto("/");
        } catch (err) {
            error = "Invalid credentials";
        }
    }
</script>

<h1>Login</h1>
<form on:submit|preventDefault={handleSubmit}>
    Email:
    <input type="text" bind:value={username} placeholder="Email" required />
    Password
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
    />
    <button type="submit">Login</button>
</form>
{#if error}
    <p class="error">{error}</p>
{/if}
