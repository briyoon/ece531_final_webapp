<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { checkAuth, logout } from "$lib/api/auth";

    onMount(() => {
        if (!checkAuth()) {
            goto("/login");
        }
    });

    function handleLogout() {
        logout();
        goto("/login");
    }
</script>

<h1>Authenticated</h1>
<p>You are logged in!</p>
<button on:click={handleLogout}>Logout</button>
